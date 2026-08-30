export function toRank(index: number) {
  return Math.floor(index / 8);
}

export function toFile(index: number) {
  return index % 8;
}

export function toIndex(rank: number, file: number) {
  return rank * 8 + file;
}
