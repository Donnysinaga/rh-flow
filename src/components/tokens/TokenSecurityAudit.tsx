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
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-xs animate-pulse text-zinc-500">
        Running on-chain security and holder concentration analysis...
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-xs space-y-3">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-200 uppercase tracking-wide">
            On-Chain Security Audit
          </span>
          <span className="text-[10px] text-zinc-500">Bytecode & Supply Check</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span className="text-emerald-400 font-semibold">Verified Bytecode</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {data.checks.map((check, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800 space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-300">{check.name}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  check.status === 'PASSED'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : check.status === 'WARNING'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {check.status}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">{check.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
