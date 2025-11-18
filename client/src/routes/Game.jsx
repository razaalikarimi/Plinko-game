import React, { useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';

import { commitRound, startRound, revealRound } from '../lib/api';
import { PegBoard } from '../components/PegBoard';
import { ControlsPanel } from '../components/ControlsPanel';
import { FairnessPanel } from '../components/FairnessPanel';
import { Paytable } from '../components/Paytable';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { usePegAudio } from '../hooks/usePegAudio';

const ROWS = 12;
const STEP_DURATION = 240;

export default function GamePage() {
  const [round, setRound] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [clientSeed, setClientSeed] = useState(() => {
    if (typeof window === 'undefined') {
      return 'player-seed';
    }
    const stored = window.localStorage.getItem('client-seed');
    const randomSource = globalThis.crypto?.randomUUID
      ? globalThis.crypto.randomUUID().slice(0, 6)
      : Math.random().toString(16).slice(2, 8);
    return stored || `player-${randomSource}`;
  });
  const [betAmount, setBetAmount] = useState('1.00');
  const [dropColumn, setDropColumn] = useState(6);
  const [path, setPath] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [binIndex, setBinIndex] = useState(null);
  const [tiltMode, setTiltMode] = useState(false);
  const [muted, setMuted] = useState(false);
  const [goldenActive, setGoldenActive] = useState(false);
  const [isDropping, setIsDropping] = useState(false);
  const [recentBins, setRecentBins] = useState([]);
  const reduceMotion = usePrefersReducedMotion();
  const { playClick } = usePegAudio({ muted, disabled: reduceMotion });

  const timeoutsRef = useRef([]);
  const droppingRef = useRef(false);

  const goldenReady =
    recentBins.length === 3 && recentBins.every((bin) => bin === 6);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('client-seed', clientSeed);
  }, [clientSeed]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const animatePath = useCallback(
    (pathSteps, resolvedBin) => {
      setPath(pathSteps);
      setActiveIndex(-1);
      setBinIndex(null);
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];

      if (!pathSteps?.length) {
        setBinIndex(resolvedBin);
        return;
      }

      if (reduceMotion) {
        setActiveIndex(pathSteps.length - 1);
        setBinIndex(resolvedBin);
        return;
      }

      pathSteps.forEach((step, idx) => {
        const timeout = setTimeout(() => {
          setActiveIndex(idx);
          playClick();
          if (idx === pathSteps.length - 1) {
            setBinIndex(resolvedBin);
            if (!reduceMotion) {
              confetti({
                particleCount: goldenActive ? 200 : 90,
                spread: goldenActive ? 80 : 45,
                origin: { y: 0.2 }
              });
            }
          }
        }, idx * STEP_DURATION);
        timeoutsRef.current.push(timeout);
      });
    },
    [playClick, reduceMotion, goldenActive]
  );

  const prepareRound = useCallback(async () => {
    try {
      setStatusMessage('Syncing commit…');
      setError('');
      const data = await commitRound();
      setRound({
        ...data,
        status: 'CREATED'
      });
      setPath([]);
      setActiveIndex(-1);
      setBinIndex(null);
      droppingRef.current = false;
      setStatusMessage('Ready to drop');
    } catch (err) {
      setError(err.message);
      setStatusMessage('Unable to commit');
    }
  }, []);

  useEffect(() => {
    prepareRound();
  }, [prepareRound]);

  const handleDrop = useCallback(async () => {
    if (!round?.roundId || droppingRef.current) return;
    if (!clientSeed.trim()) {
      setError('Client seed is required.');
      return;
    }
    const parsedBet = parseFloat(betAmount || '0');
    const normalizedBet = Number.isFinite(parsedBet) ? parsedBet : 0;
    const betCents = Math.max(1, Math.round(normalizedBet * 100));

    try {
      setError('');
      droppingRef.current = true;
      setIsDropping(true);
      setStatusMessage('Dropping…');
      setGoldenActive(goldenReady);

      const payload = {
        clientSeed,
        betCents,
        dropColumn
      };
      const data = await startRound(round.roundId, payload);
      setRound((prev) => ({
        ...prev,
        ...data,
        clientSeed,
        betCents,
        dropColumn,
        status: 'STARTED'
      }));
      animatePath(data.path, data.binIndex);
      await revealRound(round.roundId)
        .then((reveal) => {
          setRound((prev) => ({
            ...prev,
            serverSeed: reveal.serverSeed,
            status: 'REVEALED'
          }));
        })
        .catch(() => {
          // best-effort reveal
        });

      setRecentBins((prev) => [...prev, data.binIndex].slice(-3));
      setStatusMessage(
        `Landed in bin ${data.binIndex} · +${data.payoutMultiplier.toFixed(
          2
        )}x`
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setGoldenActive(false);
      droppingRef.current = false;
      setIsDropping(false);
    }
  }, [
    round,
    clientSeed,
    betAmount,
    dropColumn,
    animatePath,
    goldenReady
  ]);

  const handleKeydown = useCallback(
    (event) => {
      if (['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return;
      if (event.key === 'ArrowLeft') {
        setDropColumn((prev) => Math.max(0, prev - 1));
      }
      if (event.key === 'ArrowRight') {
        setDropColumn((prev) => Math.min(ROWS, prev + 1));
      }
      if (event.key === ' ') {
        event.preventDefault();
        if (!droppingRef.current) {
          handleDrop();
        }
      }
      if (event.key.toLowerCase() === 't') {
        setTiltMode((prev) => !prev);
      }
    },
    [handleDrop]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [handleKeydown]);

  const canDrop = Boolean(round?.status === 'CREATED');

  return (
    <div className="game-grid">
      <div className="board-column">
        <PegBoard
          path={path}
          activeIndex={activeIndex}
          binIndex={binIndex}
          tiltMode={tiltMode}
          golden={goldenActive}
          dropColumn={dropColumn}
        />
        <div className="status-bar">
          <span>{statusMessage}</span>
          {error && <span className="status-error">{error}</span>}
        </div>
      </div>

      <div className="side-column">
        <ControlsPanel
          clientSeed={clientSeed}
          onSeedChange={setClientSeed}
          betAmount={betAmount}
          onBetChange={setBetAmount}
          dropColumn={dropColumn}
          onColumnChange={setDropColumn}
          onDrop={handleDrop}
          dropping={isDropping}
          canDrop={canDrop}
          onNewRound={prepareRound}
          muted={muted}
          onToggleMute={() => setMuted((m) => !m)}
          tiltMode={tiltMode}
          onToggleTilt={() => setTiltMode((t) => !t)}
          goldenReady={goldenReady}
        />

        <FairnessPanel
          roundId={round?.roundId}
          status={round?.status || '—'}
          commitHex={round?.commitHex}
          pegMapHash={round?.pegMapHash}
          payoutMultiplier={round?.payoutMultiplier}
          combinedSeed={round?.combinedSeed}
          clientSeed={round?.clientSeed}
          serverSeed={round?.serverSeed}
          nonce={round?.nonce}
          dropColumn={round?.dropColumn}
        />

        <Paytable />
      </div>
    </div>
  );
}

