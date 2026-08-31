const algebraicFiles = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export function toRank(index: number) {
  return Math.floor(index / 8);
}

export function toFile(index: number) {
  return index % 8;
}

export function toIndex(rank: number, file: number) {
  return rank * 8 + file;
}

export function toAlgebraic(index: number) {
  return `${algebraicFiles[toFile(index)]}${toRank(index) + 1}`;
}
