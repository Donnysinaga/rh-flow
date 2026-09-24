'use client';

import { useState } from 'react';
import { OrbitraLogo } from '@/components/ui/OrbitraLogo';

export function HeroNarrative() {
  const [activeTab, setActiveTab] = useState<'launches' | 'trading' | 'rwa'>('launches');
  const [isExpanded, setIsExpanded] = useState(true);

  const stories = {
    launches: {
      tag: 'FAIR LAUNCH PROTOCOL',
      title: 'Orbitra Bonding Engine & Autonomous Graduation',
      lead: 'Every new token launched on Orbitra begins on a transparent mathematical bonding curve. 100% of the 1,000,000,000 token supply is locked into the automated contract with zero dev pre-mine and zero hidden team allocations.',
      details: [
        'Predictable Price Discovery: Token pricing is driven entirely by mathematical liquidity curves without artificial slippage or manual manipulation.',
        'Autonomous AMM Graduation: Once the bonding target is fulfilled, liquidity is permanently migrated and locked into decentralized AMM pools.',
        'Creator & Community Rewards: Built-in protocol fee distributions and automated liquidity locks preserve sustainable project longevity.',
      ],
      icon: <OrbitraLogo className="w-4 h-4 shrink-0" size={16} />,
      badgeColor: 'text-[#00C805] border-[#00C805]/30 bg-[#00C805]/10',
    },
    trading: {
      tag: 'L2 SPEED & FINALITY',
      title: 'Sub-Second Non-Custodial Trading on Robinhood Chain',
      lead: 'Execute swaps directly from your personal Web3 wallet (MetaMask, OKX, Phantom, WalletConnect, Binance, 1inch, Uniswap) with near-instant block finality and negligible gas costs.',
      details: [
        'Non-Custodial Swaps: Your private keys and digital assets remain exclusively under your control at all times.',
        'Anti-MEV Front-Running Protection: Sequencer-level ordering safeguards community trades against predatory sandwich bots.',
        'Universal Multi-Wallet Gateway: Instant plug-and-play connectivity supporting over 550+ Web3 wallet standards.',
      ],
      icon: <span className="text-[#00C805] font-bold">⚡</span>,
      badgeColor: 'text-[#00C805] border-[#00C805]/30 bg-[#00C805]/10',
    },
    rwa: {
      tag: 'CHAIN INTELLIGENCE',
      title: 'Real-Time Flow Stream, Smart Money & On-Chain Analytics',
      lead: 'Orbitra indexes the complete Robinhood Chain state in real time, delivering live transaction flows, whale movement alerts, and Blockscout-verified contract data directly to your dashboard.',
      details: [
        'Live Sequencer Stream: Monitor token transfers, mints, and DEX swaps the second blocks are minted by the L2 sequencer.',
        'Smart Money Radar: Track high-performing addresses and detect fresh capital rotations across the Robinhood Chain ecosystem.',
        'Unified Portfolio Manager: Real-time balance calculations, token valuations, and historical interaction logs in one terminal.',
      ],
      icon: <span className="text-emerald-400 font-bold">🌐</span>,
      badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    },
  };

  const current = stories[activeTab];

  return (
    <div className="w-full bg-[#0a0d12] border border-[#1a222d] rounded-2xl p-4 sm:p-5 font-mono text-xs transition-all shadow-sm">
      {/* Visual Banner / Hero Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center pb-4 border-b border-[#1a222d]">
        {/* Left Side: Artwork & Visual Emblem */}
        <div className="lg:col-span-4 flex items-center gap-4 bg-[#0e1217] p-3.5 rounded-xl border border-[#1a222d]">
          <div className="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-[#00C805]/30 shadow-lg shadow-[#00C805]/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/orbitra-hero.jpg"
              alt="Orbitra Planet"
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[#00C805] text-base sm:text-lg font-black tracking-tight font-sans">
                ORBITRA
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#00C805]/10 text-[#00C805] border border-[#00C805]/20 text-[10px] font-bold">
                $ORB
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans leading-tight">
              Decentralized Liquidity & Trading Terminal for Robinhood Chain
            </p>
            <div className="flex items-center gap-2 pt-0.5 text-[10px] text-zinc-500">
              <span className="flex h-1.5 w-1.5 rounded-full bg-[#00C805] animate-pulse" />
              <span>Chain ID 4663 Active</span>
            </div>
          </div>
        </div>

        {/* Right Side: Narrative Category Switcher */}
        <div className="lg:col-span-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[11px] uppercase tracking-wider text-[#00C805] font-bold flex items-center gap-1.5">
              <span>●</span> Ecosystem Architecture
            </span>
            <p className="text-zinc-400 text-xs font-sans">
              Explore the core protocols powering frictionless Web3 trading on Robinhood Chain.
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('launches')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'launches'
                  ? 'bg-[#00C805]/10 text-[#00C805] border border-[#00C805]/30 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-[#12171e]'
              }`}
            >
              <OrbitraLogo className="w-3.5 h-3.5" size={14} />
              <span>Fair Launch</span>
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
              <span>L2 Execution</span>
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
              <span className="text-emerald-400">🌐</span>
              <span>Chain Analytics</span>
            </button>
          </div>
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
          <span className="text-zinc-400">Orbitra ($ORB) Protocol</span>
          <span>•</span>
          <span className="text-zinc-400">Robinhood Chain (EVM Layer 2)</span>
        </div>
        <span className="text-zinc-400">Terminal v2.1.0</span>
      </div>
    </div>
  );
}
