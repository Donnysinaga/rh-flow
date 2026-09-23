'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global layout error caught by GlobalError:', error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="bg-[#09090b] text-zinc-100 min-h-screen flex items-center justify-center p-4 font-sans antialiased">
        <div className="max-w-md w-full bg-[#0e1014] border border-zinc-800 p-6 rounded-2xl text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold font-mono">
            !
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-zinc-100">RH FLOW — Page Error</h2>
            <p className="text-zinc-400 text-xs">
              {error?.message || 'An unexpected runtime error occurred. Please reload to resume.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="px-4 py-2 bg-[#00C805] hover:bg-[#00E806] text-black font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Reload Page
            </button>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') window.location.href = '/';
              }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-xl transition-colors cursor-pointer"
            >
              Go to Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
