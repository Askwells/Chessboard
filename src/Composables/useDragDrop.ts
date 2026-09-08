import { ref } from 'vue';
import * as c from '@/Core/types';

type DragState = {
  pieceElement: HTMLElement;
  originSquare: number;
  hoveredSquare: number | null;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
};

let currentDrag = ref<DragState | null>(null);

export default function useDragDrop(
  onDragStart: (index: number) => void,
  onDragEnd: (move: c.Move) => void,
) {
  const dragStart = (ev: PointerEvent, index: number) => {
    if (ev.pointerType !== 'mouse') return;
    // Accept only left mouse button input
    if (ev.button !== 0) return;

    const pieceElement = ev.currentTarget as HTMLElement;
    const rect = pieceElement.getBoundingClientRect();

    currentDrag.value = {
      pieceElement,
      originSquare: index,
      hoveredSquare: index,
      x: ev.clientX,
      y: ev.clientY,
      offsetX: ev.clientX - rect.left,
      offsetY: ev.clientY - rect.top,
    };

    onDragStart(index);
  };

  const dragging = (ev: PointerEvent) => {
    if (currentDrag.value) {
      currentDrag.value.x = ev.clientX;
      currentDrag.value.y = ev.clientY;
      const hovered = squareUnderPoint(currentDrag.value.x, currentDrag.value.y);
      currentDrag.value.hoveredSquare = hovered ? Number(hovered.id) : null;
    }
  };

  const dragEnd = () => {
    if (!currentDrag.value) return;

    const squareElement = squareUnderPoint(currentDrag.value.x, currentDrag.value.y);

    if (squareElement) {
      onDragEnd({
        originSquare: currentDrag.value.originSquare,
        targetSquare: Number(squareElement.id),
        type: c.MoveType.Normal,
      });
    }

    currentDrag.value = null;
  };

  const squareUnderPoint = (x: number, y: number): HTMLElement | null => {
    const elements = document.elementsFromPoint(x, y);
    for (const el of elements) {
      if (el === currentDrag.value?.pieceElement) continue;
      const square = el.closest('.Square') as HTMLElement | null;
      if (square) return square;
    }
    return null;
  };

  return { dragStart, dragging, dragEnd, currentDrag };
}
