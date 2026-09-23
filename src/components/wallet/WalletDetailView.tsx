'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CopyableAddress } from '@/components/ui/CopyableAddress';
import { formatTimeAgo, isValidAddress } from '@/lib/utils/format';
import { ROBINHOOD_CHAIN } from '@/config/network';

interface WalletDetailProps {
  address: string;
}

export function WalletDetailView({ address }: WalletDetailProps) {
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!isValidAddress(address)) {
      setError('Invalid Robinhood Chain address format.');
      setLoading(false);
      return;
    }

    const fetchWalletData = async () => {
      try {
        setLoading(true);
        const [resWallet, resTx] = await Promise.all([
          fetch(`/api/address/${address}`),
          fetch(`/api/address/${address}/transactions`),
        ]);

        if (!resWallet.ok) {
          throw new Error('Address not found on Robinhood Chain');
        }

        const dataWallet = await resWallet.json();
        const dataTx = resTx.ok ? await resTx.json() : { items: [] };

        if (isMounted) {
          setWallet(dataWallet);
          setTransactions(dataTx.items || []);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'No activity found for this address on Robinhood Chain.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchWalletData();
    return () => {
      isMounted = false;
    };
  }, [address]);

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto p-4 animate-pulse space-y-4">
        <div className="h-20 bg-zinc-900 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-900/60 rounded-lg" />
          ))}
        </div>
        <div className="h-72 bg-zinc-900/40 rounded-lg" />
      </div>
    );
  }

  if (error || !wallet) {
    return (
      <div className="max-w-[1280px] mx-auto p-8 text-center font-mono space-y-4">
        <div className="text-zinc-400 text-sm">
          {error || 'No activity found for this address on Robinhood Chain.'}
        </div>
        <div className="text-xs text-zinc-600">Address: {address}</div>
        <div>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded text-xs transition-colors"
          >
            ← Back to Terminal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto p-3 sm:p-5 space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
        <Link href="/" className="hover:text-zinc-300 transition-colors">
          Terminal
        </Link>
        <span>/</span>
        <span className="text-zinc-300 font-semibold">Wallet Intelligence</span>
      </div>

      {/* Header Banner */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono text-zinc-500">Address</span>
            {wallet.isContract && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Smart Contract {wallet.contractName ? `(${wallet.contractName})` : ''}
              </span>
            )}
          </div>
          <div className="text-base sm:text-lg font-bold text-zinc-100 font-mono">
            <CopyableAddress address={address} full />
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <a
            href={`${ROBINHOOD_CHAIN.blockExplorers.robinscan}/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded text-zinc-300 hover:text-zinc-100 transition-colors"
          >
            Open in Robinscan ↗
          </a>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-1">
          <div className="text-[10px] uppercase text-zinc-500 tracking-wider">ETH Balance</div>
          <div className="text-lg font-bold text-emerald-400">{wallet.ethBalance} ETH</div>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-1">
          <div className="text-[10px] uppercase text-zinc-500 tracking-wider">Token Holdings</div>
          <div className="text-lg font-bold text-zinc-100">{wallet.tokenCount || 0} Assets</div>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-1">
          <div className="text-[10px] uppercase text-zinc-500 tracking-wider">Realized PnL</div>
          <div className="text-sm font-semibold text-zinc-400">PnL unavailable</div>
          <div className="text-[10px] text-zinc-600">Requires verified trade settlement history</div>
        </div>
      </div>

      {/* Two Column Layout: Holdings & Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 font-mono text-xs">
        {/* Token Holdings Table */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="font-semibold text-zinc-200 uppercase text-[11px] tracking-wider">
              Token Holdings ({wallet.tokens?.length || 0})
            </h3>
          </div>
          <div className="overflow-x-auto flex-1 max-h-[480px]">
            <table className="w-full text-left">
              <thead className="bg-zinc-900/40 text-zinc-400 uppercase text-[10px] border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Asset</th>
                  <th className="px-4 py-2.5 font-medium text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {!wallet.tokens || wallet.tokens.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center text-zinc-500">
                      No ERC-20 token balances detected for this address.
                    </td>
                  </tr>
                ) : (
                  wallet.tokens.map((t: any, idx: number) => (
                    <tr key={idx} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/token/${t.address}`}
                          className="font-semibold text-zinc-200 hover:text-emerald-400 transition-colors"
                        >
                          {t.symbol}
                        </Link>
                        <span className="ml-2 text-zinc-500 text-[11px] truncate max-w-[140px] inline-block align-bottom">
                          {t.name}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right text-zinc-300 font-mono">
                        {t.balance}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="font-semibold text-zinc-200 uppercase text-[11px] tracking-wider">
              Recent Activity ({transactions.length})
            </h3>
          </div>
          <div className="overflow-x-auto flex-1 max-h-[480px]">
            <table className="w-full text-left">
              <thead className="bg-zinc-900/40 text-zinc-400 uppercase text-[10px] border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Tx</th>
                  <th className="px-4 py-2.5 font-medium">To / Interacted</th>
                  <th className="px-4 py-2.5 font-medium text-right">ETH</th>
                  <th className="px-4 py-2.5 font-medium text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                      No recent transaction logs found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="px-4 py-2.5">
                        <a
                          href={`${ROBINHOOD_CHAIN.blockExplorers.robinscan}/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-300 hover:text-emerald-400 transition-colors"
                        >
                          {tx.hash.slice(0, 8)}...
                        </a>
                      </td>
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/wallet/${tx.to}`}
                          className="text-zinc-400 hover:text-zinc-200 transition-colors"
                        >
                          {tx.to?.slice(0, 8)}...
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-right text-zinc-300">
                        {tx.value !== '0' ? tx.value : '0'}
                      </td>
                      <td className="px-4 py-2.5 text-right text-zinc-500">
                        {formatTimeAgo(tx.timestamp)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
