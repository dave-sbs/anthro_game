'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useGame } from '@/hooks/useGame';

type PlayContextValue = ReturnType<typeof useGame>;

const PlayContext = createContext<PlayContextValue | null>(null);

export function PlayProvider({ children }: { children: ReactNode }) {
  const game = useGame();
  return <PlayContext.Provider value={game}>{children}</PlayContext.Provider>;
}

export function usePlay(): PlayContextValue {
  const ctx = useContext(PlayContext);
  if (!ctx) throw new Error('usePlay must be used inside PlayProvider');
  return ctx;
}
