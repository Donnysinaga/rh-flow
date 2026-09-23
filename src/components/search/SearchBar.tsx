'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { isValidAddress } from '@/lib/utils/format';

interface SearchResultItem {
  address: string;
  name: string;
  symbol?: string;
  type: 'token' | 'contract' | 'address';
}

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    if (isValidAddress(q)) {
      setResults([
        { type: 'token', address: q, name: 'Inspect Token / Contract', symbol: 'CA' },
        { type: 'address', address: q, name: 'Inspect Wallet Activity', symbol: 'EOA' },
      ]);
      setIsOpen(true);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.items || []);
          setIsOpen(true);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: SearchResultItem) => {
    setIsOpen(false);
    setQuery('');
    if (item.type === 'address') {
      router.push(`/wallet/${item.address}`);
    } else {
      router.push(`/token/${item.address}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (isValidAddress(q)) {
      setIsOpen(false);
      setQuery('');
      router.push(`/token/${q}`);
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          className="w-full pl-9 pr-8 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 font-mono focus:outline-none focus:border-zinc-600 transition-colors"
          placeholder="Search by token address, symbol, or wallet (0x...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="w-3.5 h-3.5 border-2 border-zinc-600 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        )}
      </form>

      {isOpen && results.length > 0 && (
        <div className="absolute mt-1 w-full bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden z-50">
          <div className="max-h-64 overflow-y-auto divide-y divide-zinc-800/60 font-mono text-xs">
            {results.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left px-3.5 py-2.5 hover:bg-zinc-800/80 transition-colors flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-zinc-200 truncate">
                    {item.name} {item.symbol ? `(${item.symbol})` : ''}
                  </div>
                  <div className="text-[11px] text-zinc-500 truncate">{item.address}</div>
                </div>
                <span className="shrink-0 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                  {item.type}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
