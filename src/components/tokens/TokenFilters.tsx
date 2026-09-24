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
    { id: 'new-pairs', label: 'New Pairs', icon: <span className="text-[#00C805] font-bold">✨</span> },
    { id: 'pons', label: 'Fair Flow Curves', icon: <PonsLogo className="w-3.5 h-3.5" size={14} /> },
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
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeFilter === filter.id
              ? 'bg-[#00C805]/15 text-[#00C805] border border-[#00C805]/40 shadow-sm font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#12171e] border border-transparent'
          }`}
        >
          {filter.icon}
          <span>{filter.label}</span>
        </button>
      ))}
    </div>
  );
}
