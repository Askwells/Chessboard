import * as c from '@/types';
import * as utils from '@/utils';

export function generatePseudolegalMoves(boardState10x12: number[], player: c.Color): c.Move[] {
  let moves: c.Move[] = [];

  for (let index = 0; index < boardState10x12.length; index++) {
    const piece = boardState10x12[index];
    if (!piece || piece === c.offBoard || piece === c.empty) continue;
    if (utils.getPieceColor(piece) !== player) continue;

    const pieceType = utils.getPieceType(piece);

    switch (pieceType) {
      case c.PieceType.pawn:
        moves.push(...generatePawnMoves(index, boardState10x12, player));
        break;
      case c.PieceType.knight:
        moves.push(...generateKnightMoves(index, boardState10x12, player));
        break;
      case c.PieceType.bishop:
        moves.push(...generateSlidingPieceMoves(index, boardState10x12, player, [9, -9, 11, -11]));
        break;
      case c.PieceType.rook:
        moves.push(...generateSlidingPieceMoves(index, boardState10x12, player, [10, -10, 1, -1]));
        break;
      case c.PieceType.queen:
        moves.push(
          ...generateSlidingPieceMoves(
            index,
            boardState10x12,
            player,
            [1, -1, 9, -9, 10, -10, 11, -11],
          ),
        );
        break;
      case c.PieceType.king:
        moves.push(...generateKingMoves(index, boardState10x12, player));
        break;
    }
  }

  moves = moves.map((move) => {
    move.originSquare = utils.indices10x12To8x8[move.originSquare]!;
    move.targetSquare = utils.indices10x12To8x8[move.targetSquare]!;
    return move;
  });

  return moves;
}

function generatePawnMoves(index: number, boardState10x12: number[], player: c.Color): c.Move[] {
  const moves: c.Move[] = [];
  const movementDir = player === c.Color.white ? 1 : -1;
  const movementOffset = movementDir * 10;
  const captureOffsets = [movementDir * 9, movementDir * 11];
  const isOnStartingRank = Math.floor(index / 10) === (player === c.Color.white ? 3 : 8);
  const promotionRank = player === c.Color.white ? 9 : 2;

  let pawnPush = index + movementOffset;
  if (boardState10x12[pawnPush] !== c.offBoard && boardState10x12[pawnPush] === c.empty) {
    moves.push({
      originSquare: index,
      targetSquare: pawnPush,
      type: c.MoveType.Normal,
    });

    if (isOnStartingRank) {
      const doublePawnPush = index + movementOffset * 2;
      if (
        boardState10x12[doublePawnPush] !== c.offBoard &&
        boardState10x12[doublePawnPush] === c.empty
      ) {
        moves.push({
          originSquare: index,
          targetSquare: doublePawnPush,
          type: c.MoveType.DoublePawnPush,
        });
      }
    }
  }

  for (const offset of captureOffsets) {
    let candidateCapture = index + offset;
    if (boardState10x12[candidateCapture] === c.offBoard) continue;
    if (boardState10x12[candidateCapture] === c.empty) continue;
    if (utils.getPieceColor(boardState10x12[candidateCapture]!) === player) continue;

    moves.push({
      originSquare: index,
      targetSquare: candidateCapture,
      type: c.MoveType.Normal,
      isCapture: true,
    });
  }

  moves.forEach((move) => {
    if (Math.floor(move.targetSquare / 10) === promotionRank) move.type = c.MoveType.PawnPromotion;
  });

  return moves;
}

function generateKnightMoves(index: number, boardState10x12: number[], player: c.Color): c.Move[] {
  const moves: c.Move[] = [];
  const offsets = [-21, -19, -12, -8, 8, 12, 19, 21];

  for (const offset of offsets) {
    let candidateMove = index + offset;
    const sq = boardState10x12[candidateMove];
    if (sq === c.offBoard) continue;
    if (sq !== c.empty && utils.getPieceColor(sq!) === player) continue;

    moves.push({
      originSquare: index,
      targetSquare: candidateMove,
      type: c.MoveType.Normal,
      isCapture: sq !== c.empty,
    });
  }

  return moves;
}

function generateSlidingPieceMoves(
  index: number,
  boardState10x12: number[],
  player: c.Color,
  dirs: number[],
): c.Move[] {
  const moves: c.Move[] = [];

  for (const dir of dirs) {
    let step = 1;
    let candidateMove = index + dir * step;

    while (boardState10x12[candidateMove] !== c.offBoard) {
      const isOccupied = boardState10x12[candidateMove] !== c.empty;
      if (isOccupied && utils.getPieceColor(boardState10x12[candidateMove]!) === player) break;

      moves.push({
        originSquare: index,
        targetSquare: candidateMove,
        type: c.MoveType.Normal,
        isCapture: isOccupied,
      });

      if (isOccupied) break;

      step++;
      candidateMove = index + dir * step;
    }
  }

  return moves;
}

function generateKingMoves(index: number, boardState10x12: number[], player: c.Color) {
  const moves: c.Move[] = [];
  const offsets = [1, -1, 9, -9, 10, -10, 11, -11];

  for (const offset of offsets) {
    let candidateMove = index + offset;
    const sq = boardState10x12[candidateMove];
    if (sq === c.offBoard) continue;
    if (sq !== c.empty && utils.getPieceColor(sq!) === player) continue;

    moves.push({
      originSquare: index,
      targetSquare: candidateMove,
      type: c.MoveType.Normal,
      isCapture: sq !== c.empty,
    });
  }

  return moves;
}

export function getLegalMovesOfPiece(index: number, legalMoves: c.Move[]) {
  return legalMoves.filter((move) => move.originSquare === index);
}

// export function generateLegalMoves(): c.Move[] {}
