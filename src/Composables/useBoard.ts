import { computed, ref } from 'vue';
import * as c from '@/types';
import * as utils from '@/utils';
import * as mg from '@/moveGenerator';

export default function useBoard(initialBoardState: number[] = Array(64).fill(0)) {
  const board8x8 = ref<number[]>(initialBoardState);
  const board10x12 = computed<number[]>(() => utils.to10x12(board8x8.value));
  const currentPlayer = ref<c.Color>(c.Color.white);
  const legalMoves = computed<c.Move[]>(() =>
    mg.generatePseudolegalMoves(board10x12.value, currentPlayer.value),
  );

  const loadFEN = (boardState8x8: number[], fen: c.FEN = c.startingPositionFEN) => {
    const fenFields = fen.split(' ');
    const piecePlacementField = fenFields[0]!;
    const currentPlayerField = fenFields[1]!;

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

    currentPlayer.value = currentPlayerField === 'w' ? c.Color.white : c.Color.black;
  };

  const switchPlayer = (player: c.Color) => {
    return player === c.Color.white ? c.Color.black : c.Color.white;
  };

  return {
    board8x8,
    board10x12,
    legalMoves,
    currentPlayer,
    switchPlayer,
    loadFEN,
  };
}
