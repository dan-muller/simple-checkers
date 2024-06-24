import { Position } from '~/lib/game/position';
import { getBoard } from '~/lib/game/board';
import { cn } from '~/lib/utils';

const pieces = {
  peon: '●',
  dame: '◉',
};

export function Piece({ position }: Readonly<{ position: Position }>) {
  const board = getBoard();
  const state = board.get(position);
  return (
    <div
      className={cn(
        'select-none',
        state?.color === 'red' && 'text-player-red-200',
        state?.color === 'black' && 'text-player-black-100',
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
