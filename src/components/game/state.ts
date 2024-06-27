'use client';

import { useAtom } from 'jotai';
import {
  availableMovesAtom,
  boardAtom,
  capturesAtom,
  currentPlayerAtom,
  historyAtom,
  Move,
  selectedPositionAtom,
} from '~/lib/game/state';
import { Position } from '~/lib/game/position';
import { useMemo } from 'react';

export const useCellState = (position: Position) => {
  const [board] = useAtom(boardAtom);
  return useMemo(() => board.get(position), [board, position]);
};

export const useHistory = () => {
  const [history, setHistory] = useAtom(historyAtom);
  return [history, (move: Move) => setHistory(move)] as const;
};

export const useCurrentPlayer = () => {
  const [currenPlayer] = useAtom(currentPlayerAtom);
  return currenPlayer;
};

export const useSelectedPosition = () => {
  const [selectedCell, setSelectedPosition] = useAtom(selectedPositionAtom);
  return [selectedCell, setSelectedPosition] as const;
};

export const useScore = () => {
  const [captures] = useAtom(capturesAtom);
  return captures;
};

export const useAvailableMoves = (position: Position) => {
  const [allAvailableMoves] = useAtom(availableMovesAtom);
  return allAvailableMoves;
};
