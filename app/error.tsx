'use client';

import { useEffect } from 'react';
import { RefreshCcw, AlertTriangle } from 'lucide-react';
import MeshBackground from '@/components/MeshBackground';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Unhandled UI Error:', error);
  }, [error]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 text-center">
      <MeshBackground />
      
      <div className="relative z-10 max-w-lg space-y-8 p-10 premium-card bg-white/40 dark:bg-[#141414]/40 backdrop-blur-2xl border-white/50 dark:border-white/5 shadow-2xl rounded-[3rem]">
        <div className="size-20 bg-red-100 dark:bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} className="text-red-600" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-serif font-black text-gray-900 dark:text-white tracking-tight">
            Oops! A <span className="text-red-600">Hiccup.</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg leading-relaxed">
            We've experienced a slight technical hiccup—we will work on this. In the meantime, try refreshing the page or starting over.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 w-full sm:w-auto"
          >
            <RefreshCcw size={20} />
            Try Again
          </button>
          <a
            href="/"
            className="px-8 py-4 rounded-2xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-all w-full sm:w-auto"
          >
            Back to Library
          </a>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-black/5 dark:bg-white/5 rounded-2xl text-left overflow-auto max-h-40">
            <code className="text-xs text-red-500 font-mono">
              {error.message}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}
