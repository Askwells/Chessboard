export enum Color {
  WHITE = 'w',
  BLACK = 'b',
}

export enum PieceType {
  PAWN = 'p',
  KNIGHT = 'n',
  BISHOP = 'b',
  ROOK = 'r',
  QUEEN = 'q',
  KING = 'k',
}

export type Piece = {
  color: Color;
  type: PieceType;
};

export type Move = {
  originSquare: number;
  targetSquare: number;
};

export type Square = Piece | null;

export type FEN = string;
