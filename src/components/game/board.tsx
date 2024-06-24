import { PropsWithChildren } from 'react';
import { cols, fromPosition, positions } from '~/lib/game/position';
import { cn } from '~/lib/utils';
import { Piece } from '~/components/game/piece';
import { Tile } from '~/components/game/tile';

const boardPositions = positions.map((position) => {
  const pos = fromPosition(position);
  const [col, row] = pos;
  const [iCol, iRow] = pos.toIndex();
  return { position, col, row, iCol, iRow };
});

const headerClasses = 'content-center text-center p-2 select-none';
const ColHeader = ({ children }: PropsWithChildren) => <div className={headerClasses}>{children}</div>;
const RowHeader = ({ children }: PropsWithChildren) => <div className={headerClasses}>{children}</div>;

export function Board() {
  return (
    <main className={cn('min-w-[500px] max-w-4xl')}>
      <div className={cn('grid grid-cols-checkerboard grid-rows-checkerboard aspect-square font-semibold capitalize')}>
        <div></div>
        {cols.map((col) => (
          <ColHeader key={col}>{col}</ColHeader>
        ))}
        {boardPositions.map(({ position, col, row, iCol, iRow }) => (
          <>
            {iCol === 0 ? <RowHeader key={row}>{row}</RowHeader> : null}
            <div
              className={cn(
                'h-full w-full bg-opacity-60 border-tile-dark border-2',
                (iCol + iRow) % 2 === 0 ? 'bg-tile-light' : 'bg-tile-dark',
                iCol === 0 && iRow === 0 && 'rounded-tl-xl',
                iCol === 0 && iRow === 7 && 'rounded-bl-xl',
                iCol === 7 && iRow === 0 && 'rounded-tr-xl',
                iCol === 7 && iRow === 7 && 'rounded-br-xl'
              )}
            >
              <Tile position={position}>
                <Piece position={position} />
              </Tile>
            </div>
          </>
        ))}
      </div>
    </main>
  );
}
