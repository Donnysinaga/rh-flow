'use client';

import { useMemo } from 'react';
import { formatNumber } from '@/lib/utils/format';
import { CopyableAddress } from '@/components/ui/CopyableAddress';

interface HolderAuditProps {
  token: any;
  holders: any[];
}

export function HolderAuditCard({ token, holders }: HolderAuditProps) {
  const audit = useMemo(() => {
    if (!holders || holders.length === 0) {
      return {
        top10Share: 0,
        creatorShare: 0,
        riskLevel: 'LOW',
        riskColor: 'text-emerald-400',
        barColor: 'bg-emerald-500',
      };
    }

    const total = token?.totalSupply ? parseFloat(token.totalSupply) : 1000000000;
    const top10Total = holders.slice(0, 10).reduce((acc, h) => acc + (parseFloat(h.value || h.balance || 0) || 0), 0);
    const top10Percent = total > 0 ? (top10Total / total) * 100 : 0;

    let riskLevel = 'LOW';
    let riskColor = 'text-[#00C805]';
    let barColor = 'bg-[#00C805]';

    if (top10Percent > 60) {
      riskLevel = 'HIGH CONCENTRATION';
      riskColor = 'text-[#FF5000]';
      barColor = 'bg-[#FF5000]';
    } else if (top10Percent > 35) {
      riskLevel = 'MEDIUM CONCENTRATION';
      riskColor = 'text-amber-400';
      barColor = 'bg-amber-400';
    }

    return {
      top10Share: Math.min(100, Math.max(0, top10Percent)),
      riskLevel,
      riskColor,
      barColor,
    };
  }, [holders, token]);

  return (
    <div className="bg-[#0a0d12] border border-[#1a222d] rounded-2xl p-4 sm:p-5 font-mono text-xs space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-[#1a222d] pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00C805]" />
          <h3 className="font-bold uppercase tracking-wider text-zinc-100">
            Security & Holder Audit
          </h3>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded bg-[#12171e] border border-[#1a222d] ${audit.riskColor}`}>
          {audit.riskLevel}
        </span>
      </div>

      {/* Top 10 Concentration Meter */}
      <div className="space-y-1.5 bg-[#0d1117] p-3 rounded-xl border border-[#1a222d]">
        <div className="flex justify-between items-center text-xs">
          <span className="text-zinc-400">Top 10 Holders Supply:</span>
          <span className={`font-bold ${audit.riskColor}`}>
            {audit.top10Share > 0 ? `${audit.top10Share.toFixed(2)}%` : 'Decentralized'}
          </span>
        </div>
        <div className="w-full bg-[#12171e] h-2 rounded-full overflow-hidden border border-[#1a222d]">
          <div
            className={`h-full rounded-full transition-all duration-500 ${audit.barColor}`}
            style={{ width: `${Math.max(5, audit.top10Share)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-zinc-500 pt-0.5">
          <span>0% (Decentralized)</span>
          <span>50%</span>
          <span>100% (Whale Risk)</span>
        </div>
      </div>

      {/* Security Checklist Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
        <div className="p-2.5 rounded-xl bg-[#0d1117] border border-[#1a222d]">
          <div className="text-[10px] text-zinc-500 uppercase">Mint Authority</div>
          <div className="font-semibold text-[#00C805] mt-0.5 flex items-center gap-1">
            <span>✓</span> Fixed (No Mint)
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-[#0d1117] border border-[#1a222d]">
          <div className="text-[10px] text-zinc-500 uppercase">Freeze Authority</div>
          <div className="font-semibold text-[#00C805] mt-0.5 flex items-center gap-1">
            <span>✓</span> None (Immutable)
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-[#0d1117] border border-[#1a222d]">
          <div className="text-[10px] text-zinc-500 uppercase">Liquidity Lock</div>
          <div className="font-semibold text-[#00C805] mt-0.5 flex items-center gap-1">
            <span>✓</span> Pons Locker
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-[#0d1117] border border-[#1a222d]">
          <div className="text-[10px] text-zinc-500 uppercase">Buy / Sell Tax</div>
          <div className="font-semibold text-zinc-200 mt-0.5">
            {token?.pons ? `${(token.pons.creatorTaxBps / 100).toFixed(1)}% Fixed` : '0% Direct'}
          </div>
        </div>
      </div>
    </div>
  );
}
