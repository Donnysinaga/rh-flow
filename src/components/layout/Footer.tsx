'use client';

import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { PonsLogo } from '@/components/ui/PonsLogo';

const XIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.32.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

export function Footer() {
  return (
    <footer className="w-full bg-[#09090b] border-t border-zinc-800/80 py-8 px-4 mt-auto font-mono text-xs">
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* Main Footer Narrative Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Brand & Mission Statement */}
          <div className="md:col-span-6 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-mono text-lg font-black">RH</span>
              <span className="text-zinc-100 font-bold text-sm tracking-wider">FLOW TERMINAL</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Robinhood Network
              </span>
            </div>
            <p className="text-zinc-400 text-xs font-sans leading-relaxed max-w-md">
              The premier decentralized trading terminal and intelligence hub for Robinhood Chain. 
              Built to provide fair launches, on-chain liquidity flow, and MEV-protected execution with zero simulated data.
            </p>
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
                  <PonsLogo className="w-3 h-3" size={12} />
                  <span>RH Flow Protocol Architecture ↗</span>
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
                <a href={siteConfig.X_URL} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-100 transition-colors p-1" title="Twitter / X">
                  <XIcon />
                </a>
              )}
              {siteConfig.TELEGRAM_URL && (
                <a href={siteConfig.TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-100 transition-colors p-1" title="Telegram">
                  <TelegramIcon />
                </a>
              )}
              {siteConfig.GITHUB_URL && (
                <a href={siteConfig.GITHUB_URL} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-100 transition-colors p-1" title="GitHub">
                  <GitHubIcon />
                </a>
              )}
            </div>
            <p className="text-[10px] text-zinc-500 font-sans pt-1">
              Non-custodial, open-source protocol integration for decentralized community members.
            </p>
          </div>
        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div className="pt-4 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-zinc-500 text-[11px]">
          <div>
            <span>© 2026 RH FLOW. All on-chain rights reserved.</span>
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
