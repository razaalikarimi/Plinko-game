function xorshift32(seed) {
  let x = seed >>> 0 || 0x9e3779b9;
  return function rand() {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return ((x >>> 0) / 4294967296);
  };
}

function seedFromHex(combinedSeedHex) {
  const firstEight = combinedSeedHex.slice(0, 8);
  return parseInt(firstEight, 16) >>> 0;
}

module.exports = {
  xorshift32,
  seedFromHex
};

