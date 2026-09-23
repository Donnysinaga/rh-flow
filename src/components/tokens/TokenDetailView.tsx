'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CopyableAddress } from '@/components/ui/CopyableAddress';
import { formatTimeAgo, formatNumber } from '@/lib/utils/format';
import { ROBINHOOD_CHAIN } from '@/config/network';
import { siteConfig } from '@/config/site';
import { PriceChart } from '@/components/charts/PriceChart';
import { SwapWidget } from '@/components/trade/SwapWidget';
import { TokenSecurityAudit } from '@/components/tokens/TokenSecurityAudit';
import { PonsLogo } from '@/components/ui/PonsLogo';
import { HolderAuditCard } from '@/components/tokens/HolderAuditCard';
import { PnLShareModal } from '@/components/share/PnLShareModal';

interface TokenDetailProps {
  address: string;
}

export function TokenDetailView({ address }: TokenDetailProps) {
  const [token, setToken] = useState<any>(null);
  const [holders, setHolders] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'holders' | 'transfers' | 'audit'>('holders');
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchTokenData = async () => {
      try {
        setLoading(true);
        const [resToken, resHolders, resTransfers] = await Promise.all([
          fetch(`/api/tokens/${address}`),
          fetch(`/api/tokens/${address}/holders`),
          fetch(`/api/tokens/${address}/transfers`),
        ]);

        if (!resToken.ok) {
          throw new Error('Token not found on Robinhood Chain');
        }

        const dataToken = await resToken.json();
        const dataHolders = resHolders.ok ? await resHolders.json() : { items: [] };
        const dataTransfers = resTransfers.ok ? await resTransfers.json() : { items: [] };

        if (isMounted) {
          setToken(dataToken);
          setHolders(dataHolders.items || []);
          setTransfers(dataTransfers.items || []);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Couldn't load this token from Robinhood Chain.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTokenData();
    return () => {
      isMounted = false;
    };
  }, [address]);

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto p-4 animate-pulse space-y-4">
        <div className="h-20 bg-zinc-900 rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-900/60 rounded-lg" />
          ))}
        </div>
        <div className="h-80 bg-zinc-900/40 rounded-lg" />
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="max-w-[1440px] mx-auto p-8 text-center font-mono space-y-4">
        <div className="text-zinc-400 text-sm">
          {error || 'Token contract not verified or not found on Robinhood Chain.'}
        </div>
        <div className="text-xs text-zinc-600">Contract: {address}</div>
        <div>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded text-xs transition-colors"
          >
            ← Back to Token Discovery
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (val: number | null | undefined) => {
    if (val === null || val === undefined) return '—';
    if (val < 0.0001) return '$' + val.toFixed(6);
    if (val < 1) return '$' + val.toFixed(4);
    return '$' + val.toFixed(2);
  };

  return (
    <div className="max-w-[1440px] mx-auto p-3 sm:p-5 space-y-5">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
        <Link href="/" className="hover:text-zinc-300 transition-colors">
          Discovery
        </Link>
        <span>/</span>
        <span className="text-zinc-300 font-semibold">{token.symbol || 'Token'}</span>
      </div>

      {/* Header Info Banner */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {token.iconUrl ? (
            <img
              src={token.iconUrl}
              alt={token.name}
              className="w-12 h-12 rounded-full bg-zinc-900 shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 font-mono font-bold text-base shrink-0">
              {token.symbol?.slice(0, 2) || 'TK'}
            </div>
          )}
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg sm:text-xl font-bold text-zinc-100">{token.name}</h1>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-zinc-900 border border-zinc-800 text-zinc-300">
                {token.symbol}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-900 text-zinc-500 border border-zinc-800">
                {token.type || 'ERC-20'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
              <span className="text-zinc-500">CA:</span>
              <CopyableAddress address={address} full className="text-zinc-300" />
            </div>
          </div>
        </div>

        {/* Action Links */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <a
            href={`${ROBINHOOD_CHAIN.blockExplorers.robinscan}/token/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded text-zinc-300 hover:text-zinc-100 transition-colors"
          >
            Robinscan ↗
          </a>
          <a
            href={`${ROBINHOOD_CHAIN.blockExplorers.blockscout}/token/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded text-zinc-300 hover:text-zinc-100 transition-colors"
          >
            Blockscout ↗
          </a>
          <button
            onClick={() => setIsShareOpen(true)}
            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded font-semibold transition-colors flex items-center gap-1.5"
          >
            <span>📸</span>
            <span>Share PnL</span>
          </button>
          <a
            href={siteConfig.PONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded text-zinc-300 hover:text-zinc-100 transition-colors"
          >
            PONS Launchpad ↗
          </a>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5 space-y-1">
          <div className="text-[10px] uppercase text-zinc-500 tracking-wider">Price</div>
          <div className="text-base font-semibold text-zinc-100">{formatPrice(token.price)}</div>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5 space-y-1">
          <div className="text-[10px] uppercase text-zinc-500 tracking-wider">Market Cap</div>
          <div className="text-base font-semibold text-zinc-100">
            {token.marketCap ? `$${formatNumber(token.marketCap)}` : '—'}
          </div>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5 space-y-1">
          <div className="text-[10px] uppercase text-zinc-500 tracking-wider">24h Volume</div>
          <div className="text-base font-semibold text-zinc-100">
            {token.volume24h ? `$${formatNumber(token.volume24h)}` : '—'}
          </div>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5 space-y-1">
          <div className="text-[10px] uppercase text-zinc-500 tracking-wider">Holders</div>
          <div className="text-base font-semibold text-zinc-100">
            {token.holderCount ? formatNumber(token.holderCount) : '—'}
          </div>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5 space-y-1">
          <div className="text-[10px] uppercase text-zinc-500 tracking-wider">Decimals</div>
          <div className="text-base font-semibold text-zinc-100">{token.decimals ?? 18}</div>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5 space-y-1">
          <div className="text-[10px] uppercase text-zinc-500 tracking-wider">DEX Pair</div>
          <div className="text-xs font-semibold text-emerald-400 truncate">
            {token.pairAddress ? (
              <a
                href={`${ROBINHOOD_CHAIN.blockExplorers.robinscan}/address/${token.pairAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                title={token.pairAddress}
              >
                Verified Pair ↗
              </a>
            ) : (
              'On-Chain AMM'
            )}
          </div>
        </div>
      </div>

      {/* Pons Family v2 Protocol Section */}
      {token.isPonsV2 && token.pons && (
        <div className="bg-zinc-950 border border-emerald-500/30 rounded-lg p-4 sm:p-5 space-y-4 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <PonsLogo className="w-5 h-5 shrink-0" size={20} />
              <span className="text-xs sm:text-sm font-bold text-emerald-400">Pons Family v2 Protocol</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/50 text-emerald-300">
                {token.pons.phaseLabel}
              </span>
            </div>
            <a
              href="https://docs.ponsfamily.com/v2"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-zinc-400 hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              Protocol Docs (docs.ponsfamily.com/v2) ↗
            </a>
          </div>

          {/* Bonding Curve Progress Bar */}
          {token.pons.curve && (
            <div className="space-y-2 bg-zinc-900/40 p-3.5 rounded-lg border border-zinc-800/60">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Bonding Curve Progress</span>
                <span className="text-emerald-400 font-bold">
                  {token.pons.curve.progressPercent.toFixed(2)}%
                </span>
              </div>
              <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, token.pons.curve.progressPercent)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>Raised: {token.pons.curve.realQuoteReserve} ETH</span>
                <span>Graduation Target: {token.pons.graduationThreshold} ETH</span>
              </div>

              {/* Visual Milestone Lifecycle Steps */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/60 font-mono text-[10px]">
                <div className="p-2 rounded bg-zinc-950/80 border border-emerald-500/40 text-left">
                  <div className="text-emerald-400 font-bold flex items-center gap-1">
                    <span>✓</span> Step 1: Launch
                  </div>
                  <div className="text-zinc-500 mt-0.5">Fair launch curve created</div>
                </div>
                <div className={`p-2 rounded border text-left ${
                  (token.pons.curve.progressPercent || 0) >= 50
                    ? 'bg-zinc-950/80 border-emerald-500/40 text-emerald-400'
                    : 'bg-zinc-950/40 border-zinc-800 text-zinc-400'
                }`}>
                  <div className="font-bold flex items-center gap-1">
                    <span>{(token.pons.curve.progressPercent || 0) >= 50 ? '✓' : '●'}</span> Step 2: 50% Milestone
                  </div>
                  <div className="text-zinc-500 mt-0.5">2.10 ETH depth reached</div>
                </div>
                <div className={`p-2 rounded border text-left ${
                  token.pons.phase === 2
                    ? 'bg-zinc-950/80 border-emerald-500/40 text-emerald-400'
                    : 'bg-zinc-950/40 border-zinc-800 text-zinc-400'
                }`}>
                  <div className="font-bold flex items-center gap-1">
                    <span>{token.pons.phase === 2 ? '✓' : '●'}</span> Step 3: Uniswap v4
                  </div>
                  <div className="text-zinc-500 mt-0.5">4.2 ETH LP Swept & Locked</div>
                </div>
              </div>
            </div>
          )}

          {/* Pons Protocol Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-zinc-900/50 p-2.5 rounded border border-zinc-800/40">
              <div className="text-[10px] text-zinc-500 uppercase">Curve Fee</div>
              <div className="text-zinc-200 font-semibold">{token.pons.curve ? (token.pons.curve.feeBps / 100).toFixed(2) : '1.00'}%</div>
            </div>
            <div className="bg-zinc-900/50 p-2.5 rounded border border-zinc-800/40">
              <div className="text-[10px] text-zinc-500 uppercase">Creator Tax</div>
              <div className="text-zinc-200 font-semibold">{(token.pons.creatorTaxBps / 100).toFixed(2)}%</div>
            </div>
            <div className="bg-zinc-900/50 p-2.5 rounded border border-zinc-800/40">
              <div className="text-[10px] text-zinc-500 uppercase">Buyback & Vest</div>
              <div className="text-zinc-200 font-semibold">{token.pons.buybackEnabled ? '5-Yr Linear Vest' : 'Disabled'}</div>
            </div>
            <div className="bg-zinc-900/50 p-2.5 rounded border border-zinc-800/40">
              <div className="text-[10px] text-zinc-500 uppercase">Curve Contract</div>
              <div className="text-emerald-400 font-semibold truncate">
                <CopyableAddress address={token.pons.curveAddress} className="text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Token Description & Socials */}
          {(token.description || token.socials) && (
            <div className="bg-zinc-900/30 p-3 rounded border border-zinc-800/50 text-xs space-y-2">
              {token.description && (
                <p className="text-zinc-300 leading-relaxed font-sans text-xs">{token.description}</p>
              )}
              {token.socials && (
                <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
                  {token.socials.website && (
                    <a
                      href={token.socials.website.startsWith('http') ? token.socials.website : `https://${token.socials.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded transition-colors"
                    >
                      Website ↗
                    </a>
                  )}
                  {token.socials.twitter && (
                    <a
                      href={token.socials.twitter.startsWith('http') ? token.socials.twitter : `https://x.com/${token.socials.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded transition-colors"
                    >
                      Twitter / X ↗
                    </a>
                  )}
                  {token.socials.telegram && (
                    <a
                      href={token.socials.telegram.startsWith('http') ? token.socials.telegram : `https://t.me/${token.socials.telegram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded transition-colors"
                    >
                      Telegram ↗
                    </a>
                  )}
                  {token.socials.discord && (
                    <a
                      href={token.socials.discord}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded transition-colors"
                    >
                      Discord ↗
                    </a>
                  )}
                  {token.socials.farcaster && (
                    <a
                      href={token.socials.farcaster.startsWith('http') ? token.socials.farcaster : `https://warpcast.com/${token.socials.farcaster}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded transition-colors"
                    >
                      Farcaster ↗
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Trading Area: Chart on Left, Instant Swap on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-8 space-y-4">
          <PriceChart tokenAddress={token.address} tokenSymbol={token.symbol || 'TOKEN'} basePrice={token.price} />
          
          {/* Instant Top 10 Holder & Security Audit */}
          <HolderAuditCard token={token} holders={holders} />

          {/* Tabs for Holders, Transfers, and Security Audit */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden font-mono text-xs">

            <div className="flex border-b border-zinc-800 bg-zinc-900/60 px-2 pt-2">
              <button
                onClick={() => setActiveTab('holders')}
                className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                  activeTab === 'holders'
                    ? 'text-zinc-100 border-emerald-400'
                    : 'text-zinc-400 hover:text-zinc-200 border-transparent'
                }`}
              >
                Top Holders ({holders.length})
              </button>
              <button
                onClick={() => setActiveTab('transfers')}
                className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                  activeTab === 'transfers'
                    ? 'text-zinc-100 border-emerald-400'
                    : 'text-zinc-400 hover:text-zinc-200 border-transparent'
                }`}
              >
                Recent Transfers ({transfers.length})
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                  activeTab === 'audit'
                    ? 'text-zinc-100 border-emerald-400'
                    : 'text-zinc-400 hover:text-zinc-200 border-transparent'
                }`}
              >
                Security Audit
              </button>
            </div>

            <div className="p-0">
              {activeTab === 'holders' && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left">
                    <thead className="bg-zinc-900/40 text-zinc-400 uppercase text-[11px] border-b border-zinc-800">
                      <tr>
                        <th className="px-4 py-2.5 font-medium w-12">#</th>
                        <th className="px-4 py-2.5 font-medium">Holder Address</th>
                        <th className="px-4 py-2.5 font-medium text-right">Raw Balance</th>
                        <th className="px-4 py-2.5 font-medium text-right">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40">
                      {holders.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                            No holder records available for this token.
                          </td>
                        </tr>
                      ) : (
                        holders.map((holder, idx) => (
                          <tr key={idx} className="hover:bg-zinc-900/50 transition-colors">
                            <td className="px-4 py-2.5 text-zinc-500">{idx + 1}</td>
                            <td className="px-4 py-2.5">
                              <Link
                                href={`/wallet/${holder.address}`}
                                className="text-zinc-300 hover:text-emerald-400 transition-colors"
                              >
                                {holder.address}
                              </Link>
                              {holder.name && (
                                <span className="ml-2 text-zinc-500 text-[10px]">({holder.name})</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-right text-zinc-200 truncate max-w-xs">
                              {holder.balance}
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                                {holder.isContract ? 'Contract' : 'EOA'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'transfers' && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left">
                    <thead className="bg-zinc-900/40 text-zinc-400 uppercase text-[11px] border-b border-zinc-800">
                      <tr>
                        <th className="px-4 py-2.5 font-medium">Tx Hash</th>
                        <th className="px-4 py-2.5 font-medium">Time</th>
                        <th className="px-4 py-2.5 font-medium">From</th>
                        <th className="px-4 py-2.5 font-medium">To</th>
                        <th className="px-4 py-2.5 font-medium text-right">Raw Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40">
                      {transfers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                            No transfers indexed yet.
                          </td>
                        </tr>
                      ) : (
                        transfers.map((tx, idx) => (
                          <tr key={idx} className="hover:bg-zinc-900/50 transition-colors">
                            <td className="px-4 py-2.5">
                              <a
                                href={`${ROBINHOOD_CHAIN.blockExplorers.robinscan}/tx/${tx.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-zinc-300 hover:text-emerald-400 transition-colors"
                              >
                                {tx.hash.slice(0, 10)}...
                              </a>
                            </td>
                            <td className="px-4 py-2.5 text-zinc-500">{formatTimeAgo(tx.timestamp)}</td>
                            <td className="px-4 py-2.5">
                              <Link
                                href={`/wallet/${tx.from}`}
                                className="text-zinc-400 hover:text-zinc-200 transition-colors"
                              >
                                {tx.from.slice(0, 8)}...
                              </Link>
                            </td>
                            <td className="px-4 py-2.5">
                              <Link
                                href={`/wallet/${tx.to}`}
                                className="text-zinc-400 hover:text-zinc-200 transition-colors"
                              >
                                {tx.to.slice(0, 8)}...
                              </Link>
                            </td>
                            <td className="px-4 py-2.5 text-right text-zinc-200 truncate max-w-xs">
                              {tx.amount}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'audit' && (
                <div className="p-3">
                  <TokenSecurityAudit address={address} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Swap Widget on Right Sidebar */}
        <div className="lg:col-span-4 sticky top-20">
          <SwapWidget
            tokenAddress={address}
            tokenSymbol={token.symbol || 'TOKEN'}
            tokenDecimals={token.decimals ?? 18}
            tokenPrice={token.price}
            curveAddress={token.pons?.curveAddress}
            isPonsV2={token.isPonsV2}
          />
        </div>
      </div>

      {/* PnL & Alpha Share Card Modal */}
      <PnLShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        token={token}
      />
    </div>
  );
}
