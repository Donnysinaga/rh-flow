'use client';

import { useState, useRef, useEffect } from 'react';
import { useAccount, useDisconnect, useBalance, useChainId, useSwitchChain } from 'wagmi';
import { formatUnits } from 'viem';
import { ROBINHOOD_CHAIN } from '@/config/network';
import { formatAddress } from '@/lib/utils/format';
import { switchOrAddRobinhoodChain } from '@/lib/web3/connectWallet';
import { WalletModal } from './WalletModal';

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  
  // Explicitly query balance on Robinhood Chain with periodic auto-sync
  const { data: balance } = useBalance({ 
    address, 
    chainId: ROBINHOOD_CHAIN.id,
    query: {
      refetchInterval: 3000,
    }
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isWrongNetwork = isConnected && chainId !== ROBINHOOD_CHAIN.id;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Ignore clipboard fallback
    }
  };

  const handleSwitchNetwork = async () => {
    setIsSwitching(true);
    try {
      const winEth = typeof window !== 'undefined' ? (window as any).ethereum : null;
      if (winEth) {
        await switchOrAddRobinhoodChain(winEth);
      } else {
        switchChain({ chainId: ROBINHOOD_CHAIN.id });
      }
    } catch (err) {
      console.error('Network switch error:', err);
    } finally {
      setIsSwitching(false);
    }
  };

  const getFormattedBalance = () => {
    if (!balance) return '';
    try {
      const val = parseFloat(formatUnits(balance.value, balance.decimals));
      return `${val.toFixed(4)} ${balance.symbol}`;
    } catch {
      return '';
    }
  };

  if (isWrongNetwork) {
    return (
      <div className="flex items-center gap-2 font-mono">
        <button
          type="button"
          onClick={handleSwitchNetwork}
          disabled={isSwitching}
          className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-medium transition-colors cursor-pointer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
          <span>{isSwitching ? 'Switching Network...' : 'Switch to Robinhood Chain'}</span>
        </button>
      </div>
    );
  }

  if (!isConnected || !address) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-[#00C805]/10 hover:bg-[#00C805]/20 text-[#00C805] border border-[#00C805]/30 hover:border-[#00C805]/60 rounded-xl text-xs font-mono font-bold transition-all shadow-sm group cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-[#00C805] group-hover:scale-110 transition-transform"></span>
          <span>Connect Wallet</span>
        </button>

        <WalletModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </>
    );
  }

  const formattedBalance = getFormattedBalance();

  return (
    <>
      <div className="relative font-mono" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2.5 px-3 py-1.5 bg-[#0a0d12] hover:bg-[#12171e] border border-[#1a222d] hover:border-[#00C805]/40 rounded-xl text-xs transition-all shadow-sm cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00C805]"></span>
            <span className="text-zinc-100 font-medium">
              {formatAddress(address)}
            </span>
          </div>
          {formattedBalance && (
            <>
              <span className="text-zinc-700">|</span>
              <span className="text-[#00C805] font-bold">
                {formattedBalance}
              </span>
            </>
          )}
          <svg
            className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-150 ${isDropdownOpen ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-72 bg-[#0a0d12] border border-[#1a222d] rounded-2xl shadow-2xl overflow-hidden z-50 text-xs animate-in fade-in-50 zoom-in-95 duration-100">
            {/* Wallet Info Header */}
            <div className="p-3.5 bg-[#0d1117] border-b border-[#1a222d] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Connected Account</span>
                <span className="text-[10px] text-[#00C805] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00C805]"></span>
                  Robinhood Chain
                </span>
              </div>
              
              {/* Address with click to copy */}
              <button
                type="button"
                onClick={handleCopy}
                title="Click to copy address"
                className="w-full flex items-center justify-between p-2 bg-[#12171e] hover:bg-[#181f28] border border-[#1a222d] rounded-xl transition-colors group text-left cursor-pointer"
              >
                <span className="text-zinc-300 group-hover:text-zinc-100 truncate text-[11px] select-all">
                  {address}
                </span>
                <span className="text-zinc-500 group-hover:text-zinc-300 ml-2 shrink-0">
                  {copied ? (
                    <svg className="w-3.5 h-3.5 text-[#00C805]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </span>
              </button>

              {/* Balance */}
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-zinc-500">ETH Balance</span>
                <span className="text-[#00C805] font-bold">{formattedBalance || '0.0000 ETH'}</span>
              </div>
            </div>

            {/* Actions List */}
            <div className="p-1.5 space-y-0.5">
              <a
                href={`${ROBINHOOD_CHAIN.blockExplorers.robinscan}/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 text-zinc-300 hover:text-zinc-100 hover:bg-[#12171e] rounded-xl transition-colors"
              >
                <span>View on RobinScan</span>
                <svg className="w-3 h-3 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>

              <a
                href={`/wallet/${address}`}
                className="flex items-center justify-between px-3 py-2 text-zinc-300 hover:text-zinc-100 hover:bg-[#12171e] rounded-xl transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <span>Wallet Intelligence & Portfolio</span>
                <span className="text-zinc-500 text-[10px]">→</span>
              </a>

              <div className="my-1 border-t border-[#1a222d]"></div>

              <button
                type="button"
                onClick={() => {
                  disconnect();
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-[#FF5000] hover:text-[#FF6520] hover:bg-[#FF5000]/10 rounded-xl transition-colors cursor-pointer"
              >
                <span>Disconnect</span>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      <WalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
