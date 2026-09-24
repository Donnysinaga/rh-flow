'use client';

import { useState } from 'react';
import { PonsLogo } from '@/components/ui/PonsLogo';

export function HeroNarrative() {
  const [activeTab, setActiveTab] = useState<'launches' | 'trading' | 'rwa'>('launches');
  const [isExpanded, setIsExpanded] = useState(true);

  const stories = {
    launches: {
      tag: 'FAIR LAUNCH PROTOCOL',
      title: 'RH Flow Fair Curve & Automated Graduation',
      lead: 'Every new token begins on a transparent mathematical bonding curve where the entire 1 Billion supply is minted into the contract with zero hidden dev allocations.',
      details: [
        'Deterministic Pricing: Token value grows predictably based strictly on real on-chain liquidity demand.',
        'Automated Uniswap Migration: Upon hitting the funding milestone, the protocol locks all liquidity permanently into AMM pools.',
        'Builder Incentives: Creator fee vaults and automated buybacks support sustainable project longevity.',
      ],
      icon: <PonsLogo className="w-4 h-4 shrink-0" size={16} />,
      badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    },
    trading: {
      tag: 'L2 EXECUTION',
      title: 'High-Speed Non-Custodial Trading on Robinhood Chain',
      lead: 'Execute swaps directly from your personal Web3 wallet with sub-second block confirmations and near-zero gas overhead.',
      details: [
        'Non-Custodial Swaps: Your private keys and assets remain fully in your custody throughout every trade.',
        'Anti-Bot Protection: Decaying opening tax protects genuine community participants against front-running algorithms.',
        'Multi-Wallet Compatibility: Seamless plug-and-play support for MetaMask, OKX, Phantom, Coinbase, and mobile dApps.',
      ],
      icon: <span className="text-cyan-400 font-bold">⚡</span>,
      badgeColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    },
    rwa: {
      tag: 'ECOSYSTEM EXPANSION',
      title: 'Community Memecoins & Tokenized Real-World Assets',
      lead: 'Robinhood Chain unifies rapid community token creation and tokenized equity assets into a single decentralized liquidity network.',
      details: [
        'Community Innovations: Discover emerging tokens launched by creators and builders worldwide.',
        'Decentralized Liquidity: Access price charts, depth, and transfer feeds as blocks are produced.',
        'Unified Terminal: Track your personal portfolio, whale movements, and market volume in one streamlined interface.',
      ],
      icon: <span className="text-amber-400 font-bold">🏛️</span>,
      badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    },
  };

  const current = stories[activeTab];

  return (
    <div className="w-full bg-[#0a0d12] border border-[#1a222d] rounded-2xl p-4 sm:p-5 font-mono text-xs transition-all shadow-sm">
      {/* Header Bar with Narrative Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#1a222d] pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-[#00C805] animate-pulse" />
          <span className="text-[11px] uppercase tracking-wider text-[#00C805] font-bold">
            Ecosystem Architecture & Guidelines
          </span>
        </div>

        {/* Narrative Category Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveTab('launches')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'launches'
                ? 'bg-[#00C805]/10 text-[#00C805] border border-[#00C805]/30 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-[#12171e]'
            }`}
          >
            <PonsLogo className="w-3 h-3" size={12} />
            <span>Fair Flow Launches</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('trading')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'trading'
                ? 'bg-[#00C805]/10 text-[#00C805] border border-[#00C805]/30 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-[#12171e]'
            }`}
          >
            <span className="text-[#00C805]">⚡</span>
            <span>Speed & Execution</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rwa')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'rwa'
                ? 'bg-[#00C805]/10 text-[#00C805] border border-[#00C805]/30 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-[#12171e]'
            }`}
          >
            <span className="text-[#00C805]">🏛️</span>
            <span>Ecosystem & Assets</span>
          </button>
        </div>
      </div>

      {/* Dynamic Narrative Body */}
      <div className="pt-3.5 space-y-3">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${current.badgeColor}`}>
                {current.tag}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white font-sans tracking-tight">
              {current.title}
            </h2>
            <p className="text-zinc-400 text-xs leading-relaxed font-sans">
              {current.lead}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="cursor-pointer text-[#00C805] hover:text-[#00E806] text-[11px] font-bold whitespace-nowrap self-start md:self-center transition-colors flex items-center gap-1"
          >
            <span>{isExpanded ? 'Collapse ▲' : 'Details ▼'}</span>
          </button>
        </div>

        {/* Narrative Key Points */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2 border-t border-[#1a222d] animate-in fade-in duration-200">
            {current.details.map((detail, idx) => {
              const [title, desc] = detail.split(': ');
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#0e1217] border border-[#1a222d] hover:border-[#00C805]/30 space-y-1 transition-colors"
                >
                  <div className="text-white font-bold text-[11px] flex items-center gap-1.5">
                    <span className="text-[#00C805] text-[10px]">●</span>
                    <span>{title}</span>
                  </div>
                  {desc && (
                    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                      {desc}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Clean Footer Metadata */}
      <div className="mt-3 pt-2.5 border-t border-[#1a222d] flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-500 font-mono">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="text-zinc-400">Pons v2 Fair Launchpad</span>
          <span>•</span>
          <span className="text-zinc-400">Robinhood Chain</span>
        </div>
        <span className="text-zinc-400">Terminal v1.0.4</span>
      </div>
    </div>
  );
}
