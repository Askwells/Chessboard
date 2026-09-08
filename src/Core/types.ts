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

export type CastlingRights = {
  whiteKingside: boolean;
  whiteQueenside: boolean;
  blackKingside: boolean;
  blackQueenside: boolean;
};

export type StateMeta = {
  currentPlayer: Color;
  castlingRights: CastlingRights;
  enPassantTargetSquare: number | null;
  halfmoveClock: number;
  fullmoveNumber: number;
};

export type State = {
  board: number[];
  meta: StateMeta;
};

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

export const a1 = 0;
export const b1 = 1;
export const c1 = 2;
export const d1 = 3;
export const e1 = 4;
export const f1 = 5;
export const g1 = 6;
export const h1 = 7;
export const a2 = 8;
export const b2 = 9;
export const c2 = 10;
export const d2 = 11;
export const e2 = 12;
export const f2 = 13;
export const g2 = 14;
export const h2 = 15;
export const a3 = 16;
export const b3 = 17;
export const c3 = 18;
export const d3 = 19;
export const e3 = 20;
export const f3 = 21;
export const g3 = 22;
export const h3 = 23;
export const a4 = 24;
export const b4 = 25;
export const c4 = 26;
export const d4 = 27;
export const e4 = 28;
export const f4 = 29;
export const g4 = 30;
export const h4 = 31;
export const a5 = 32;
export const b5 = 33;
export const c5 = 34;
export const d5 = 35;
export const e5 = 36;
export const f5 = 37;
export const g5 = 38;
export const h5 = 39;
export const a6 = 40;
export const b6 = 41;
export const c6 = 42;
export const d6 = 43;
export const e6 = 44;
export const f6 = 45;
export const g6 = 46;
export const h6 = 47;
export const a7 = 48;
export const b7 = 49;
export const c7 = 50;
export const d7 = 51;
export const e7 = 52;
export const f7 = 53;
export const g7 = 54;
export const h7 = 55;
export const a8 = 56;
export const b8 = 57;
export const c8 = 58;
export const d8 = 59;
export const e8 = 60;
export const f8 = 61;
export const g8 = 62;
export const h8 = 63;
