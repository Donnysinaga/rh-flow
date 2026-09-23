import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] text-zinc-400 font-mono">
      <h2 className="text-xl mb-4 text-zinc-200">404 - Page not found.</h2>
      <Link href="/" className="hover:text-emerald-400 transition-colors underline underline-offset-4 text-sm">
        Return to terminal
      </Link>
    </div>
  );
}
