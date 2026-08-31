<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue';
import * as utils from '@/utils.ts';
import useBoard from '@/Composables/useBoard';
import useDragDrop from '@/Composables/useDragDrop';
import type { Move, Piece } from '@/types';

const { board, moveHistory, loadFEN } = useBoard();
const { dragStart, dragging, dragEnd, currentDrag } = useDragDrop(board.value, (move: Move) => {
  board.value[move.targetSquare] = move.piece;
  board.value[move.originSquare] = null;
});
loadFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', board.value);

const getPieceImgURL = (piece: Piece) => {
  return new URL(`../Assets/Images/${piece.color}${piece.type}.svg`, import.meta.url).href;
};

const squares = computed(() =>
  board.value.map((piece, index) => ({
    piece,
    index,
    isRankIndicator: utils.toFile(index) === 0,
    isFileIndicator: utils.toRank(index) === 0,
    color: (utils.toRank(index) + utils.toFile(index)) % 2 === 0 ? 'Light' : 'Dark',
  })),
);

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
        v-for="square in squares"
        :key="square.index"
        :id="square.index.toString()"
        class="Square"
        :class="square.color"
      >
        <span v-if="square.isRankIndicator" :class="{ RankIndicator: square.isRankIndicator }">{{
          utils.toRank(square.index) + 1
        }}</span>
        <span v-if="square.isFileIndicator" :class="{ FileIndicator: square.isFileIndicator }">{{
          utils.toAlgebraic(square.index)[0]
        }}</span>
        <img
          v-if="square.piece"
          class="Piece"
          :class="{ Dragging: currentDrag?.originSquare === square.index }"
          :style="
            currentDrag?.originSquare === square.index
              ? {
                  left: `${currentDrag.x - currentDrag.offsetX}px`,
                  top: `${currentDrag.y - currentDrag.offsetY}px`,
                }
              : {}
          "
          :src="getPieceImgURL(square.piece)"
          draggable="false"
          @pointerdown="(ev: PointerEvent) => dragStart(ev, square.index, square.piece!)"
        />
      </div>
    </div>
  </main>
</template>

<style scoped>
#Board {
  display: flex;
  flex-wrap: wrap-reverse;
  width: 560px;
  height: 560px;
  user-select: none;
}

.Square {
  width: 70px;
  height: 70px;
  position: relative;
}

.Square.Light {
  background-color: #f0dab5;
}

.Square.Dark {
  background-color: #b58763;
}

.Square.Light.LegalMove {
  background-color: #dd5959;
}

.Square.Dark.LegalMove {
  background-color: #c5444f;
}

.Square.Light span.RankIndicator,
.Square.Light span.FileIndicator {
  color: #b58763;
}

.Square.Dark span.RankIndicator,
.Square.Dark span.FileIndicator {
  color: #f0dab5;
}

.Square span.RankIndicator {
  position: absolute;
  font-family: 'Trebuchet MS', sans-serif;
  top: 0.5px;
  left: 3.5px;
  font-size: 15px;
}

.Square span.FileIndicator {
  position: absolute;
  font-family: 'Trebuchet MS', sans-serif;
  bottom: 0.5px;
  right: 3.5px;
  font-size: 15px;
}

.Piece {
  width: 70px;
  height: 70px;
  user-select: none;
  cursor: grab;
  z-index: 10;
}

.Piece.Dragging {
  position: fixed;
  z-index: 999;
  cursor: grabbing;
  will-change: left, top;
}
</style>
