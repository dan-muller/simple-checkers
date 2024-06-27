import { atom } from 'jotai';
import { atomFamily, atomWithStorage, createJSONStorage } from 'jotai/utils';
import { fromPosition, isValidPosition, Position, toPosition } from '~/lib/game/position';

type PieceEventDefinition = { promote: { to: Piece } };
type PieceEventType = keyof PieceEventDefinition;
type PieceEvent<TPieceEventType extends PieceEventType = PieceEventType> = {
  type: TPieceEventType;
} & PieceEventDefinition[TPieceEventType];

type HistoryDefinition = {
  move: { from: Position; to: Position };
  capture: { from: Position; to: Position; target: Position };
};
export type MoveType = keyof HistoryDefinition;
export type Move<TMoveType extends MoveType = MoveType> = {
  player: Player;
  event?: PieceEvent;
  type: TMoveType;
  hidden?: boolean;
  piece: Piece;
} & HistoryDefinition[TMoveType];

const historyValueAtom = atomWithStorage<Move[]>('history', []);
export const historyAtom = atom(
  (get) => get(historyValueAtom).filter((move) => !move.hidden),
  (get, set, value: Move) => {
    const history = get(historyValueAtom);
    const playerCfg = playerConfig[value.player];
    const pieceCfg = pieceConfig[value.piece];
    const [col] = fromPosition(value.to);
    if (playerCfg.promotionColumn === col && pieceCfg.promotion) {
      value.event = { type: 'promote', to: pieceCfg.promotion };
    }
    set(historyValueAtom, [...history, value]);
    set(selectedPositionAtom, null);
  },
);

const selectedPositionValueAtom = atom<Position | null>(null);
export const selectedPositionAtom = atom(
  (get) => get(selectedPositionValueAtom),
  (_, set, value: Position | null) => set(selectedPositionValueAtom, value),
);

export const currentPlayerAtom = atom<Player>((get) => {
  const history = get(historyAtom);
  const availableMoves = get(availableMovesAtom);
  const lastMove = history[history.length - 1];
  if (lastMove) {
    if (lastMove.type === 'capture') {
      const moves = availableMoves.get(lastMove.to);
      if (moves?.some((move) => move.type === 'capture')) {
        return lastMove.player;
      }
    }
    return lastMove.player === 'red' ? 'black' : 'red';
  }
  return 'red';
});

export type Player = 'red' | 'black';
const playerConfig = {
  red: { direction: 'LtoR', promotionColumn: 'h' },
  black: { direction: 'RtoL', promotionColumn: 'a' },
} as const;

export type Piece = 'dame' | 'peon';
export type CellState = { player: Player; piece: Piece };

export const boardAtom = atom((get) => {
  const board = new Map<Position, CellState>([
    ['a1', { player: 'red', piece: 'dame' }],
    ['b2', { player: 'red', piece: 'peon' }],
    ['a3', { player: 'red', piece: 'dame' }],
    ['b4', { player: 'red', piece: 'peon' }],
    ['a5', { player: 'red', piece: 'dame' }],
    ['b6', { player: 'red', piece: 'peon' }],
    ['a7', { player: 'red', piece: 'dame' }],
    ['b8', { player: 'red', piece: 'peon' }],
    ['g1', { player: 'black', piece: 'peon' }],
    ['h2', { player: 'black', piece: 'dame' }],
    ['g3', { player: 'black', piece: 'peon' }],
    ['h4', { player: 'black', piece: 'dame' }],
    ['g5', { player: 'black', piece: 'peon' }],
    ['h6', { player: 'black', piece: 'dame' }],
    ['g7', { player: 'black', piece: 'peon' }],
    ['h8', { player: 'black', piece: 'dame' }],
  ]);
  const history = get(historyAtom);
  for (const move of history) {
    // Check if the from cell is valid
    const fromCell = board.get(move.from);
    if (!fromCell || !isValidPosition(move.from)) continue;

    // Check if the target cell is valid
    const toCell = board.get(move.to);
    if (toCell || !isValidPosition(move.to)) continue;

    if ('target' in move && move.type === 'capture') {
      /**
       * =============================================================================
       * If the move is a capture, we need to check if the target cell is valid and
       * remove the piece from the board.
       * =============================================================================
       */

      // Check if the target cell is valid
      if (!isValidPosition(move.target)) continue;

      // Remove the target cell from the board
      board.set(move.to, board.get(move.from)!);
      board.delete(move.from);
      board.delete(move.target);
    } else {
      /**
       * =============================================================================
       * If the move is not a capture, we can simply move the piece to the target cell.
       * =============================================================================
       */

      // Move the piece to the target cell
      board.set(move.to, board.get(move.from)!);
      board.delete(move.from);
    }
    if (move.event?.type === 'promote') {
      const promoted = { ...fromCell, piece: move.event.to };
      board.set(move.to, promoted);
    }
  }
  return board;
});

