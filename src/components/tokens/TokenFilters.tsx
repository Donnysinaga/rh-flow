'use client';

import { PonsLogo } from '@/components/ui/PonsLogo';

interface TokenFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  watchlistCount?: number;
}

export function TokenFilters({ activeFilter, onFilterChange, watchlistCount = 0 }: TokenFiltersProps) {
  const filters = [
    { id: 'all', label: 'All Tokens', icon: null },
    { id: 'new-pairs', label: 'New Pairs', icon: <span className="text-emerald-400 font-bold">✨</span> },
    { id: 'pons', label: 'Pons v2 Launches', icon: <PonsLogo className="w-3.5 h-3.5" size={14} /> },
    { id: 'watchlist', label: `Watchlist (${watchlistCount})`, icon: <span className="text-amber-400">★</span> },
    { id: 'top-volume', label: 'Top Volume', icon: null },
    { id: 'market-cap', label: 'Market Cap', icon: null },
    { id: 'erc20', label: 'ERC-20', icon: null },
    { id: 'erc8056', label: 'Tokenized Stock', icon: null },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full font-mono text-xs">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeFilter === filter.id
              ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
          }`}
        >
          {filter.icon}
          <span>{filter.label}</span>
        </button>
      ))}
    </div>
  );
}
