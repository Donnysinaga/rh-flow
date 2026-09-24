'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ROBINHOOD_CHAIN,
  PONS_FACTORY_ADDRESS,
  PONS_MEME_HOOK_ADDRESS,
  PONS_BUYBACK_VAULT_ADDRESS,
  PONS_FEE_ESCROW_ADDRESS,
} from '@/config/network';

interface SchemaProps {
  blockHeight?: string;
  rpcStatus?: string;
}

export function EcosystemSchema({ blockHeight = '70,226,624', rpcStatus = 'Connected' }: SchemaProps) {
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const nodes = [
    {
      id: 1,
      title: 'Robinhood Chain L2',
      tag: 'Execution Layer',
      color: 'emerald',
      icon: (
        <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      description: 'High-speed EVM L2 execution layer with sub-second finality and near-zero gas (~0.06 Gwei).',
      stats: [
        { label: 'Current Block', value: blockHeight },
        { label: 'RPC Health', value: rpcStatus },
        { label: 'Currency', value: 'ETH' },
      ],
      address: 'https://rpc-robinhood.blockmachine.io',
      type: 'rpc',
    },
    {
      id: 2,
      title: 'Pons Family v2 Engine',
      tag: 'Bonding Curve',
      color: 'cyan',
      icon: (
        <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
      description: 'Decentralized meme launchpad with automatic 4.2 ETH graduation threshold & IPFS metadata.',
      stats: [
        { label: 'Graduation Target', value: '4.2 ETH' },
        { label: 'Phantom Quote', value: '1.68 ETH' },
        { label: 'Curve Supply', value: '1.00B Tokens' },
      ],
      address: PONS_FACTORY_ADDRESS,
      type: 'contract',
    },
    {
      id: 3,
      title: 'Uniswap v4 AMM & Hook',
      tag: 'Graduation Pool',
      color: 'violet',
      icon: (
        <svg className="w-5 h-5 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
      description: 'Liquidity automatically swept into Uniswap v4 MemeHook pools with locked LP and creator fee escrow.',
      stats: [
        { label: 'Hook Router', value: '0xE5e7...e044' },
        { label: 'Buyback Vault', value: '0x42df...1219' },
        { label: 'Fee Escrow', value: '0xd3AF...Ac9e' },
      ],
      address: PONS_MEME_HOOK_ADDRESS,
      type: 'contract',
    },
    {
      id: 4,
      title: 'Orbitra Terminal',
      tag: 'Intelligence Hub',
      color: 'amber',
      icon: (
        <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: 'Institutional-grade Web3 terminal with live candlestick charting, real-time tx feed, and instant swap.',
      stats: [
        { label: 'Live Kline Polling', value: '6000ms' },
        { label: 'Wallet Standard', value: 'EIP-6963' },
        { label: 'Data Source', value: '100% On-Chain' },
      ],
      address: 'https://robinscan.io',
      type: 'portal',
    },
  ];

  return (
    <div className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl overflow-hidden shadow-2xl transition-all">
      {/* Schematic Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/60 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono">
                Robinhood Chain & Pons Protocol Architecture
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                LIVE ON-CHAIN
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono">
              End-to-end execution pipeline from L2 Sequencer to Orbitra Trading Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-md transition-colors"
          >
            <span>{isExpanded ? 'Hide Schematic' : 'View Schematic'}</span>
            <svg
              className={`w-3.5 h-3.5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Schematic Interactive Visual Pipeline */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Visual Architecture Diagram Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 relative">
            {nodes.map((node, index) => {
              const isActive = activeNode === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setActiveNode(isActive ? null : node.id)}
                  className={`relative p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-zinc-900/90 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/40'
                      : 'bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/40'
                  }`}
                >
                  {/* Top Row: Icon, Title & Tag */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 shadow-inner">
                        {node.icon}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-100 font-mono tracking-wide">
                          {node.title}
                        </h4>
                        <span className="text-[10px] font-mono text-zinc-500">
                          Step 0{index + 1}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
                      {node.tag}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
                    {node.description}
                  </p>

                  {/* Dynamic Metrics List */}
                  <div className="grid grid-cols-1 gap-1.5 pt-2 border-t border-zinc-800/60 font-mono text-[11px]">
                    {node.stats.map((stat, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-zinc-500">{stat.label}:</span>
                        <span className="text-zinc-200 font-medium">{stat.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Active Indicator & Link */}
                  <div className="mt-3 pt-2 flex items-center justify-between text-[10px] font-mono text-zinc-500 border-t border-zinc-800/40">
                    <span className="truncate max-w-[140px] text-zinc-400" title={node.address}>
                      {node.address.length > 20 ? `${node.address.slice(0, 10)}...${node.address.slice(-6)}` : node.address}
                    </span>
                    <span className="text-emerald-400 group-hover:underline">
                      {isActive ? 'Details ▲' : 'Inspect ▼'}
                    </span>
                  </div>

                  {/* Step Connector Arrow (for desktop) */}
                  {index < nodes.length - 1 && (
                    <div className="hidden xl:flex absolute -right-3 top-1/2 transform -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 items-center justify-center text-zinc-400 shadow-md">
                      <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Interactive Inspection Detail Banner */}
          {activeNode && (
            <div className="p-3.5 bg-zinc-900/80 border border-zinc-700/60 rounded-lg text-xs font-mono flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-zinc-300">
                <span className="text-emerald-400 font-bold">● Active Inspection:</span>
                <span>{nodes.find((n) => n.id === activeNode)?.title}</span>
                <span className="text-zinc-500">|</span>
                <span className="text-zinc-400 select-all font-mono">
                  {nodes.find((n) => n.id === activeNode)?.address}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={
                    nodes.find((n) => n.id === activeNode)?.type === 'contract'
                      ? `https://robinscan.io/address/${nodes.find((n) => n.id === activeNode)?.address}`
                      : 'https://docs.ponsfamily.com/v2'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[11px] font-semibold transition-colors flex items-center gap-1.5"
                >
                  <span>Verify on Explorer / Docs</span>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          )}

          {/* Feature Highlight Cards with High-Tech Graphics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {/* Card 1 */}
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-zinc-950 to-zinc-900/60 border border-zinc-800/80 rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h5 className="text-xs font-semibold text-zinc-200">Sub-Second Execution</h5>
                <p className="text-[11px] text-zinc-500">Direct on-chain curve swap with zero intermediary markup</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-zinc-950 to-zinc-900/60 border border-zinc-800/80 rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h5 className="text-xs font-semibold text-zinc-200">Verified Protocol Security</h5>
                <p className="text-[11px] text-zinc-500">Official Pons v2 contracts, locked LP & audited buyback vaults</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-zinc-950 to-zinc-900/60 border border-zinc-800/80 rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div>
                <h5 className="text-xs font-semibold text-zinc-200">On-Chain Data Streams</h5>
                <p className="text-[11px] text-zinc-500">Candlestick chart, volume histogram & tx flow</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
