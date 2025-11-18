export const PAYTABLE = [
  18,
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
  18
];

export function multiplierForBin(index) {
  return PAYTABLE[index] ?? 0;
}

