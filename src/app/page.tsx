'use client';

import { useState, useEffect } from 'react';
import { TokenTable } from '@/components/tokens/TokenTable';
import { LiveFlow } from '@/components/flow/LiveFlow';
import { SearchBar } from '@/components/search/SearchBar';
import { SmartMoney } from '@/components/smartmoney/SmartMoney';
import { MyPortfolio } from '@/components/portfolio/MyPortfolio';
import { MarketOverview } from '@/components/home/MarketOverview';
import { HeroNarrative } from '@/components/home/HeroNarrative';
import { LaunchTokenModal } from '@/components/launch/LaunchTokenModal';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'discovery' | 'flow' | 'smart' | 'portfolio'>('discovery');
  const [isLaunchOpen, setIsLaunchOpen] = useState(false);
  const [stats, setStats] = useState({
    pairs: '54,498+',
    ethPrice: '$2,758.89',
    blockHeight: '...',
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/chain/status');
        if (res.ok) {
          const data = await res.json();
          setStats({
            pairs: data.totalPairs || '54,498+',
            ethPrice: data.ethPrice || '$2,758.89',
            blockHeight: data.blockNumber ? `#${data.blockNumber.toLocaleString()}` : '—',
          });
        }
      } catch {
        // Keep initial
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col w-full p-3 sm:p-5 space-y-4 max-w-[1440px] mx-auto">
      {/* Clean Institutional Market Overview */}
      <MarketOverview
        blockHeight={stats.blockHeight}
        ethPrice={stats.ethPrice}
        totalPairs={stats.pairs}
      />

      {/* Narrative & Value Proposition */}
      <HeroNarrative />

      {/* Global Search & Primary Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <div className="w-full md:w-[420px]">
          <SearchBar />
        </div>
        <div className="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('discovery')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'discovery'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Token Discovery
          </button>
          <button
            onClick={() => setActiveTab('flow')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'flow'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Flow Stream
          </button>
          <button
            onClick={() => setActiveTab('smart')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'smart'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Smart Money
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'portfolio'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            My Portfolio
          </button>
        </div>
      </div>

      {/* Main Terminal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Main Content Area */}
        <div className={activeTab === 'flow' || activeTab === 'portfolio' ? 'lg:col-span-12' : 'lg:col-span-8'}>
          {activeTab === 'discovery' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-200 font-mono">
                    Token Discovery
                  </h2>
                  <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                    Verified on-chain contracts & Blockscout indexed tokens
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLaunchOpen(true)}
                  className="cursor-pointer px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span className="text-emerald-400 font-bold">+</span>
                  <span>Launch Token</span>
                </button>
              </div>
              <TokenTable />
            </div>
          )}

          {activeTab === 'flow' && (
            <div className="space-y-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-200 font-mono">
                  Trade & Transfer Flow
                </h2>
                <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                  Sub-second transaction stream from Robinhood Chain sequencer
                </p>
              </div>
              <LiveFlow />
            </div>
          )}

          {activeTab === 'smart' && (
            <div className="space-y-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-200 font-mono">
                  Smart Money Tracker
                </h2>
                <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                  Address classification based on measurable on-chain activity
                </p>
              </div>
              <SmartMoney />
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div className="space-y-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-200 font-mono">
                  Connected Wallet Portfolio
                </h2>
                <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                  ETH and ERC-20 token holdings on Robinhood Chain
                </p>
              </div>
              <MyPortfolio />
            </div>
          )}
        </div>

        {/* Side Panel for Flow (Visible during Token Discovery & Smart Money) */}
        {activeTab !== 'flow' && activeTab !== 'portfolio' && (
          <div className="lg:col-span-4 sticky top-20">
            <LiveFlow />
          </div>
        )}
      </div>

      {/* Launch Token Modal */}
      <LaunchTokenModal isOpen={isLaunchOpen} onClose={() => setIsLaunchOpen(false)} />
    </div>
  );
}
