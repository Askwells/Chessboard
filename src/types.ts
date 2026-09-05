// prettier-ignore
export const enum PieceType {
  pawn   =  1,
  knight =  2,
  bishop =  3,
  rook   =  4,
  queen  =  5,
  king   =  6,
}

// prettier-ignore
export const enum Piece {
  whitePawn   =  1,
  whiteKnight =  2,
  whiteBishop =  3,
  whiteRook   =  4,
  whiteQueen  =  5,
  whiteKing   =  6,
  blackPawn   = -1,
  blackKnight = -2,
  blackBishop = -3,
  blackRook   = -4,
  blackQueen  = -5,
  blackKing   = -6,
}

export const empty = 0;
export const offBoard = -99;

export const enum Color {
  white = 0,
  black = 1,
}

export enum MoveType {
  Normal,
  CastleKingside,
  CastleQueenside,
  DoublePawnPush,
  EnPassant,
  PawnPromotion,
}

export type Move = {
  originSquare: number;
  targetSquare: number;
  type: MoveType;
  isCapture?: boolean;
};

export type FEN = string;
export const startingPositionFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
