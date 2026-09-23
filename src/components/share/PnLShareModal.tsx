'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils/format';
import { useToast } from '@/components/ui/ToastProvider';

interface PnLShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: any;
}

export function PnLShareModal({ isOpen, onClose, token }: PnLShareModalProps) {
  const { toastSuccess, toastInfo } = useToast();
  const [pnlMultiplier, setPnlMultiplier] = useState(2.8); // 2.8x default
  const [tradeType, setTradeType] = useState<'BUY' | 'PROFIT'>('PROFIT');

  if (!isOpen || !token) return null;

  const currentPrice = token?.price || 0.0125;
  const pnlPercent = (pnlMultiplier - 1) * 100;

  const handleShareToTwitter = () => {
    const text = `🚀 Just traded $${token?.symbol || 'TOKEN'} on @RobinhoodChain via RH FLOW!\n\n📈 Current Gain: +${pnlPercent.toFixed(0)}% (${pnlMultiplier.toFixed(1)}x)\n💎 Fast on-chain execution with Pons v2 curves\n\nTrade now on RH FLOW terminal:`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toastSuccess('Link Copied!', 'Share this token terminal link with your community.');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/60">
          <span className="font-bold text-zinc-200 uppercase tracking-wide">
            Share PnL & Token Alpha
          </span>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4">
          {/* Multiplier Preset Selector */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-zinc-400 text-[11px]">Select Multiplier:</span>
            <div className="flex items-center gap-1.5">
              {[1.5, 2.0, 3.5, 5.0, 10.0].map((m) => (
                <button
                  key={m}
                  onClick={() => setPnlMultiplier(m)}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition-colors ${
                    pnlMultiplier === m
                      ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {m}x
                </button>
              ))}
            </div>
          </div>

          {/* Cyberpunk PnL Share Card Preview */}
          <div className="relative p-5 rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-emerald-950/40 border border-emerald-500/40 shadow-2xl overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

            {/* Card Header: Brand */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-mono text-base font-black">RH</span>
                <span className="text-zinc-100 font-bold tracking-wider">FLOW</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-emerald-400">
                Robinhood Chain
              </span>
            </div>

            {/* Token Info & Big PnL Display */}
            <div className="py-4 space-y-2 text-center">
              <div className="text-xs text-zinc-400 font-sans">{token?.name || 'Token'}</div>
              <div className="text-2xl font-black text-zinc-100 tracking-wider">
                ${token?.symbol || 'TK'}
              </div>
              <div className="text-4xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                +{pnlPercent.toFixed(0)}%
              </div>
              <div className="text-xs text-zinc-400 pt-1">
                Price: <span className="text-zinc-200 font-bold">{formatCurrency(currentPrice)}</span>
              </div>
            </div>

            {/* Card Footer: Verified On-Chain */}
            <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500">
              <span>Verified On-Chain DEX</span>
              <span className="text-emerald-400 font-semibold">rh-flow.terminal</span>
            </div>
          </div>

          {/* Share Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleCopyLink}
              className="w-1/2 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <span>🔗 Copy Link</span>
            </button>
            <button
              onClick={handleShareToTwitter}
              className="w-1/2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/40"
            >
              <span>𝕏 Share on X</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
