import { ref, computed } from 'vue';
import * as c from '@/Core/types';
import * as utils from '@/Core/utils';
import * as mg from '@/Core/moveGenerator';

export default function useBoard(
  initialState: c.State = {
    board: Array(64).fill(c.empty),
    meta: {
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
    },
  },
) {
  const state = ref<c.State>(initialState);

  const board10x12 = computed<number[]>(() => utils.to10x12(state.value.board));
  const legalMoves = computed<c.Move[]>(() =>
    mg.generatePseudolegalMoves(board10x12.value, state.value.meta),
  );

  const loadFEN = (fen: c.FEN = c.startingPositionFEN): c.State => {
    const board: number[] = Array(64).fill(c.empty);

    const fenFields = fen.split(' ');
    const piecePlacementField = fenFields[0]!;
    const currentPlayerField = fenFields[1]!;
    const castlingRightsField = fenFields[2]!;

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

        board[currentIndex] = (char === char.toLowerCase() ? -1 : 1) * pieceType!;
        currentFile++;
      }
    }

    const castlingRights: c.CastlingRights = {
      whiteKingside: false,
      whiteQueenside: false,
      blackKingside: false,
      blackQueenside: false,
    };

    for (const char of castlingRightsField) {
      switch (char) {
        case 'K':
          castlingRights.whiteKingside = true;
          break;
        case 'Q':
          castlingRights.whiteQueenside = true;
          break;
        case 'k':
          castlingRights.blackKingside = true;
          break;
        case 'q':
          castlingRights.blackQueenside = true;
          break;
      }
    }

    return {
      board,
      meta: {
        currentPlayer: currentPlayerField === 'w' ? c.Color.white : c.Color.black,
        castlingRights,
        enPassantTargetSquare: null,
        halfmoveClock: 0,
        fullmoveNumber: 1,
      },
    };
  };

  const switchPlayer = (player: c.Color): c.Color =>
    player === c.Color.white ? c.Color.black : c.Color.white;

  const makeMove = (move: c.Move, fromState: c.State): c.State => {
    const board = fromState.board.slice();
    const meta: c.StateMeta = {
      ...fromState.meta,
      castlingRights: { ...fromState.meta.castlingRights },
    };

    const kingSquare = meta.currentPlayer === c.Color.white ? c.e1 : c.e8;

    if (move.originSquare === kingSquare || move.targetSquare === kingSquare) {
      if (meta.currentPlayer === c.Color.white) {
        meta.castlingRights.whiteKingside = false;
        meta.castlingRights.whiteQueenside = false;
      } else {
        meta.castlingRights.blackKingside = false;
        meta.castlingRights.blackQueenside = false;
      }
    }

    board[move.targetSquare] = board[move.originSquare]!;
    board[move.originSquare] = c.empty;

    if (move.type === c.MoveType.PawnPromotion) {
      board[move.targetSquare] =
        utils.getPieceColor(board[move.targetSquare]!) === c.Color.white
          ? c.Piece.whiteQueen
          : c.Piece.blackQueen;
    } else if (move.type === c.MoveType.CastleKingside) {
      const isWhite = utils.getPieceColor(board[move.targetSquare]!) === c.Color.white;
      const rookOrigin = isWhite ? c.h1 : c.h8;
      const rookTarget = isWhite ? c.f1 : c.f8;
      board[rookTarget] = board[rookOrigin]!;
      board[rookOrigin] = c.empty;
    } else if (move.type === c.MoveType.CastleQueenside) {
      const isWhite = utils.getPieceColor(board[move.targetSquare]!) === c.Color.white;
      const rookOrigin = isWhite ? c.a1 : c.a8;
      const rookTarget = isWhite ? c.d1 : c.d8;
      board[rookTarget] = board[rookOrigin]!;
      board[rookOrigin] = c.empty;
    }

    return { board, meta };
  };

  return {
    state,
    legalMoves,
    switchPlayer,
    loadFEN,
    makeMove,
  };
}
