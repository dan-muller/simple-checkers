'use client';

import { Position } from '~/lib/game/position';
import { cn } from '~/lib/utils';
import { useCellState } from '~/components/game/state';

const pieces = {
  peon: '●',
  dame: '◉',
};

export function Piece({ position }: Readonly<{ position: Position }>) {
  const state = useCellState(position);
  return (
    <div
      className={cn(
        'select-none',
        state?.player === 'red' && 'text-player-red-200',
        state?.player === 'black' && 'text-player-black-100',
        state?.piece === 'peon' && 'text-7xl',
        state?.piece === 'dame' && 'text-5xl',
      )}
    >
      {state ? pieces[state.piece] : null}
    </div>
  );
}

// Ⓚ
// ⌬
