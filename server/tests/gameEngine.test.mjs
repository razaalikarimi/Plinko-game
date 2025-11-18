import { describe, it, expect } from 'vitest';
import engineModule from '../src/services/gameEngine.js';

const {
  deriveCommit,
  deriveCombinedSeed,
  createRoundArtifacts,
  samplePrngOutputs
} = engineModule;

const VECTOR = {
  serverSeed: 'b2a5f3f32a4d9c6ee7a8c1d33456677890abcdeffedcba0987654321ffeeddcc',
  nonce: '42',
  clientSeed: 'candidate-hello',
  dropColumn: 6,
  commitHex: 'bb9acdc67f3f18f3345236a01f0e5072596657a9005c7d8a22cff061451a6b34',
  combinedSeed: 'e1dddf77de27d395ea2be2ed49aa2a59bd6bf12ee8d350c16c008abd406c07e0',
  prng: [
    0.1106166649,
    0.7625129214,
    0.0439292176,
    0.4578678815,
    0.3438999297
  ]
};

describe('game engine determinism', () => {
  it('matches commit and combined seed test vector', () => {
    expect(
      deriveCommit(VECTOR.serverSeed, VECTOR.nonce)
    ).toBe(VECTOR.commitHex);
    expect(
      deriveCombinedSeed(VECTOR.serverSeed, VECTOR.clientSeed, VECTOR.nonce)
    ).toBe(VECTOR.combinedSeed);
  });

  it('produces deterministic PRNG outputs', () => {
    const outputs = samplePrngOutputs(VECTOR.combinedSeed, VECTOR.prng.length);
    outputs.forEach((value, idx) => {
      expect(value).toBeCloseTo(VECTOR.prng[idx], 9);
    });
  });

  it('creates deterministic peg map and path', () => {
    const first = createRoundArtifacts({
      serverSeed: VECTOR.serverSeed,
      clientSeed: VECTOR.clientSeed,
      nonce: VECTOR.nonce,
      dropColumn: VECTOR.dropColumn
    });
    const second = createRoundArtifacts({
      serverSeed: VECTOR.serverSeed,
      clientSeed: VECTOR.clientSeed,
      nonce: VECTOR.nonce,
      dropColumn: VECTOR.dropColumn
    });

    expect(first.pegMapHash).toBe(second.pegMapHash);
    expect(first.binIndex).toBe(second.binIndex);
    expect(first.path).toEqual(second.path);
  });

  it('produces correct binIndex for center drop (test vector)', () => {
    const artifacts = createRoundArtifacts({
      serverSeed: VECTOR.serverSeed,
      clientSeed: VECTOR.clientSeed,
      nonce: VECTOR.nonce,
      dropColumn: 6 // center
    });
    // Spec says: dropColumn = 6 (center), adj = 0 → binIndex = 6
    expect(artifacts.binIndex).toBe(6);
  });

  it('creates correct peg map structure', () => {
    const artifacts = createRoundArtifacts({
      serverSeed: VECTOR.serverSeed,
      clientSeed: VECTOR.clientSeed,
      nonce: VECTOR.nonce,
      dropColumn: VECTOR.dropColumn
    });
    
    // Verify peg map structure: row r should have r+1 pegs
    expect(artifacts.pegMap).toHaveLength(12); // 12 rows
    artifacts.pegMap.forEach((row, index) => {
      expect(row).toHaveLength(index + 1); // row r has r+1 pegs
      // Each peg should have a leftBias between 0.4 and 0.6
      row.forEach((leftBias) => {
        expect(leftBias).toBeGreaterThanOrEqual(0.4);
        expect(leftBias).toBeLessThanOrEqual(0.6);
      });
    });
  });
});

