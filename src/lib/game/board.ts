import { Position } from '~/lib/game/position';

type State = { color: 'red' | 'black'; piece: 'dame' | 'peon' };
export const initial = {
  a1: { color: 'red', piece: 'dame' },
  b2: { color: 'red', piece: 'peon' },
  a3: { color: 'red', piece: 'dame' },
  b4: { color: 'red', piece: 'peon' },
  a5: { color: 'red', piece: 'dame' },
  b6: { color: 'red', piece: 'peon' },
  a7: { color: 'red', piece: 'dame' },
  b8: { color: 'red', piece: 'peon' },
  g1: { color: 'black', piece: 'dame' },
  h2: { color: 'black', piece: 'peon' },
  g3: { color: 'black', piece: 'dame' },
  h4: { color: 'black', piece: 'peon' },
  g5: { color: 'black', piece: 'dame' },
  h6: { color: 'black', piece: 'peon' },
  g7: { color: 'black', piece: 'dame' },
  h8: { color: 'black', piece: 'peon' },
} as const satisfies Partial<Record<Position, State>>;

export const getBoard = () => {
  return new Map(Object.entries(initial));
};
