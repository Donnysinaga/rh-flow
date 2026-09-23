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
          className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50 rounded-lg text-xs font-mono font-medium transition-all shadow-sm group cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 group-hover:scale-110 transition-transform"></span>
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
          className="flex items-center gap-2.5 px-3 py-1.5 bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs transition-all shadow-sm cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-zinc-200 font-medium">
              {formatAddress(address)}
            </span>
          </div>
          {formattedBalance && (
            <>
              <span className="text-zinc-700">|</span>
              <span className="text-emerald-400 font-semibold">
                {formattedBalance}
              </span>
            </>
          )}
          <svg
            className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-150 ${isDropdownOpen ? 'rotate-180' : ''}`}
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
          <div className="absolute right-0 mt-2 w-72 bg-[#0d0d10] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 text-xs animate-in fade-in-50 zoom-in-95 duration-100">
            {/* Wallet Info Header */}
            <div className="p-3.5 bg-zinc-950 border-b border-zinc-850 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Connected Account</span>
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Robinhood Chain
                </span>
              </div>
              
              {/* Address with click to copy */}
              <button
                type="button"
                onClick={handleCopy}
                title="Click to copy address"
                className="w-full flex items-center justify-between p-2 bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 rounded-lg transition-colors group text-left cursor-pointer"
              >
                <span className="text-zinc-300 group-hover:text-zinc-100 truncate text-[11px] select-all">
                  {address}
                </span>
                <span className="text-zinc-500 group-hover:text-zinc-300 ml-2 shrink-0">
                  {copied ? (
                    <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                <span className="text-zinc-200 font-semibold">{formattedBalance || '0.0000 ETH'}</span>
              </div>
            </div>

            {/* Actions List */}
            <div className="p-1.5 space-y-0.5">
              <a
                href={`${ROBINHOOD_CHAIN.blockExplorers.robinscan}/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg transition-colors"
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
                className="flex items-center justify-between px-3 py-2 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <span>Wallet Intelligence & Portfolio</span>
                <span className="text-zinc-500 text-[10px]">→</span>
              </a>

              <div className="my-1 border-t border-zinc-850"></div>

              <button
                type="button"
                onClick={() => {
                  disconnect();
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
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
