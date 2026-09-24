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
      <div className="bg-[#0a0d12] border border-[#1a222d] rounded-2xl p-10 text-center font-mono text-xs space-y-3 shadow-xl">
        <div className="text-zinc-200 font-bold text-sm">No Wallet Connected</div>
        <p className="text-zinc-400 max-w-sm mx-auto">
          Connect your Web3 wallet (MetaMask, OKX, Coinbase, Phantom) to view your Robinhood Chain ETH and token portfolio.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-[#0a0d12] border border-[#1a222d] rounded-2xl p-8 text-center font-mono text-xs text-zinc-400 animate-pulse">
        Reading on-chain wallet balances for {formatAddress(address)}...
      </div>
    );
  }

  const tokens = data?.tokens || [];

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Portfolio Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#0a0d12] border border-[#1a222d] rounded-xl p-4 space-y-1 shadow-md">
          <div className="text-[10px] uppercase text-zinc-500 tracking-wider font-semibold">ETH Balance</div>
          <div className="text-lg font-bold text-[#00C805]">{data?.ethBalance || '0.0000'} ETH</div>
          <div className="text-[10px] text-zinc-500">Gas & Trading Balance</div>
        </div>
        <div className="bg-[#0a0d12] border border-[#1a222d] rounded-xl p-4 space-y-1 shadow-md">
          <div className="text-[10px] uppercase text-zinc-500 tracking-wider font-semibold">Assets Held</div>
          <div className="text-lg font-bold text-zinc-100">{tokens.length} Tokens</div>
          <div className="text-[10px] text-zinc-500">Robinhood Chain ERC-20</div>
        </div>
        <div className="bg-[#0a0d12] border border-[#1a222d] rounded-xl p-4 space-y-1 shadow-md">
          <div className="text-[10px] uppercase text-zinc-500 tracking-wider font-semibold">Connected Account</div>
          <div className="text-sm font-semibold text-zinc-100 truncate">{formatAddress(address)}</div>
          <div className="text-[10px] text-[#00C805] font-semibold">Robinhood Network</div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-[#0a0d12] border border-[#1a222d] rounded-2xl overflow-hidden shadow-xl">
        <div className="px-4 py-3 bg-[#0d1117] border-b border-[#1a222d] flex items-center justify-between">
          <h3 className="font-bold text-zinc-100 uppercase text-[11px] tracking-wider">
            Your Token Balances ({tokens.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#0d1117] text-zinc-400 uppercase text-[10px] border-b border-[#1a222d]">
              <tr>
                <th className="px-4 py-2.5 font-medium">Asset</th>
                <th className="px-4 py-2.5 font-medium text-right">Balance</th>
                <th className="px-4 py-2.5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a222d]/60">
              {tokens.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-zinc-500">
                    No token balances found in this wallet.
                  </td>
                </tr>
              ) : (
                tokens.map((t: any, idx: number) => (
                  <tr key={idx} className="hover:bg-[#12171e] transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="font-semibold text-zinc-100">{t.symbol}</div>
                      <div className="text-[10px] text-zinc-400">{t.name}</div>
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold text-zinc-100 font-mono">
                      {t.balance}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Link
                        href={`/token/${t.address}`}
                        className="px-2.5 py-1 bg-[#12171e] hover:bg-[#1a222d] border border-[#1a222d] rounded-lg text-[#00C805] hover:text-[#00E806] transition-colors text-[11px] font-semibold"
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
