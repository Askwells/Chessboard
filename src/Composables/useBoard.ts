import { Color, PieceType, type FEN, type Square } from '@/types';
import { ref } from 'vue';
import * as utils from '@/utils';

export default function useBoard(initialState: Square[] = Array(64).fill(null)) {
  const board = ref<Square[]>(initialState);

  const loadFEN = (fen: FEN, boardState: Square[]) => {
    const fenFields = fen.split(' ');
    const piecePlacementField = fenFields[0]!;

    let currentRank = 7;
    let currentFile = 0;

    for (const char of piecePlacementField) {
      if (char === '/') {
        currentRank--;
        currentFile = 0;
      } else if (/^\d$/.test(char)) {
        currentFile += Number(char);
      } else {
        const color = char === char.toLowerCase() ? Color.BLACK : Color.WHITE;
        const type = char.toLowerCase() as PieceType;
        boardState[utils.toIndex(currentRank, currentFile)] = { color, type };
        currentFile++;
      }
    }
  };

  return { board, loadFEN };
}
