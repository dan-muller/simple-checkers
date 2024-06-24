import { PropsWithChildren } from 'react';
import { fromPosition, Position } from '~/lib/game/position';
import { cn } from '~/lib/utils';

export function Tile({ children, position }: PropsWithChildren<{ position: Position }>) {
  const [iCol, iRow] = fromPosition(position).toIndex();
  return <div className={cn('flex h-full w-full items-center justify-center')}>{children}</div>;
}