export type Captures = Record<Player, number>;
export const capturesAtom = atom<Captures>({ red: 0, black: 0 });

type CaptureMode = 'hop';
type MoveDirection = 'LtoR' | 'RtoL' | 'All';
type MoveOffset = { direction: MoveDirection; offset: [number, number] };
type PieceConfig = { moves: MoveOffset[]; captures: CaptureMode; promotion: Piece | null };
const pieceConfig = {
  dame: {
    captures: 'hop',
    moves: [
      { direction: 'All', offset: [-1, -1] },
      { direction: 'All', offset: [-1, 1] },
      { direction: 'All', offset: [1, -1] },
      { direction: 'All', offset: [1, 1] },
    ],
    promotion: null,
  },
  peon: {
    captures: 'hop',
    moves: [
      { direction: 'LtoR', offset: [1, 1] },
      { direction: 'LtoR', offset: [1, -1] },
      { direction: 'RtoL', offset: [-1, 1] },
      { direction: 'RtoL', offset: [-1, -1] },
    ],
    promotion: 'dame',
  },
} as const satisfies Record<Piece, PieceConfig>;

export const availableMovesAtom = atom<Map<Position, Move[]>>((get) => {
  const board = get(boardAtom);
  const moves = new Map<Position, Move[]>();
  const canCapture = new Map<Player, boolean>();
  for (const [position, { piece, player }] of board) {
    const config = pieceConfig[piece];
    const availableMoves: Move[] = [];
    for (const { offset } of config.moves.filter(
      (move) => move.direction === 'All' || move.direction === playerConfig[player].direction,
    )) {
      const [dCol, dRow] = offset;
      const [iCol, iRow] = fromPosition(position).toIndex();
      const to = toPosition(iCol + dCol, iRow + dRow);
      if (!to || !isValidPosition(to)) continue;
      const target = board.get(to);
      if (target && target.player !== player) {
        const destinationPosition = config.captures === 'hop' ? toPosition(iCol + dCol * 2, iRow + dRow * 2) : to;
        if (!destinationPosition || !isValidPosition(destinationPosition)) continue;
        const destinationCell = board.get(destinationPosition);
        if (!!destinationCell) continue;
        availableMoves.push({ player, type: 'capture', from: position, to: destinationPosition, target: to, piece });
        canCapture.set(player, true);
      } else if (!target) {
        availableMoves.push({ player, type: 'move', from: position, to, piece });
      }
    }
    moves.set(position, availableMoves);
  }
  for (const [position, availableMoves] of moves) {
    const player = board.get(position)?.player;
    const playerCanCapture = player && canCapture.get(player);
    if (playerCanCapture || availableMoves.some((move) => move.type === 'capture')) {
      moves.set(
        position,
        availableMoves.filter((move) => move.type === 'capture'),
      );
    }
  }
  return moves;
});

if (process.env.NODE_ENV !== 'production') {
  historyValueAtom.debugLabel = 'historyValue';
  historyAtom.debugLabel = 'history';
  selectedPositionValueAtom.debugLabel = 'selectedPositionValue';
  selectedPositionAtom.debugLabel = 'selectedPosition';
  currentPlayerAtom.debugLabel = 'currentPlayer';
  boardAtom.debugLabel = 'board';
  capturesAtom.debugLabel = 'captures';
  availableMovesAtom.debugLabel = 'availableMoves';
}
