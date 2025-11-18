const PAYTABLE = [
  18, // bin 0
  9,
  6,
  4.5,
  3,
  2,
  1,
  2,
  3,
  4.5,
  6,
  9,
  18 // bin 12
];

function getPayoutMultiplier(binIndex) {
  return PAYTABLE[binIndex] ?? 0;
}

module.exports = {
  PAYTABLE,
  getPayoutMultiplier
};

