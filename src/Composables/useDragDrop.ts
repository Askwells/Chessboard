import { ref } from 'vue';
import * as c from '@/types';

type DragState = {
  pieceElement: HTMLElement;
  originSquare: number;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
};

let currentDrag = ref<DragState | null>(null);

export default function useDragDrop(
  onDragStart: (square: number) => void,
  onMove: (move: c.Move) => void,
) {
  const dragStart = (ev: PointerEvent, square: number) => {
    if (ev.pointerType !== 'mouse') return;
    // Accept only left mouse button input
    if (ev.button !== 0) return;

    const pieceElement = ev.currentTarget as HTMLElement;
    const rect = pieceElement.getBoundingClientRect();

    currentDrag.value = {
      pieceElement,
      originSquare: square,
      x: ev.clientX,
      y: ev.clientY,
      offsetX: ev.clientX - rect.left,
      offsetY: ev.clientY - rect.top,
    };

    onDragStart(square);
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

    if (squareElement) {
      onMove({
        originSquare: currentDrag.value.originSquare,
        targetSquare: Number(squareElement.id),
        type: c.MoveType.Normal,
      });
    }

    currentDrag.value.pieceElement.style.setProperty('pointer-events', 'all');
    currentDrag.value = null;
  };

  return { dragStart, dragging, dragEnd, currentDrag };
}
