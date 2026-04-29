'use client';

import dynamic from 'next/dynamic';

const StoriesBrowse = dynamic(() => import('@/components/StoriesBrowse'), {
  loading: () => (
    <div className="min-h-[40vh] flex items-center justify-center px-6 text-sm text-white/60">Loading stories...</div>
  ),
  ssr: false,
});

export default function StoriesGate() {
  return <StoriesBrowse />;
}
