import type { Move, Piece, Square } from '@/types';
import { ref } from 'vue';

type DragState = {
  piece: Piece;
  pieceElement: HTMLElement;
  originSquare: number;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
};

let currentDrag = ref<DragState | null>(null);

export default function useDragDrop(boardState: Square[]) {
  const dragStart = (ev: PointerEvent, square: number, piece: Piece) => {
    const pieceElement = ev.currentTarget as HTMLElement;
    const rect = pieceElement.getBoundingClientRect();

    currentDrag.value = {
      piece,
      pieceElement,
      originSquare: square,
      x: ev.clientX,
      y: ev.clientY,
      offsetX: ev.clientX - rect.left,
      offsetY: ev.clientY - rect.top,
    };
  };

  const dragging = (ev: PointerEvent) => {
    if (currentDrag.value) {
      currentDrag.value.x = ev.clientX;
      currentDrag.value.y = ev.clientY;
    }
  };

  const dragEnd = (ev: PointerEvent) => {
    if (!currentDrag.value) return;

    currentDrag.value.pieceElement.style.setProperty('pointer-events', 'none');
    const el = document.elementFromPoint(currentDrag.value.x, currentDrag.value.y);
    const squareElement = el?.closest('.Square') as HTMLElement | null;

    if (squareElement && boardState[Number(squareElement.id)] === null) {
      boardState[Number(squareElement.id)] = currentDrag.value.piece;
      boardState[currentDrag.value.originSquare] = null;
    }

    currentDrag.value.pieceElement.style.setProperty('pointer-events', 'all');
    currentDrag.value = null;
  };

  return { dragStart, dragging, dragEnd, currentDrag };
}
