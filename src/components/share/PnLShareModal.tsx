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
    const text = `🚀 Just traded $${token?.symbol || 'TOKEN'} on @RobinhoodChain via Orbitra ($ORB)!\n\n📈 Current Gain: +${pnlPercent.toFixed(0)}% (${pnlMultiplier.toFixed(1)}x)\n💎 Fast on-chain execution on Robinhood Chain\n\nTrade now on Orbitra terminal:`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toastSuccess('Link Copied!', 'Share this token terminal link with your community.');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0a0d12] border border-[#1a222d] rounded-2xl shadow-2xl overflow-hidden font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1a222d] bg-[#0d1117]">
          <span className="font-bold text-zinc-100 uppercase tracking-wide">
            Share PnL & Token Alpha
          </span>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-[#12171e] transition-colors"
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
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                    pnlMultiplier === m
                      ? 'bg-[#00C805] text-black shadow-md'
                      : 'bg-[#0d1117] text-zinc-400 hover:text-zinc-200 border border-[#1a222d]'
                  }`}
                >
                  {m}x
                </button>
              ))}
            </div>
          </div>

          {/* Robinhood PnL Share Card Preview */}
          <div className="relative p-5 rounded-2xl bg-gradient-to-br from-[#0d1117] via-[#000000] to-[#0a180c] border border-[#00C805]/40 shadow-2xl overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-[#00C805]/10 blur-2xl pointer-events-none" />

            {/* Card Header: Brand */}
            <div className="flex items-center justify-between border-b border-[#1a222d] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[#00C805] font-mono text-base font-black">RH</span>
                <span className="text-zinc-100 font-bold tracking-wider">FLOW</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0d1117] border border-[#1a222d] text-[#00C805] font-semibold">
                Robinhood Chain
              </span>
            </div>

            {/* Token Info & Big PnL Display */}
            <div className="py-4 space-y-2 text-center">
              <div className="text-xs text-zinc-400 font-sans">{token?.name || 'Token'}</div>
              <div className="text-2xl font-black text-zinc-100 tracking-wider">
                ${token?.symbol || 'TK'}
              </div>
              <div className="text-4xl font-black text-[#00C805] drop-shadow-[0_0_15px_rgba(0,200,5,0.35)]">
                +{pnlPercent.toFixed(0)}%
              </div>
              <div className="text-xs text-zinc-400 pt-1">
                Price: <span className="text-zinc-100 font-bold">{formatCurrency(currentPrice)}</span>
              </div>
            </div>

            {/* Card Footer: Verified On-Chain */}
            <div className="pt-3 border-t border-[#1a222d] flex items-center justify-between text-[10px] text-zinc-500">
              <span>Verified On-Chain DEX</span>
              <span className="text-[#00C805] font-semibold">rh-flow.terminal</span>
            </div>
          </div>

          {/* Share Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleCopyLink}
              className="w-1/2 py-2.5 bg-[#0d1117] hover:bg-[#12171e] text-zinc-200 border border-[#1a222d] rounded-xl font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>🔗 Copy Link</span>
            </button>
            <button
              onClick={handleShareToTwitter}
              className="w-1/2 py-2.5 bg-[#00C805] hover:bg-[#00E806] text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-[#00C805]/20 cursor-pointer"
            >
              <span>𝕏 Share on X</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
