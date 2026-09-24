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
          className="w-full pl-9 pr-8 py-2 bg-[#0a0d12] border border-[#1a222d] rounded-xl text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-[#00C805]/70 focus:ring-1 focus:ring-[#00C805]/30 transition-all shadow-sm"
          placeholder="Search by token address, symbol, or wallet (0x...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="w-3.5 h-3.5 border-2 border-zinc-700 border-t-[#00C805] rounded-full animate-spin" />
          </div>
        )}
      </form>

      {isOpen && results.length > 0 && (
        <div className="absolute mt-1.5 w-full bg-[#0a0d12] border border-[#1a222d] rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="max-h-64 overflow-y-auto divide-y divide-[#1a222d]/60 font-mono text-xs">
            {results.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left px-3.5 py-2.5 hover:bg-[#12171e] transition-colors flex items-center justify-between gap-2 cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="font-bold text-white truncate">
                    {item.name} {item.symbol ? `(${item.symbol})` : ''}
                  </div>
                  <div className="text-[11px] text-zinc-400 truncate">{item.address}</div>
                </div>
                <span className="shrink-0 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#12171e] text-[#00C805] border border-[#00C805]/20 font-bold">
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
