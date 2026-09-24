'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { TokenFilters } from './TokenFilters';
import { useToast } from '@/components/ui/ToastProvider';
import { PonsLogo } from '@/components/ui/PonsLogo';

export interface TokenItem {
  address: string;
  name: string;
  symbol: string;
  icon_url?: string | null;
  price?: number | null;
  market_cap?: number | null;
  volume_24h?: number | null;
  holders?: number | null;
  type?: string;
  decimals?: number;
  total_supply?: string;
  progress?: number;
  phaseLabel?: string;
  curveAddress?: string;
}

const formatCompact = (num: number | null | undefined): string => {
  if (num === null || num === undefined || isNaN(num)) return '—';
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(num);
};

const formatPrice = (price: number | null | undefined): string => {
  if (price === null || price === undefined || isNaN(price)) return '—';
  if (price < 0.0001) return '$' + price.toFixed(6);
  if (price < 1) return '$' + price.toFixed(4);
  return '$' + price.toFixed(2);
};

export function TokenTable() {
  const [tokens, setTokens] = useState<TokenItem[]>([]);
  const [ponsTokens, setPonsTokens] = useState<TokenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const router = useRouter();
  const { toastInfo } = useToast();

  useEffect(() => {
    // Load watchlist from localStorage
    try {
      const stored = localStorage.getItem('rh_flow_watchlist');
      if (stored) {
        setWatchlist(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }

    let isMounted = true;
    const fetchAllTokens = async () => {
      try {
        const [resAll, resPons] = await Promise.allSettled([
          fetch('/api/tokens'),
          fetch('/api/tokens?type=pons'),
        ]);

        if (isMounted) {
          if (resAll.status === 'fulfilled' && resAll.value.ok) {
            const dataAll = await resAll.value.json();
            setTokens(dataAll.items || []);
          }
          if (resPons.status === 'fulfilled' && resPons.value.ok) {
            const dataPons = await resPons.value.json();
            setPonsTokens(dataPons.items || []);
          }
          setError(null);
        }
      } catch (err) {
        if (isMounted) setError('Unable to reach Robinhood Chain token indexer.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAllTokens();
    const interval = setInterval(fetchAllTokens, 12000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const toggleWatchlist = (e: React.MouseEvent, token: TokenItem) => {
    e.stopPropagation();
    const addr = token.address;
    const isAdding = !watchlist.includes(addr);
    const next = isAdding
      ? [...watchlist, addr]
      : watchlist.filter((a) => a !== addr);

    setWatchlist(next);
    try {
      localStorage.setItem('rh_flow_watchlist', JSON.stringify(next));
    } catch {
      // Ignore
    }

    if (isAdding) {
      toastInfo('Added to Watchlist', `${token.symbol || token.name} added to your favorites.`);
    } else {
      toastInfo('Removed from Watchlist', `${token.symbol || token.name} removed from your favorites.`);
    }
  };

  const filteredTokens = useMemo(() => {
    let list = activeFilter === 'pons' ? [...ponsTokens] : [...tokens];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.name?.toLowerCase().includes(q) ||
          t.symbol?.toLowerCase().includes(q) ||
          t.address?.toLowerCase().includes(q)
      );
    }

    switch (activeFilter) {
      case 'new-pairs':
        // Sort by fresh launches (lowest holders or newly created)
        return [...list].sort((a, b) => (a.holders || 1) - (b.holders || 1));
      case 'pons':
        return list;
      case 'watchlist':
        return list.filter((t) => watchlist.includes(t.address));
      case 'top-volume':
        return list.sort((a, b) => (b.volume_24h || 0) - (a.volume_24h || 0));
      case 'market-cap':
        return list.sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0));
      case 'erc20':
        return list.filter((t) => t.type === 'ERC-20');
      case 'erc8056':
        return list.filter((t) => t.type === 'ERC-8056');
      default:
        return list.sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0));
    }
  }, [tokens, ponsTokens, activeFilter, searchQuery, watchlist]);


  return (
    <div className="space-y-3 font-mono text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0a0d12] p-3 rounded-xl border border-[#1a222d]">
        <TokenFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          watchlistCount={watchlist.length}
        />
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Filter tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 bg-[#0d1117] border border-[#1a222d] rounded-lg text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-[#00C805] font-mono transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="w-full overflow-x-auto rounded-xl border border-[#1a222d] bg-[#0a0d12] p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-8 bg-[#0d1117] rounded-lg" />
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-[#0d1117]/60 rounded-lg" />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-xs text-zinc-500 font-mono bg-[#0a0d12] rounded-xl border border-[#1a222d]">
          {error}
        </div>
      ) : filteredTokens.length === 0 ? (
        <div className="p-8 text-center text-xs text-zinc-500 font-mono bg-[#0a0d12] rounded-xl border border-[#1a222d]">
          {activeFilter === 'watchlist'
            ? 'No tokens in your watchlist yet. Click the ⭐ icon on any token to add.'
            : 'No matching tokens found on Robinhood Chain.'}
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-xl border border-[#1a222d] bg-[#0a0d12] shadow-xl">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="bg-[#0d1117] text-zinc-400 font-mono uppercase tracking-wider text-[11px] border-b border-[#1a222d]">
              <tr>
                <th className="px-3 py-3 font-medium w-8">⭐</th>
                <th className="px-3 py-3 font-medium w-8">#</th>
                <th className="px-3 py-3 font-medium">Token</th>
                <th className="px-3 py-3 font-medium text-right">Price</th>
                <th className="px-3 py-3 font-medium text-right">Market Cap</th>
                <th className="px-3 py-3 font-medium text-right">Volume 24h</th>
                <th className="px-3 py-3 font-medium text-right">Holders</th>
                <th className="px-3 py-3 font-medium text-right">Standard</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a222d]/60">
              {filteredTokens.map((token, idx) => {
                const isStarred = watchlist.includes(token.address);
                return (
                  <tr
                    key={token.address}
                    onClick={() => router.push(`/token/${token.address}`)}
                    className="group cursor-pointer hover:bg-[#12171e] transition-colors"
                  >
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={(e) => toggleWatchlist(e, token)}
                        className={`text-sm transition-colors ${
                          isStarred ? 'text-amber-400' : 'text-zinc-600 hover:text-zinc-400'
                        }`}
                        title={isStarred ? 'Remove from Watchlist' : 'Add to Watchlist'}
                      >
                        {isStarred ? '★' : '☆'}
                      </button>
                    </td>
                    <td className="px-3 py-3 text-zinc-500 font-mono">{idx + 1}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        {token.icon_url ? (
                          <img
                            src={token.icon_url}
                            alt={token.name}
                            className="w-7 h-7 rounded-full bg-[#12171e] shrink-0 border border-[#1a222d]"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[#12171e] border border-[#1a222d] flex items-center justify-center text-zinc-300 font-mono font-bold text-[11px] shrink-0">
                            {token.symbol?.slice(0, 2) || 'TK'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-zinc-100 truncate group-hover:text-[#00C805] transition-colors">
                              {token.name || 'Unnamed Token'}
                            </span>
                            {token.progress !== undefined && (
                              <PonsLogo className="w-3 h-3 shrink-0" size={12} />
                            )}
                            {(token.holders && token.holders <= 25) || activeFilter === 'new-pairs' ? (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00C805]/10 text-[#00C805] border border-[#00C805]/30 shrink-0 font-bold font-mono">
                                NEW
                              </span>
                            ) : null}
                          </div>
                          <div className="text-[11px] text-zinc-400 font-mono truncate">{token.symbol || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-zinc-100 font-medium">
                      {formatPrice(token.price)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-zinc-300">
                      {token.market_cap ? `$${formatCompact(token.market_cap)}` : '—'}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-zinc-300">
                      {token.volume_24h ? `$${formatCompact(token.volume_24h)}` : '—'}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-zinc-300">
                      {token.progress !== undefined ? (
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[#00C805] font-bold text-[11px]">
                            {token.progress.toFixed(1)}% curve
                          </span>
                          <div className="w-16 bg-[#12171e] h-1.5 rounded-full overflow-hidden border border-[#1a222d]">
                            <div
                              className="bg-[#00C805] h-full rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, token.progress)}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        formatCompact(token.holders)
                      )}
                    </td>
                    <td className="px-3 py-3 text-right font-mono">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] ${
                          token.type === 'Pons v2'
                            ? 'bg-[#00C805]/10 border border-[#00C805]/30 text-[#00C805] font-semibold'
                            : 'bg-[#12171e] border border-[#1a222d] text-zinc-400'
                        }`}
                      >
                        {token.type || 'ERC-20'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
