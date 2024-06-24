import { PropsWithChildren } from 'react';
import { Position } from '~/lib/game/position';
import { getBoard } from '~/lib/game/board';
import { cn } from '~/lib/utils';

export function Piece({ position }: Readonly<{ position: Position }>) {
  const board = getBoard();
  const state = board.get(position);
  return (
    <div
      className={cn(
        'opacity-60 select-none',
        state?.color === 'red' && 'text-player-red-200',
        state?.color === 'black' && 'text-player-black-100',
        state?.piece === 'pawn' && 'text-7xl',
        state?.piece === 'king' && 'text-5xl'
      )}
    >
      {state?.piece === 'pawn' ? '●' : null}
      {state?.piece === 'king' ? '◉' : null}
    </div>
  );
}
// Ⓚ
// ⌬
