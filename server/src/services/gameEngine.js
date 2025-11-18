const { sha256Hex } = require('../utils/hash');
const { xorshift32, seedFromHex } = require('../utils/prng');
const { getPayoutMultiplier } = require('../utils/paytable');

const ROWS = 12;
const CENTER_COLUMN = Math.floor(ROWS / 2);

function deriveCommit(serverSeed, nonce) {
  return sha256Hex(`${serverSeed}:${nonce}`);
}

function deriveCombinedSeed(serverSeed, clientSeed, nonce) {
  return sha256Hex(`${serverSeed}:${clientSeed}:${nonce}`);
}

function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function buildPegMap(prng) {
  // For each row r (0-based), create r+1 pegs, each with a leftBias ∈ [0.4, 0.6]
  const pegMap = Array.from({ length: ROWS }, (_, row) => {
    const pegs = Array.from({ length: row + 1 }, () => {
      const leftBiasRaw = 0.5 + (prng() - 0.5) * 0.2;
      return Number(leftBiasRaw.toFixed(6));
    });
    return pegs;
  });

  return pegMap;
}

function simulatePath(prng, dropColumn, pegMap) {
  const adj = Number(((dropColumn - CENTER_COLUMN) * 0.01).toFixed(6));

  let pos = 0;
  const steps = [];

  for (let row = 0; row < ROWS; row += 1) {
    // Use the peg at index min(pos, row) (peg under current path)
    const pegIndex = Math.min(pos, row);
    const leftBias = pegMap[row][pegIndex];
    const biasPrime = Number(clamp(leftBias + adj, 0, 1).toFixed(6));

    const rnd = prng();
    const direction = rnd < biasPrime ? 'L' : 'R';
    if (direction === 'R') {
      pos += 1;
    }
    steps.push({
      row,
      rnd: Number(rnd.toFixed(10)),
      direction,
      position: pos,
      pegIndex,
      leftBias,
      adjustedBias: biasPrime
    });
  }

  const binIndex = pos;
  const payoutMultiplier = getPayoutMultiplier(binIndex);

  return {
    binIndex,
    payoutMultiplier,
    path: steps,
    adjustment: adj
  };
}

function createRoundArtifacts({ serverSeed, clientSeed, nonce, dropColumn }) {
  const commitHex = deriveCommit(serverSeed, nonce);
  const combinedSeed = deriveCombinedSeed(serverSeed, clientSeed, nonce);
  const seed = seedFromHex(combinedSeed);
  const prng = xorshift32(seed);

  // First: generate peg map (uses PRNG stream)
  const pegMap = buildPegMap(prng);
  const pegMapHash = sha256Hex(JSON.stringify(pegMap));
  
  // Then: simulate path (continues using same PRNG stream)
  const simulation = simulatePath(prng, dropColumn, pegMap);

  return {
    commitHex,
    combinedSeed,
    pegMap,
    pegMapHash,
    ...simulation
  };
}

function samplePrngOutputs(hexSeed, count = 5) {
  const seed = seedFromHex(hexSeed);
  const prng = xorshift32(seed);
  return Array.from({ length: count }, () => Number(prng().toFixed(10)));
}

module.exports = {
  ROWS,
  CENTER_COLUMN,
  deriveCommit,
  deriveCombinedSeed,
  createRoundArtifacts,
  simulatePath,
  buildPegMap,
  samplePrngOutputs
};

