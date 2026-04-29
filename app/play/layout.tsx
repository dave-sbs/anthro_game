'use client';

import type { ReactNode } from 'react';
import { PlayProvider } from '@/lib/play-context';

export default function PlayLayout({ children }: { children: ReactNode }) {
  return <PlayProvider>{children}</PlayProvider>;
}
