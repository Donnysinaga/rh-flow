'use client';

import { useState, useEffect, useMemo } from 'react';
import { formatAddress, formatTimeAgo } from '@/lib/utils/format';
import { ROBINHOOD_CHAIN } from '@/config/network';

interface FlowEntry {
  hash: string;
  timestamp: string;
  type: string;
  from: string;
  to: string;
  value: string;
  block: number;
  method: string;
  gasUsed?: string;
}

export function LiveFlow() {
  const [entries, setEntries] = useState<FlowEntry[]>([]);
  const [status, setStatus] = useState<'LIVE' | 'SYNCING' | 'DEGRADED' | 'OFFLINE'>('SYNCING');
  const [filter, setFilter] = useState<'ALL' | 'SWAP' | 'WHALE' | 'APPROVE'>('ALL');

  useEffect(() => {
    let isMounted = true;

    const fetchFlow = async () => {
      try {
        const res = await fetch('/api/flow/recent');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setEntries(data.items || []);
            setStatus(data.status || 'LIVE');
          }
        } else {
          if (isMounted) setStatus('DEGRADED');
        }
      } catch {
        if (isMounted) setStatus('OFFLINE');
      }
    };

    fetchFlow();
    const interval = setInterval(fetchFlow, 6000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const filteredEntries = useMemo(() => {
    if (filter === 'SWAP') return entries.filter((e) => e.type === 'SWAP');
    if (filter === 'APPROVE') return entries.filter((e) => e.type === 'APPROVE');
    if (filter === 'WHALE') {
      return entries.filter((e) => {
        const val = parseFloat(e.value) / 1e18;
        return val >= 0.1 || e.method.toLowerCase().includes('swap');
      });
    }
    return entries;
  }, [entries, filter]);

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'SWAP':
        return 'bg-[#00C805]/10 text-[#00C805] border border-[#00C805]/30';
      case 'APPROVE':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'CALL':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      default:
        return 'bg-[#12171e] text-zinc-400 border border-[#1a222d]';
    }
  };

  const getStatusDot = () => {
    switch (status) {
      case 'LIVE':
        return 'bg-[#00C805] animate-pulse';
      case 'SYNCING':
        return 'bg-yellow-400';
      case 'DEGRADED':
        return 'bg-orange-400';
      default:
        return 'bg-red-400';
    }
  };

  return (
    <div className="flex flex-col bg-[#0a0d12] border border-[#1a222d] rounded-2xl overflow-hidden h-full font-mono text-xs shadow-xl">
      <div className="px-4 py-3 bg-[#0d1117] border-b border-[#1a222d] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-100">Transaction Flow</h3>
          <span className="text-[10px] text-zinc-500 font-semibold">Sequencer Stream</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
          <span className="h-2 w-2 rounded-full bg-[#00C805] animate-pulse" />
          <span className="text-[#00C805] font-semibold">Live</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-3 py-1.5 bg-[#0a0d12] border-b border-[#1a222d] flex items-center gap-1 text-[10px]">
        {(['ALL', 'SWAP', 'WHALE', 'APPROVE'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              filter === f
                ? 'bg-[#00C805]/15 text-[#00C805] font-bold border border-[#00C805]/40'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {f === 'WHALE' ? '🐋 Whale Orders' : f}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 max-h-[520px]">
        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            Streaming recent on-chain transactions...
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.hash}
              className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-[#12171e] rounded-xl border border-transparent hover:border-[#1a222d] transition-colors"
            >
              <span className="text-zinc-500 text-[10px] w-12 shrink-0">
                {formatTimeAgo(entry.timestamp)}
              </span>

              <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium tracking-tight shrink-0 ${getBadgeStyle(entry.type)}`}>
                {entry.type}
              </span>

              <div className="flex items-center gap-1.5 flex-1 text-[11px] text-zinc-400 truncate">
                <a
                  href={`/wallet/${entry.from}`}
                  className="text-zinc-300 hover:text-[#00C805] transition-colors"
                  title={entry.from}
                >
                  {formatAddress(entry.from)}
                </a>
                <span className="text-zinc-600">→</span>
                <span className="text-zinc-400 truncate" title={entry.to}>
                  {entry.method ? entry.method : formatAddress(entry.to)}
                </span>
              </div>

              <a
                href={`${ROBINHOOD_CHAIN.blockExplorers.robinscan}/tx/${entry.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-zinc-500 hover:text-zinc-200 transition-colors text-right shrink-0"
                title="View on Robinscan"
              >
                #{entry.block || '—'}
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
