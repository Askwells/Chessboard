export enum Color {
  White = 'w',
  Black = 'b',
}

export enum PieceType {
  Pawn = 'p',
  Knight = 'n',
  Bishop = 'b',
  Rook = 'r',
  Queen = 'q',
  King = 'k',
}

export type Piece = {
  color: Color;
  type: PieceType;
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
  piece: Piece;
};

export type Square = Piece | null;

export type FEN = string;
