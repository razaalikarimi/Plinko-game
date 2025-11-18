import { useCallback, useRef } from 'react';

export function usePegAudio({ muted, disabled }) {
  const audioRef = useRef(null);

  const ensureContext = () => {
    if (!audioRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioRef.current = new AudioContext();
    }
    return audioRef.current;
  };

  const playClick = useCallback(() => {
    if (muted || disabled) return;
    const ctx = ensureContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.value = 420 + Math.random() * 80;
    osc.type = 'triangle';
    gain.gain.value = 0.15;

    osc.connect(gain).connect(ctx.destination);
    const now = ctx.currentTime;
    osc.start(now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.stop(now + 0.2);
  }, [muted, disabled]);

  return { playClick };
}

