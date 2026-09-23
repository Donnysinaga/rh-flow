'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App runtime error caught by boundary:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0e1014] border border-zinc-800 p-6 rounded-2xl text-center space-y-4 shadow-2xl">
        <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
          !
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-zinc-100">Something went wrong</h2>
          <p className="text-zinc-400 text-xs">
            {error?.message || 'An unexpected error occurred while processing your request.'}
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 bg-[#00C805] hover:bg-[#00E806] text-black font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-xl transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
