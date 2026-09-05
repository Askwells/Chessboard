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
      case c.PieceType.knight:
        const offsets = [-21, -19, -12, -8, 8, 12, 19, 21];
        for (let offset of offsets) {
          const candidateMove = index + offset;
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

export function getLegalMovesOfPiece(index: number, legalMoves: c.Move[]) {
  return legalMoves.filter((move) => move.originSquare === index);
}

// export function generateLegalMoves(): c.Move[] {}
