'use client';

import Link from 'next/link';
import { PonsLogo } from '@/components/ui/PonsLogo';

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
      <div className="bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700/80 rounded-lg p-3 transition-colors flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-500 text-[11px]">
          <span>ETH Price</span>
          <span className="text-zinc-400 text-[10px]">USD</span>
        </div>
        <div className="mt-1.5 flex items-baseline justify-between">
          <span className="text-sm sm:text-base font-bold text-zinc-100">{ethPrice}</span>
          <span className="text-[10px] text-zinc-400">Gas: ~0.06 Gwei</span>
        </div>
      </div>

      {/* Metric 2: Total On-Chain Pairs */}
      <div className="bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700/80 rounded-lg p-3 transition-colors flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-500 text-[11px]">
          <span>Tracked Pairs</span>
          <span className="text-zinc-400 text-[10px]">Indexed</span>
        </div>
        <div className="mt-1.5 flex items-baseline justify-between">
          <span className="text-sm sm:text-base font-bold text-zinc-100">{totalPairs}</span>
          <span className="text-[10px] text-emerald-400">AMM & Curves</span>
        </div>
      </div>

      {/* Metric 3: Pons v2 Launchpad */}
      <div className="bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700/80 rounded-lg p-3 transition-colors flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-500 text-[11px]">
          <span className="flex items-center gap-1.5">
            <PonsLogo className="w-3.5 h-3.5" size={14} />
            <span className="text-zinc-300 font-medium">Pons Family v2</span>
          </span>
          <a
            href="https://docs.ponsfamily.com/v2"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-emerald-400 hover:underline"
          >
            Docs ↗
          </a>
        </div>
        <div className="mt-1.5 flex items-baseline justify-between">
          <span className="text-sm sm:text-base font-bold text-zinc-100">4.2 ETH</span>
          <span className="text-[10px] text-zinc-400">Curve Target</span>
        </div>
      </div>

      {/* Metric 4: Sequencer & Node Height */}
      <div className="bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700/80 rounded-lg p-3 transition-colors flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-500 text-[11px]">
          <span>Sequencer Height</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>
        <div className="mt-1.5 flex items-baseline justify-between">
          <span className="text-xs sm:text-sm font-bold text-zinc-200 truncate">{blockHeight}</span>
          <span className="text-[10px] text-zinc-500">Block Height</span>
        </div>
      </div>
    </div>
  );
}
