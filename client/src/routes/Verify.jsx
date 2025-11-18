import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { verifySeeds } from '../lib/api';
import { PegBoard } from '../components/PegBoard';

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    serverSeed: '',
    clientSeed: '',
    nonce: '',
    dropColumn: 6,
    roundId: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm((prev) => {
      const dropValue = searchParams.get('dropColumn');
      return {
        ...prev,
        serverSeed: searchParams.get('serverSeed') || prev.serverSeed,
        clientSeed: searchParams.get('clientSeed') || prev.clientSeed,
        nonce: searchParams.get('nonce') || prev.nonce,
        dropColumn:
          dropValue !== null && Number.isFinite(Number(dropValue))
            ? Number(dropValue)
            : prev.dropColumn,
        roundId: searchParams.get('roundId') || prev.roundId
      };
    });
  }, [searchParams]);

  const verdict = useMemo(() => {
    if (!result) return null;
    if (!result.roundComparison) return 'computed';
    const allMatch = Object.entries(result.roundComparison).every(([key, value]) => {
      if (typeof value !== 'boolean') return true;
      return value;
    });
    return allMatch ? 'verified' : 'mismatch';
  }, [result]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      const response = await verifySeeds({
        ...form,
        dropColumn: form.dropColumn
      });
      setResult(response);
    } catch (err) {
      setResult(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyPath = result?.path ?? [];
  const verifyActiveIndex = verifyPath.length ? verifyPath.length - 1 : -1;

  return (
    <div className="verify-layout">
      <section className="panel">
        <div className="panel-header">
          <h2>Public Verifier</h2>
          {verdict && (
            <span
              className={`verdict ${verdict}`}
              aria-live="polite"
            >
              {verdict === 'verified' && '✔ Verified'}
              {verdict === 'mismatch' && '✘ Mismatch'}
              {verdict === 'computed' && 'ℹ Replay'}
            </span>
          )}
        </div>

        <form className="verify-form" onSubmit={handleSubmit}>
          <label>
            Server seed
            <input
              type="text"
              value={form.serverSeed}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, serverSeed: e.target.value }))
              }
              required
            />
          </label>
          <label>
            Client seed
            <input
              type="text"
              value={form.clientSeed}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, clientSeed: e.target.value }))
              }
              required
            />
          </label>
          <label>
            Nonce
            <input
              type="text"
              value={form.nonce}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, nonce: e.target.value }))
              }
              required
            />
          </label>
          <label>
            Drop column
            <input
              type="number"
              min="0"
              max="12"
              value={form.dropColumn}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  dropColumn: Number(e.target.value)
                }))
              }
              required
            />
          </label>
          <label>
            Round ID (optional)
            <input
              type="text"
              value={form.roundId}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, roundId: e.target.value }))
              }
            />
          </label>
          <button type="submit" className="primary" disabled={loading}>
            {loading ? 'Verifying…' : 'Verify'}
          </button>
        </form>

        {error && <p className="status-error">{error}</p>}
      </section>

      {result && (
        <section className="panel verify-result">
          <div className="panel-header">
            <h3>Recomputed Artifacts</h3>
          </div>
          <dl>
            <div>
              <dt>Commit</dt>
              <dd className="mono">{result.commitHex}</dd>
            </div>
            <div>
              <dt>Combined seed</dt>
              <dd className="mono">{result.combinedSeed}</dd>
            </div>
            <div>
              <dt>Peg map hash</dt>
              <dd className="mono">{result.pegMapHash}</dd>
            </div>
            <div>
              <dt>Bin index</dt>
              <dd>{result.binIndex}</dd>
            </div>
          </dl>

          {result.roundComparison && (
            <div className="comparison">
              <h4>Round Match</h4>
              <ul>
                <li>
                  Commit:{' '}
                  {result.roundComparison.commitMatch ? '✔' : '✘'}
                </li>
                <li>
                  Combined seed:{' '}
                  {result.roundComparison.combinedSeedMatch ? '✔' : '✘'}
                </li>
                <li>
                  Peg map:{' '}
                  {result.roundComparison.pegMapHashMatch ? '✔' : '✘'}
                </li>
                <li>
                  Bin:{' '}
                  {result.roundComparison.binIndexMatch ? '✔' : '✘'}
                </li>
              </ul>
            </div>
          )}

          <div className="verify-pegboard">
            <PegBoard
              path={verifyPath}
              activeIndex={verifyActiveIndex}
              binIndex={result.binIndex}
              tiltMode={false}
              golden={false}
              dropColumn={form.dropColumn}
            />
          </div>
        </section>
      )}
    </div>
  );
}

