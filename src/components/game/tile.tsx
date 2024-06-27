'use client';

import { PropsWithChildren } from 'react';
import { cn } from '~/lib/utils';
import { fromPosition, Position } from '~/lib/game/position';
import { match, P } from 'ts-pattern';
import {
  useAvailableMoves,
  useCellState,
  useCurrentPlayer,
  useHistory,
  useSelectedPosition,
} from '~/components/game/state';

type InternalTileProps = {
  position: Position;
};

const Basic = ({ children }: PropsWithChildren) => (
  <div className="flex h-full w-full items-center justify-center">{children}</div>
);

const TileSelector = ({ children, position }: PropsWithChildren<InternalTileProps>) => {
  const [selectedPosition, setSelectedPosition] = useSelectedPosition();
  const onTileClick = () => (selectedPosition === position ? setSelectedPosition(null) : setSelectedPosition(position));
  return (
    <button
      className={cn(
        'flex h-full w-full items-center justify-center bg-blue-400 hover:bg-blue-600',
        selectedPosition === position && 'bg-blue-600',
      )}
      onClick={onTileClick}
    >
      <Basic>{children}</Basic>
    </button>
  );
};

const TileAvailableMove = ({ children, position }: PropsWithChildren<InternalTileProps>) => {
  const [selectedPosition, setSelectedPosition] = useSelectedPosition();
  const [, addMove] = useHistory();
  const availableMoves = useAvailableMoves(position);
  const move = selectedPosition && availableMoves.get(selectedPosition)?.find((m) => m.to === position);
  const onTileClick = () => move && addMove(move);
  return (
    <button
      className={cn('flex h-full w-full items-center justify-center enabled:bg-green-400 enabled:hover:bg-green-600')}
      onClick={onTileClick}
      disabled={!move}
    >
      <Basic>{children}</Basic>
    </button>
  );
};

const TileAvailableCapture = ({ children, position }: PropsWithChildren<InternalTileProps>) => {
  const [selectedPosition, setSelectedPosition] = useSelectedPosition();
  const [, addMove] = useHistory();
  const availableMoves = useAvailableMoves(position);
  const move = selectedPosition && availableMoves.get(selectedPosition)?.find((m) => m.to === position);
  const onTileClick = () => move && addMove(move);
  return (
    <button
      className={cn('flex h-full w-full items-center justify-center enabled:bg-red-400 enabled:hover:bg-red-600')}
      onClick={onTileClick}
      disabled={!move}
    >
      <Basic>{children}</Basic>
    </button>
  );
};

export function Tile({ children, position }: PropsWithChildren<{ position: Position }>) {
  const [iCol, iRow] = fromPosition(position).toIndex();
  const [selectedPosition] = useSelectedPosition();
  const currentPlayer = useCurrentPlayer();
  const cellState = useCellState(position);
  const availableMoves = useAvailableMoves(position);
  const state = {
    cellState,
    iCol,
    iRow,
    currentPlayer,
    position,
    selectedPosition,
    availableMoves,
  };
  const Component = match(state)
    .with(
      {
        selectedPosition: P.nullish,
        cellState: { player: currentPlayer },
        position: P.when((p) => availableMoves.get(p)?.length),
      },
      () => TileSelector,
    )
    .with({ selectedPosition: position, cellState: { player: currentPlayer } }, (state) => TileSelector)
    .with(
      {
        position: P.when(
          (p) =>
            p && selectedPosition && availableMoves.get(selectedPosition)?.some((m) => m.to === p && m.type === 'move'),
        ),
      },
      () => TileAvailableMove,
    )
    .with(
      {
        position: P.when(
          (p) =>
            p &&
            selectedPosition &&
            availableMoves.get(selectedPosition)?.some((m) => m.to === p && m.type === 'capture'),
        ),
      },
      () => TileAvailableCapture,
    )
    .otherwise(() => Basic);
  return (
    <div className={cn('flex h-full w-full items-center justify-center')}>
      <Component position={position}>{children}</Component>
    </div>
  );
}

// 'use client';
//
// import { PropsWithChildren } from 'react';
// import { fromPosition, Position } from '~/lib/game/position';
// import { cn } from '~/lib/utils';
// import { useCellState, useCurrentPlayer, useSelectedPosition } from '~/components/game/state';
// import { match, P } from 'ts-pattern';
// import { CellState, Player } from '~/lib/game/state';
//
// type InternalTileProps = {
//   cellState?: CellState;
//   selectedPosition: Position | null;
//   currentPlayer: Player;
//   position: Position;
//   iCol: number;
//   iRow: number;
// };
//
// const Basic = ({ children }: PropsWithChildren<InternalTileProps>) => (
//   <div className="flex h-full w-full items-center justify-center">{children}</div>
// );
// const TileSelector = ({ children, ...props }: PropsWithChildren<InternalTileProps>) => {
//   return (
//     <div className="bg-blue-400/80 flex h-full w-full items-center justify-center">
//       <Basic {...props}>{children}</Basic>
//     </div>
//   );
// };
//
// export function Tile({ children, position }: PropsWithChildren<{ position: Position }>) {
//   const [iCol, iRow] = fromPosition(position).toIndex();
//   const [selectedPosition, setSelectedPosition] = useSelectedPosition();
//   const currentPlayer = useCurrentPlayer();
//   const cellState = useCellState(position);
//   const state = {
//     cellState,
//     iCol,
//     iRow,
//     currentPlayer,
//     position,
//     selectedPosition,
//   };
//   console.log(state);
//   const Component = match(state)
//     .with({ selectedPosition: P.nullish, state: { player: currentPlayer } }, (state) => {
//       console.log('selector');
//       return TileSelector;
//     })
//     .otherwise(() => {
//       console.log('basic');
//       return Basic;
//     });
//   return (
//     <div className={cn('flex h-full w-full items-center justify-center')}>
//       <Component {...state}>{children}</Component>
//     </div>
//   );
// }
