'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatAddress } from '@/lib/utils/format';
import { ROBINHOOD_CHAIN } from '@/config/network';

interface WalletMetric {
  address: string;
  txCount: number;
  knownProtocols: string[];
  classification: string;
  activityLevel: 'HIGH' | 'MODERATE' | 'LOW';
  lastSeenBlock: number;
}

export function SmartMoney() {
  const [wallets, setWallets] = useState<WalletMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const analyzeActivity = async () => {
      try {
        const res = await fetch('/api/flow/recent');
        if (!res.ok) throw new Error('Failed to fetch flow');
        const data = await res.json();
        const items = data.items || [];

        // Count frequency of transactions from unique addresses in recent stream
        const map = new Map<string, { count: number; methods: Set<string>; maxBlock: number }>();

        for (const item of items) {
          if (!item.from || item.from === '0x0000000000000000000000000000000000000000') continue;
          const current = map.get(item.from) || { count: 0, methods: new Set<string>(), maxBlock: 0 };
          current.count += 1;
          if (item.method) current.methods.add(item.method);
          if (item.block > current.maxBlock) current.maxBlock = item.block;
          map.set(item.from, current);
        }

        const list: WalletMetric[] = [];
        map.forEach((val, addr) => {
          let activityLevel: 'HIGH' | 'MODERATE' | 'LOW' = 'LOW';
          if (val.count >= 4) activityLevel = 'HIGH';
          else if (val.count >= 2) activityLevel = 'MODERATE';

          let classification = 'Insufficient history';
          if (val.methods.has('SWAP') || val.methods.has('swapExactTokensForTokens') || val.methods.has('swapETHForExactTokens')) {
            classification = val.count >= 3 ? 'Active DEX Trader' : 'DEX Participant';
          } else if (val.methods.has('APPROVE') || val.methods.has('approve')) {
            classification = 'Token Approver';
          } else if (val.count >= 5) {
            classification = 'High Frequency Interactor';
          }

          list.push({
            address: addr,
            txCount: val.count,
            knownProtocols: Array.from(val.methods),
            classification,
            activityLevel,
            lastSeenBlock: val.maxBlock,
          });
        });

        // Sort by activity
        list.sort((a, b) => b.txCount - a.txCount);
        setWallets(list.slice(0, 20));
      } catch (e) {
        console.error('Error analyzing smart money:', e);
      } finally {
        setLoading(false);
      }
    };

    analyzeActivity();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-zinc-500 font-mono animate-pulse">
        Analyzing on-chain transaction history and address metrics...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-[#0a0d12] border border-[#1a222d] rounded-xl p-3 text-xs text-zinc-400 font-mono flex items-center justify-between shadow-sm">
        <div>
          <span className="text-zinc-100 font-semibold">Criteria: </span>
          Wallets are classified strictly using verified on-chain interactions and frequency.
        </div>
        <span className="text-[11px] text-[#00C805] font-semibold">Verified On-Chain</span>
      </div>

      {wallets.length === 0 ? (
        <div className="p-8 text-center text-xs text-zinc-500 font-mono bg-[#0a0d12] rounded-xl border border-[#1a222d]">
          Insufficient history to classify wallets currently. Monitoring on-chain blocks...
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-xl border border-[#1a222d] bg-[#0a0d12] shadow-xl">
          <table className="w-full min-w-[700px] text-left text-xs font-mono">
            <thead className="bg-[#0d1117] text-zinc-400 uppercase tracking-wider text-[11px] border-b border-[#1a222d]">
              <tr>
                <th className="px-4 py-3 font-medium">Wallet Address</th>
                <th className="px-4 py-3 font-medium">Observed Interactions</th>
                <th className="px-4 py-3 font-medium">Activity Level</th>
                <th className="px-4 py-3 font-medium">Classification</th>
                <th className="px-4 py-3 font-medium text-right">Last Block</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a222d]/60">
              {wallets.map((w) => (
                <tr key={w.address} className="hover:bg-[#12171e] transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/wallet/${w.address}`}
                      className="text-[#00C805] hover:text-[#00E806] font-medium transition-colors"
                    >
                      {formatAddress(w.address)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {w.txCount} transaction{w.txCount > 1 ? 's' : ''}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] ${
                        w.activityLevel === 'HIGH'
                          ? 'bg-[#00C805]/10 text-[#00C805] border border-[#00C805]/30 font-semibold'
                          : w.activityLevel === 'MODERATE'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-[#12171e] text-zinc-400 border border-[#1a222d]'
                      }`}
                    >
                      {w.activityLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {w.classification}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={`${ROBINHOOD_CHAIN.blockExplorers.robinscan}/address/${w.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      #{w.lastSeenBlock || '—'}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
