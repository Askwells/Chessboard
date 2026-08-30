<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import * as utils from '@/utils.ts';
import useBoard from '@/Composables/useBoard';
import useDragDrop from '@/Composables/useDragDrop';
import type { Move, Piece } from '@/types';

const { board, loadFEN } = useBoard();
const { dragStart, dragging, dragEnd, currentDrag } = useDragDrop(board.value);
loadFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', board.value);

const getPieceImgURL = (piece: Piece) => {
  return new URL(`../Assets/Images/${piece.color}${piece.type}.svg`, import.meta.url).href;
};

onMounted(() => {
  window.addEventListener('pointermove', dragging);
  window.addEventListener('pointerup', dragEnd);
});

onUnmounted(() => {
  window.removeEventListener('pointermove', dragging);
  window.removeEventListener('pointerup', dragEnd);
});
</script>

<template>
  <main>
    <div id="Board">
      <div
        v-for="(piece, index) in board"
        :key="index"
        :id="index.toString()"
        class="Square"
        :class="(utils.toRank(index) + utils.toFile(index)) % 2 === 0 ? 'Light' : 'Dark'"
      >
        <img
          v-if="piece"
          class="Piece"
          :class="{ Dragging: currentDrag?.originSquare === index }"
          :style="
            currentDrag?.originSquare === index
              ? {
                  left: `${currentDrag.x - currentDrag.offsetX}px`,
                  top: `${currentDrag.y - currentDrag.offsetY}px`,
                }
              : {}
          "
          :src="getPieceImgURL(piece)"
          draggable="false"
          @pointerdown="(ev: PointerEvent) => dragStart(ev, index, piece)"
        />
      </div>
    </div>
  </main>
</template>
