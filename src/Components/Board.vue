<script setup lang="ts">
import { onMounted, onUnmounted, computed, mergeProps } from 'vue';
import * as utils from '@/utils';
import * as c from '@/types';
import * as mg from '@/moveGenerator';
import useBoard from '@/Composables/useBoard';
import useDragDrop from '@/Composables/useDragDrop';
import moveSoundURL from '@/Assets/Sounds/move.mp3';
import captureSoundURL from '@/Assets/Sounds/capture.mp3';

const { board8x8, legalMoves, currentPlayer, switchPlayer, loadFEN } = useBoard();
const { dragStart, dragging, dragEnd, currentDrag } = useDragDrop(
  (square: number) => {
    onDragStart(square);
  },
  (move: c.Move) => {
    onDragEnd(move);
  },
);

const onDragStart = (square: number) => {
  if (!squares.value[square]) return;
  squares.value[square].highlighted = true;
  mg.getLegalMovesOfPiece(square, legalMoves.value).forEach((move) => {
    if (move.isCapture) {
      squares.value[move.targetSquare]!.legalCapture = true;
    } else {
      squares.value[move.targetSquare]!.legalMove = true;
    }
  });
};

const onDragEnd = (move: c.Move) => {
  const legalMove = legalMoves.value.find(
    (legalMove) =>
      legalMove.originSquare === move.originSquare && legalMove.targetSquare === move.targetSquare,
  );

  if (!legalMove) {
    squares.value[move.originSquare]!.highlighted = false;
    squares.value.forEach((square) => {
      if (square.legalMove) square.legalMove = false;
      if (square.legalCapture) square.legalCapture = false;
    });
    return;
  }

  board8x8.value[legalMove.targetSquare] = board8x8.value[legalMove.originSquare] as number;
  if (legalMove.type === c.MoveType.PawnPromotion) {
    board8x8.value[legalMove.targetSquare] =
      utils.getPieceColor(board8x8.value[legalMove.targetSquare]!) === c.Color.white
        ? c.Piece.whiteQueen
        : c.Piece.blackQueen;
  }
  board8x8.value[legalMove.originSquare] = c.empty;

  squares.value[legalMove.originSquare]!.highlighted = true;
  squares.value[legalMove.targetSquare]!.highlighted = true;

  if (legalMove.isCapture) {
    const sound = new Audio(captureSoundURL);
    sound.play();
  } else {
    const sound = new Audio(moveSoundURL);
    sound.play();
  }

  currentPlayer.value = switchPlayer(currentPlayer.value);
};

loadFEN(board8x8.value);

const getPieceImgURL = (piece: c.Piece) => {
  return new URL(
    `../Assets/Images/${utils.getPieceColor(piece) === c.Color.white ? 'w' : 'b'}${utils.pieceTypeToChar(utils.getPieceType(piece))}.png`,
    import.meta.url,
  ).href;
};

const squares = computed(() =>
  board8x8.value.map((piece, index) => ({
    piece,
    index,
    isRankIndicator: utils.toFile(index) === 0,
    isFileIndicator: utils.toRank(index) === 0,
    color: (utils.toRank(index) + utils.toFile(index)) % 2 !== 0 ? 'Light' : 'Dark',
    highlighted: false,
    legalMove: false,
    legalCapture: false,
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
        :class="[
          square.color,
          { Highlighted: square.highlighted },
          { LegalMove: square.legalMove },
          { LegalCapture: square.legalCapture },
          { HoverEffects: currentDrag?.hoveredSquare === square.index },
        ]"
      >
        <span v-if="square.isRankIndicator" :class="{ RankIndicator: square.isRankIndicator }">{{
          utils.toRank(square.index) + 1
        }}</span>
        <span v-if="square.isFileIndicator" :class="{ FileIndicator: square.isFileIndicator }">{{
          utils.indexToAlgebraic(square.index)[0]
        }}</span>
        <img
          v-if="square.piece"
          class="Piece"
          :class="{
            Dragging: currentDrag?.originSquare === square.index,
          }"
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
          @pointerdown="
            (ev: PointerEvent) => {
              if (utils.getPieceColor(board8x8[square.index]!) !== currentPlayer) return;
              dragStart(ev, square.index);
            }
          "
        />
      </div>
    </div>
  </main>
</template>

<style scoped>
* {
  font-family: 'Trebuchet MS', Arial, sans-serif;
  font-weight: bold;
  box-sizing: border-box;
}

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
  color: #b58763;
}

.Square.Dark {
  background-color: #b58763;
  color: #f0dab5;
}

.Square.Light.Highlighted {
  background-color: #f6ec6f;
}

.Square.Dark.Highlighted {
  background-color: #ddc348;
}

.Square.HoverEffects {
  box-shadow: inset 0 0 0 3px hsl(0, 0%, 95%);
}

.Square.LegalMove::before {
  content: '';
  position: absolute;
  width: 30%;
  height: 30%;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 50%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.Square.LegalCapture::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  box-shadow: inset 0 0 0 5px rgba(0, 0, 0, 0.15);
  border-radius: 50%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.Square span.RankIndicator {
  position: absolute;
  top: 0.5px;
  left: 3.5px;
  font-size: 17.5px;
}

.Square span.FileIndicator {
  position: absolute;
  bottom: 0.5px;
  right: 3.5px;
  font-size: 17.5px;
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
