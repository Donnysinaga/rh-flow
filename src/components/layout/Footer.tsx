'use client';

import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { OrbitraLogo } from '@/components/ui/OrbitraLogo';

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

export function Footer() {
  return (
    <footer className="w-full bg-[#000000] border-t border-[#1a222d] py-8 px-4 mt-auto font-mono text-xs">
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* Main Footer Narrative Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Brand & Mission Statement */}
          <div className="md:col-span-6 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <OrbitraLogo className="w-6 h-6" size={24} />
              <span className="text-[#00C805] font-mono text-lg font-black">ORBITRA</span>
              <span className="text-white font-bold text-sm tracking-wider">TERMINAL</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#00C805]/10 text-[#00C805] border border-[#00C805]/20 font-semibold">
                $ORB • Robinhood Chain
              </span>
            </div>
            <p className="text-zinc-400 text-xs font-sans leading-relaxed max-w-md">
              The premier decentralized trading terminal and intelligence hub for Robinhood Chain. 
              Built to provide fair launches, on-chain liquidity flow, and MEV-protected execution with zero simulated data.
            </p>
            {siteConfig.CONTRACT_ADDRESS && (
              <div className="pt-1 flex items-center gap-2">
                <span className="text-zinc-500 font-mono text-[10px]">Official CA:</span>
                <a
                  href={`https://robinhoodchain.blockscout.com/token/${siteConfig.CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-300 hover:text-[#00C805] font-mono text-[11px] transition-colors"
                >
                  {siteConfig.CONTRACT_ADDRESS} ↗
                </a>
              </div>
            )}
          </div>

          {/* Protocol & Resources Links */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="text-zinc-300 font-bold uppercase tracking-wider text-[11px]">
              Protocol & Verification
            </h4>
            <ul className="space-y-1 text-zinc-400 text-[11px]">
              <li>
                <a
                  href="https://robinhoodchain.blockscout.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <OrbitraLogo className="w-3.5 h-3.5" size={14} />
                  <span>Orbitra Protocol Architecture ↗</span>
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.EXPLORER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-zinc-200 transition-colors"
                >
                  Robinscan Explorer ↗
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.BLOCKSCOUT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-zinc-200 transition-colors"
                >
                  Blockscout Indexer ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Socials & Community */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="text-zinc-300 font-bold uppercase tracking-wider text-[11px]">
              Community & Ecosystem
            </h4>
            <div className="flex items-center gap-3 text-zinc-400 pt-1">
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
                <a href={siteConfig.GITHUB_URL} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-100 transition-colors p-1" title="GitHub">
                  <GitHubIcon />
                </a>
              )}
            </div>
            <p className="text-[10px] text-zinc-500 font-sans pt-1">
              Join the official Orbitra ($ORB) community on Twitter/X and Telegram.
            </p>
          </div>
        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div className="pt-4 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-zinc-500 text-[11px]">
          <div>
            <span>© 2026 Orbitra ($ORB). All on-chain rights reserved.</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-400">
            <span>Decentralized EVM Layer 2</span>
            <span>•</span>
            <span>Sub-Second Finality</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
