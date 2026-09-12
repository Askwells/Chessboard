<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref, watch } from 'vue';
import * as utils from '@/Core/utils';
import * as c from '@/Core/types';
import * as mg from '@/Core/moveGenerator';
import useBoard from '@/Composables/useBoard';
import useDragDrop from '@/Composables/useDragDrop';
import MoveSound from '@/Assets/Sounds/Move.mp3';
import CaptureSound from '@/Assets/Sounds/Capture.mp3';

const { state, legalMoves, switchPlayer, loadFEN, makeMove } = useBoard();
const { dragStart, dragging, dragEnd, currentDrag } = useDragDrop(
  (index: number) => {
    onDragStart(index);
  },
  (move: c.Move) => {
    onDragEnd(move);
  },
);

const humanPlayer = c.Color.white;
const computerMoveDelaySeconds = 1;
const computerMoveTimeout = ref<number | null>(null);

const playMoveSound = (move: c.Move) => {
  if (move.isCapture) {
    new Audio(CaptureSound).play();
  } else {
    new Audio(MoveSound).play();
  }
};

const onDragStart = (index: number) => {
  if (!squares.value[index]) return;

  squares.value[index].highlighted = true;
  mg.getLegalMovesOfPiece(index, legalMoves.value).forEach((move) => {
    if (move.isCapture) {
      squares.value[move.targetSquare]!.legalCapture = true;
    } else {
      squares.value[move.targetSquare]!.legalMove = true;
    }
  });
};

const onDragEnd = (move: c.Move) => {
  const legalMove = legalMoves.value.find(
    (lm) => lm.originSquare === move.originSquare && lm.targetSquare === move.targetSquare,
  );

  if (!legalMove) {
    squares.value[move.originSquare]!.highlighted = false;
    squares.value.forEach((square) => {
      if (square.legalMove) square.legalMove = false;
      if (square.legalCapture) square.legalCapture = false;
    });
    return;
  }

  state.value = makeMove(legalMove, state.value);

  squares.value[legalMove.originSquare]!.highlighted = true;
  squares.value[legalMove.targetSquare]!.highlighted = true;

  playMoveSound(legalMove);

  state.value.meta.currentPlayer = switchPlayer(state.value.meta.currentPlayer);
};

const SQUARE_SIZE = 70;

const animatingPiece = ref<{
  piece: c.Piece;
  originSquare: number;
  targetSquare: number;
} | null>(null);
const animatingPiecePos = ref<{ left: number; top: number } | null>(null);

const getSquareOffset = (index: number) => {
  const file = utils.toFile(index);
  const rank = utils.toRank(index);
  return {
    left: file * SQUARE_SIZE,
    top: (7 - rank) * SQUARE_SIZE,
  };
};

const animateMove = (move: c.Move) => {
  const legalMove = legalMoves.value.find(
    (lm) => lm.originSquare === move.originSquare && lm.targetSquare === move.targetSquare,
  );
  if (!legalMove) return;

  const piece = state.value.board[legalMove.originSquare];
  if (!piece) return;

  animatingPiece.value = {
    piece,
    originSquare: legalMove.originSquare,
    targetSquare: legalMove.targetSquare,
  };
  animatingPiecePos.value = getSquareOffset(legalMove.originSquare);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      animatingPiecePos.value = getSquareOffset(legalMove.targetSquare);
    });
  });
};

const onAnimatedPieceTransitionEnd = () => {
  if (!animatingPiece.value) return;

  const legalMove = legalMoves.value.find(
    (lm) =>
      lm.originSquare === animatingPiece.value!.originSquare &&
      lm.targetSquare === animatingPiece.value!.targetSquare,
  );

  if (legalMove) {
    state.value = makeMove(legalMove, state.value);
    playMoveSound(legalMove);

    squares.value[legalMove.originSquare]!.highlighted = true;
    squares.value[legalMove.targetSquare]!.highlighted = true;

    state.value.meta.currentPlayer = switchPlayer(state.value.meta.currentPlayer);
  }

  animatingPiece.value = null;
  animatingPiecePos.value = null;
};

state.value = loadFEN();

const getPieceImgURL = (piece: c.Piece) => {
  return new URL(
    `../Assets/Images/${utils.getPieceColor(piece) === c.Color.white ? 'w' : 'b'}${utils.pieceTypeToChar(utils.getPieceType(piece))}.png`,
    import.meta.url,
  ).href;
};

const squares = computed(() =>
  state.value.board.map((piece, index) => ({
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

watch(
  () => state.value.meta.currentPlayer,
  () => {
    if (computerMoveTimeout.value) {
      clearTimeout(computerMoveTimeout.value);
      computerMoveTimeout.value = null;
    }

    if (state.value.meta.currentPlayer === humanPlayer) return;

    computerMoveTimeout.value = setTimeout(() => {
      computerMoveTimeout.value = null;

      if (state.value.meta.currentPlayer === humanPlayer) return;

      const randomMove = legalMoves.value[Math.floor(Math.random() * legalMoves.value.length)];
      if (randomMove) animateMove(randomMove);
    }, computerMoveDelaySeconds * 1000);
  },
  { immediate: true },
);

onMounted(() => {
  window.addEventListener('pointermove', dragging);
  window.addEventListener('pointerup', dragEnd);
});

onUnmounted(() => {
  window.removeEventListener('pointermove', dragging);
  window.removeEventListener('pointerup', dragEnd);
  if (computerMoveTimeout.value) {
    clearTimeout(computerMoveTimeout.value);
    computerMoveTimeout.value = null;
  }
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
          v-if="
            square.piece &&
            animatingPiece?.originSquare !== square.index &&
            animatingPiece?.targetSquare !== square.index
          "
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
              if (utils.getPieceColor(state.board[square.index]!) !== humanPlayer) return;
              dragStart(ev, square.index);
            }
          "
        />
      </div>

      <img
        v-if="animatingPiece && animatingPiecePos"
        class="Piece AnimatedPiece"
        :src="getPieceImgURL(animatingPiece.piece)"
        :style="{ left: `${animatingPiecePos.left}px`, top: `${animatingPiecePos.top}px` }"
        draggable="false"
        @transitionend="onAnimatedPieceTransitionEnd"
      />
    </div>
  </main>
</template>

<style scoped>
* {
  font-family: Arial, sans-serif;
  font-weight: bold;
  box-sizing: border-box;
}

#Board {
  display: flex;
  flex-wrap: wrap-reverse;
  width: 560px;
  height: 560px;
  user-select: none;
  position: relative;
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
  position: relative;
  z-index: 1;
  width: 70px;
  height: 70px;
  user-select: none;
  cursor: grab;
}

.Piece.Dragging {
  position: fixed;
  z-index: 999;
  cursor: grabbing;
  will-change: left, top;
}

.Piece.AnimatedPiece {
  position: absolute;
  z-index: 2;
  cursor: default;
  transition:
    left 0.25s ease,
    top 0.25s ease;
  will-change: left, top;
}
</style>
