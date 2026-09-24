'use client';

import Link from 'next/link';
import { OrbitraLogo } from '@/components/ui/OrbitraLogo';

interface MarketOverviewProps {
  blockHeight?: string;
  rpcStatus?: string;
  ethPrice?: string;
  totalPairs?: string;
}

export function MarketOverview({
  blockHeight = '#70,226,624',
  ethPrice = '$2,758.89',
  totalPairs = '54,498+',
}: MarketOverviewProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 w-full font-mono text-xs">
      {/* Metric 1: ETH & Gas */}
      <div className="bg-[#0a0d12] border border-[#1a222d] hover:border-[#00C805]/40 rounded-xl p-3.5 transition-all shadow-sm flex flex-col justify-between group">
        <div className="flex items-center justify-between text-zinc-400 text-[11px]">
          <span className="font-semibold tracking-wide">ETH Price</span>
          <span className="text-zinc-500 text-[10px]">USD</span>
        </div>
        <div className="mt-1.5 flex items-baseline justify-between">
          <span className="text-sm sm:text-base font-bold text-white">{ethPrice}</span>
          <span className="text-[10px] text-[#00C805] font-semibold">Gas: ~0.06 Gwei</span>
        </div>
      </div>

      {/* Metric 2: Total On-Chain Pairs */}
      <div className="bg-[#0a0d12] border border-[#1a222d] hover:border-[#00C805]/40 rounded-xl p-3.5 transition-all shadow-sm flex flex-col justify-between group">
        <div className="flex items-center justify-between text-zinc-400 text-[11px]">
          <span className="font-semibold tracking-wide">Tracked Pairs</span>
          <span className="text-zinc-500 text-[10px]">Indexed</span>
        </div>
        <div className="mt-1.5 flex items-baseline justify-between">
          <span className="text-sm sm:text-base font-bold text-white">{totalPairs}</span>
          <span className="text-[10px] text-[#00C805] font-semibold">AMM & Curves</span>
        </div>
      </div>

      {/* Metric 3: Orbitra Engine */}
      <div className="bg-[#0a0d12] border border-[#1a222d] hover:border-[#00C805]/40 rounded-xl p-3.5 transition-all shadow-sm flex flex-col justify-between group">
        <div className="flex items-center justify-between text-zinc-400 text-[11px]">
          <span className="flex items-center gap-1.5">
            <OrbitraLogo className="w-3.5 h-3.5" size={14} />
            <span className="text-zinc-200 font-semibold">Orbitra Engine</span>
          </span>
          <span className="text-[10px] px-1.5 py-0.2 bg-[#00C805]/10 text-[#00C805] border border-[#00C805]/20 rounded font-bold">Live</span>
        </div>
        <div className="mt-1.5 flex items-baseline justify-between">
          <span className="text-sm sm:text-base font-bold text-white">4.2 ETH</span>
          <span className="text-[10px] text-zinc-400">Graduation Target</span>
        </div>
      </div>

      {/* Metric 4: Sequencer & Node Height */}
      <div className="bg-[#0a0d12] border border-[#1a222d] hover:border-[#00C805]/40 rounded-xl p-3.5 transition-all shadow-sm flex flex-col justify-between group">
        <div className="flex items-center justify-between text-zinc-400 text-[11px]">
          <span className="font-semibold tracking-wide">Sequencer Height</span>
          <span className="w-2 h-2 rounded-full bg-[#00C805] animate-pulse" />
        </div>
        <div className="mt-1.5 flex items-baseline justify-between">
          <span className="text-xs sm:text-sm font-bold text-white truncate">{blockHeight}</span>
          <span className="text-[10px] text-zinc-400">Robinhood Block</span>
        </div>
      </div>
    </div>
  );
}
