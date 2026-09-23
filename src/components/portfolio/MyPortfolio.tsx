'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { formatAddress } from '@/lib/utils/format';

export function MyPortfolio() {
  const { address, isConnected } = useAccount();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!address) {
      setData(null);
      return;
    }

    const fetchPortfolio = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/address/${address}`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted) setData(json);
        }
      } catch (err) {
        console.error('Failed to fetch portfolio:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPortfolio();
    return () => {
      isMounted = false;
    };
  }, [address]);

  if (!isConnected || !address) {
    return (
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-10 text-center font-mono text-xs space-y-3">
        <div className="text-zinc-400 font-semibold">No Wallet Connected</div>
        <p className="text-zinc-500 max-w-sm mx-auto">
          Connect your Web3 wallet (MetaMask, Coinbase Wallet) to view your ETH and token balances.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-8 text-center font-mono text-xs text-zinc-500 animate-pulse">
        Reading on-chain wallet balances for {formatAddress(address)}...
      </div>
    );
  }

  const tokens = data?.tokens || [];

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Portfolio Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-1">
          <div className="text-[10px] uppercase text-zinc-500 tracking-wider">ETH Balance</div>
          <div className="text-lg font-bold text-emerald-400">{data?.ethBalance || '0.0000'} ETH</div>
          <div className="text-[10px] text-zinc-500">Gas & Trading Balance</div>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-1">
          <div className="text-[10px] uppercase text-zinc-500 tracking-wider">Assets Held</div>
          <div className="text-lg font-bold text-zinc-100">{tokens.length} Tokens</div>
          <div className="text-[10px] text-zinc-500">Robinhood Chain ERC-20</div>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-1">
          <div className="text-[10px] uppercase text-zinc-500 tracking-wider">Connected Account</div>
          <div className="text-sm font-semibold text-zinc-200 truncate">{formatAddress(address)}</div>
          <div className="text-[10px] text-zinc-500">Robinhood Network</div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="font-semibold text-zinc-200 uppercase text-[11px] tracking-wider">
            Your Token Balances ({tokens.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-900/40 text-zinc-400 uppercase text-[10px] border-b border-zinc-800">
              <tr>
                <th className="px-4 py-2.5 font-medium">Asset</th>
                <th className="px-4 py-2.5 font-medium text-right">Balance</th>
                <th className="px-4 py-2.5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {tokens.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-zinc-500">
                    No token balances found in this wallet.
                  </td>
                </tr>
              ) : (
                tokens.map((t: any, idx: number) => (
                  <tr key={idx} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="font-semibold text-zinc-200">{t.symbol}</div>
                      <div className="text-[10px] text-zinc-500">{t.name}</div>
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold text-zinc-200">
                      {t.balance}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Link
                        href={`/token/${t.address}`}
                        className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded text-emerald-400 hover:text-emerald-300 transition-colors text-[11px]"
                      >
                        Trade / Inspect →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
