import { computed, ref } from 'vue';
import * as c from '@/types';
import * as utils from '@/utils';

export default function useBoard(initialBoardState: number[] = Array(64).fill(0)) {
  const board8x8 = ref<number[]>(initialBoardState);
  const board10x12 = computed<number[]>(() => to10x12(board8x8.value));

  const to10x12 = (board8x8: number[]): number[] => {
    const board10x12: number[] = new Array(120).fill(c.offBoard);

    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const index8x8 = rank * 8 + file;
        const index10x12 = (rank + 2) * 10 + (file + 1);
        board10x12[index10x12] = board8x8[index8x8] ?? c.empty;
      }
    }

    return board10x12;
  };

  const loadFEN = (boardState8x8: number[], fen: c.FEN = c.startingPositionFEN) => {
    const fenFields = fen.split(' ');
    const piecePlacementField = fenFields[0]!;

    let currentRank = 7;
    let currentFile = 0;

    for (let char of piecePlacementField) {
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
  };

  return {
    board8x8,
    board10x12,
    loadFEN,
  };
}
