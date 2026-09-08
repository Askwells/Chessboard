import * as c from '@/Core/types';

export const indices8x8To10x12 = Array.from({ length: 64 }, (_, index8x8) => {
  return (toRank(index8x8) + 2) * 10 + (toFile(index8x8) + 1);
});

export const indices10x12To8x8 = new Array<number>(120).fill(c.offBoard);
for (let index8x8 = 0; index8x8 < 64; index8x8++) {
  indices10x12To8x8[indices8x8To10x12[index8x8]!] = index8x8;
}

export function toRank(index: number) {
  return Math.floor(index / 8);
}

export function toFile(index: number) {
  return index % 8;
}

export function toIndex(rank: number, file: number) {
  return rank * 8 + file;
}

export function indexToAlgebraic(index: number) {
  return `${['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'][toFile(index)]}${toRank(index) + 1}`;
}

export function getPieceColor(piece: c.Piece) {
  return piece > 0 ? c.Color.white : c.Color.black;
}

export function getPieceType(piece: c.Piece) {
  return Math.abs(piece) as c.PieceType;
}

export function pieceTypeFromChar(char: string) {
  const typeMap: Record<string, c.PieceType> = {
    p: c.PieceType.pawn,
    n: c.PieceType.knight,
    b: c.PieceType.bishop,
    r: c.PieceType.rook,
    q: c.PieceType.queen,
    k: c.PieceType.king,
  };
  return typeMap[char];
}

export function pieceTypeToChar(pieceType: c.PieceType) {
  const charMap: Record<c.PieceType, string> = {
    [c.PieceType.pawn]: 'p',
    [c.PieceType.knight]: 'n',
    [c.PieceType.bishop]: 'b',
    [c.PieceType.rook]: 'r',
    [c.PieceType.queen]: 'q',
    [c.PieceType.king]: 'k',
  };
  return charMap[pieceType];
}

export function to10x12(boardState8x8: number[]): number[] {
  const board10x12: number[] = new Array(120).fill(c.offBoard);

  for (let index8x8 = 0; index8x8 < 64; index8x8++) {
    board10x12[indices8x8To10x12[index8x8]!] = boardState8x8[index8x8] ?? c.empty;
  }

  return board10x12;
}
