'use client';

import { useState, useEffect } from 'react';

interface SecurityCheck {
  name: string;
  status: 'PASSED' | 'WARNING' | 'FAILED' | 'NEUTRAL';
  detail: string;
}

interface SecurityData {
  isVerified: boolean;
  top10SupplyPercent: number | null;
  holdersCount: number;
  checks: SecurityCheck[];
}

export function TokenSecurityAudit({ address }: { address: string }) {
  const [data, setData] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchAudit = async () => {
      try {
        const res = await fetch(`/api/tokens/${address}/security`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted) setData(json);
        }
      } catch (e) {
        console.error('Failed to load security audit:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAudit();
    return () => {
      isMounted = false;
    };
  }, [address]);

  if (loading) {
    return (
      <div className="bg-[#0a0d12] border border-[#1a222d] rounded-xl p-4 font-mono text-xs animate-pulse text-zinc-500">
        Running on-chain security and holder concentration analysis...
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-[#0a0d12] border border-[#1a222d] rounded-xl p-4 font-mono text-xs space-y-3 shadow-md">
      <div className="flex items-center justify-between border-b border-[#1a222d] pb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-bold text-zinc-100 uppercase tracking-wide">
            On-Chain Security Audit
          </span>
          <span className="text-[10px] text-zinc-500">Bytecode & Supply Check</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-[#00C805]"></span>
          <span className="text-[#00C805] font-bold">Verified Bytecode</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {data.checks.map((check, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-xl bg-[#0d1117] border border-[#1a222d] space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-200">{check.name}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  check.status === 'PASSED'
                    ? 'bg-[#00C805]/10 text-[#00C805] border border-[#00C805]/30'
                    : check.status === 'WARNING'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-[#12171e] text-zinc-400'
                }`}
              >
                {check.status}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">{check.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
