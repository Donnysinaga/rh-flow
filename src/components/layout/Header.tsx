'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WalletButton } from '../wallet/WalletButton';
import { siteConfig } from '@/config/site';
import { LaunchTokenModal } from '../launch/LaunchTokenModal';
import { OrbitraLogo } from '../ui/OrbitraLogo';

const XIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/social/x.png" alt="X" className={`${className} object-contain rounded-full`} />
);

const TelegramIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/social/telegram.webp" alt="Telegram" className={`${className} object-contain rounded-full`} />
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

export function Header() {
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);

  return (
    <header className="h-14 border-b border-[#1a222d] bg-[#000000]/95 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-40">
      {/* Brand Logo & Clean Network Pill */}
      <div className="flex items-center gap-4">
        <Link href="/" className="font-bold text-zinc-100 text-lg tracking-tight flex items-center gap-2.5 group cursor-pointer">
          <OrbitraLogo className="w-7 h-7 transition-transform group-hover:scale-110 shadow-sm" size={28} />
          <div className="flex items-center gap-1.5 font-sans">
            <span className="text-[#00C805] text-xl font-black tracking-tight">ORBITRA</span>
            <span className="px-1.5 py-0.5 rounded bg-[#00C805]/10 text-[#00C805] border border-[#00C805]/20 text-[10px] font-mono font-bold tracking-wider">
              $ORB
            </span>
          </div>
        </Link>
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-[#0a0d12] border border-[#1a222d] rounded-full text-xs font-mono text-zinc-300">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00C805] animate-pulse"></span>
          <span>Robinhood Chain</span>
        </div>
      </div>

      {/* Right Navigation, Launch Button & Wallet */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Launch Token Button with Robinhood Neon Green */}
        <button
          type="button"
          onClick={() => setIsLaunchModalOpen(true)}
          className="cursor-pointer px-3.5 py-1.5 bg-[#00C805] hover:bg-[#00E806] active:scale-95 text-black font-bold rounded-xl text-xs font-sans transition-all flex items-center gap-1.5 shadow-lg shadow-[#00C805]/20"
        >
          <span className="text-black font-extrabold text-sm">+</span>
          <span>Launch Token</span>
        </button>

        <div className="hidden md:flex items-center gap-2 text-zinc-400 mr-1">
          {siteConfig.X_URL && (
            <a 
              href={siteConfig.X_URL} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-1 rounded-lg hover:bg-zinc-800 transition-all hover:scale-110 flex items-center justify-center" 
              title="Twitter / X (@Orbitrawtf)"
            >
              <XIcon className="w-4 h-4" />
            </a>
          )}
          {siteConfig.TELEGRAM_URL && (
            <a 
              href={siteConfig.TELEGRAM_URL} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-1 rounded-lg hover:bg-zinc-800 transition-all hover:scale-110 flex items-center justify-center" 
              title="Telegram (OrbitraHood)"
            >
              <TelegramIcon className="w-4 h-4" />
            </a>
          )}
          {siteConfig.GITHUB_URL && (
            <a href={siteConfig.GITHUB_URL} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:text-zinc-100 transition-colors" title="GitHub">
              <GitHubIcon />
            </a>
          )}
        </div>
        <WalletButton />
      </div>

      {/* Launch Token Modal */}
      <LaunchTokenModal isOpen={isLaunchModalOpen} onClose={() => setIsLaunchModalOpen(false)} />
    </header>
  );
}
