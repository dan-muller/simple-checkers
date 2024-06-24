import { Position } from '~/lib/game/position';

type State = { color: 'red' | 'black'; piece: 'king' | 'pawn' };
export const initial = {
  a1: { color: 'red', piece: 'king' },
  b2: { color: 'red', piece: 'pawn' },
  a3: { color: 'red', piece: 'king' },
  b4: { color: 'red', piece: 'pawn' },
  a5: { color: 'red', piece: 'king' },
  b6: { color: 'red', piece: 'pawn' },
  a7: { color: 'red', piece: 'king' },
  b8: { color: 'red', piece: 'pawn' },
  g1: { color: 'black', piece: 'king' },
  h2: { color: 'black', piece: 'pawn' },
  g3: { color: 'black', piece: 'king' },
  h4: { color: 'black', piece: 'pawn' },
  g5: { color: 'black', piece: 'king' },
  h6: { color: 'black', piece: 'pawn' },
  g7: { color: 'black', piece: 'king' },
  h8: { color: 'black', piece: 'pawn' },
} as const satisfies Partial<Record<Position, State>>;

export const getBoard = () => {
  return new Map(Object.entries(initial));
};
