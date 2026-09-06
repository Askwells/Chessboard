import { computed, ref, toRef } from 'vue';
import * as c from '@/types';
import * as utils from '@/utils';
import * as mg from '@/moveGenerator';

export default function useBoard(initialBoardState: number[] = Array(64).fill(0)) {
  const board8x8 = ref<number[]>(initialBoardState);
  const board10x12 = computed<number[]>(() => utils.to10x12(board8x8.value));

  const positionMeta = ref<c.PositionMeta>({
    currentPlayer: c.Color.white,
    castlingRights: {
      whiteKingside: false,
      whiteQueenside: false,
      blackKingside: false,
      blackQueenside: false,
    },
    enPassantTargetSquare: null,
    halfmoveClock: 0,
    fullmoveNumber: 1,
  });

  const legalMoves = computed<c.Move[]>(() =>
    mg.generatePseudolegalMoves(
      board10x12.value,
      positionMeta.value,
      positionMeta.value.currentPlayer,
    ),
  );

  const loadFEN = (boardState8x8: number[], fen: c.FEN = c.startingPositionFEN) => {
    const fenFields = fen.split(' ');
    const piecePlacementField = fenFields[0]!;
    const currentPlayerField = fenFields[1]!;
    const castlingRightsField = fenFields[2]!;

    boardState8x8.fill(c.empty);

    let currentRank = 7;
    let currentFile = 0;

    for (const char of piecePlacementField) {
      if (char === '/') {
        currentRank--;
        currentFile = 0;
      } else if (/^\d+$/.test(char)) {
        currentFile += Number(char);
      } else {
        const currentIndex = utils.toIndex(currentRank, currentFile);
        const pieceType = utils.pieceTypeFromChar(char.toLowerCase());

        boardState8x8[currentIndex] = (char === char.toLowerCase() ? -1 : 1) * pieceType!;
        currentFile++;
      }
    }

    positionMeta.value.currentPlayer = currentPlayerField === 'w' ? c.Color.white : c.Color.black;

    positionMeta.value.castlingRights = {
      whiteKingside: false,
      whiteQueenside: false,
      blackKingside: false,
      blackQueenside: false,
    };

    for (const char of castlingRightsField) {
      switch (char) {
        case 'K':
          positionMeta.value.castlingRights.whiteKingside = true;
          break;
        case 'Q':
          positionMeta.value.castlingRights.whiteQueenside = true;
          break;
        case 'k':
          positionMeta.value.castlingRights.blackKingside = true;
          break;
        case 'q':
          positionMeta.value.castlingRights.blackQueenside = true;
          break;
      }
    }
  };

  const switchPlayer = (player: c.Color) => {
    return player === c.Color.white ? c.Color.black : c.Color.white;
  };

  const makeMove = (move: c.Move, boardState8x8: number[], positionMeta: c.PositionMeta) => {
    if (move.originSquare === c.e1 || move.targetSquare === c.e1) {
      positionMeta.castlingRights.whiteKingside = false;
      positionMeta.castlingRights.whiteQueenside = false;
    }

    if (move.originSquare === c.e8 || move.targetSquare === c.e8) {
      positionMeta.castlingRights.blackKingside = false;
      positionMeta.castlingRights.blackQueenside = false;
    }

    boardState8x8[move.targetSquare] = boardState8x8[move.originSquare] as number;

    if (move.type === c.MoveType.PawnPromotion) {
      boardState8x8[move.targetSquare] =
        utils.getPieceColor(boardState8x8[move.targetSquare]!) === c.Color.white
          ? c.Piece.whiteQueen
          : c.Piece.blackQueen;
    } else if (move.type === c.MoveType.CastleKingside) {
      const isWhite = utils.getPieceColor(boardState8x8[move.targetSquare]!) === c.Color.white;
      const rookOrigin = isWhite ? c.h1 : c.h8;
      const rookTarget = isWhite ? c.f1 : c.f8;
      boardState8x8[rookTarget] = boardState8x8[rookOrigin]!;
      boardState8x8[rookOrigin] = c.empty;
    } else if (move.type === c.MoveType.CastleQueenside) {
      const isWhite = utils.getPieceColor(boardState8x8[move.targetSquare]!) === c.Color.white;
      const rookOrigin = isWhite ? c.a1 : c.a8;
      const rookTarget = isWhite ? c.d1 : c.d8;
      boardState8x8[rookTarget] = boardState8x8[rookOrigin]!;
      boardState8x8[rookOrigin] = c.empty;
    }

    boardState8x8[move.originSquare] = c.empty;
  };

  return {
    board8x8,
    board10x12,
    legalMoves,
    positionMeta,
    switchPlayer,
    loadFEN,
    makeMove,
  };
}
