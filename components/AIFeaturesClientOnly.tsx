'use client';

import dynamic from 'next/dynamic';

const AIFeaturesClientOnly = dynamic(() => import('@/components/AIFeatures'), {
  ssr: false,
  loading: () => (
    <div className="w-full max-w-7xl mx-auto min-h-[420px] rounded-3xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/20 animate-pulse" />
  ),
});

export default AIFeaturesClientOnly;
