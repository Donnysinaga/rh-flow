'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useConnect, Connector } from 'wagmi';
import { 
  EIP6963ProviderDetail, 
  getMetaMaskDeepLink, 
  getCoinbaseDeepLink,
  getOKXDeepLink,
  getPhantomDeepLink,
  getTrustDeepLink,
  switchOrAddRobinhoodChain
} from '@/lib/web3/connectWallet';
import { ROBINHOOD_CHAIN } from '@/config/network';
import { 
  MonitorIcon, 
  SmartphoneIcon, 
  ShieldLockIcon,
  METAMASK_OFFICIAL_ICON,
  COINBASE_OFFICIAL_ICON,
  OKX_OFFICIAL_ICON,
  PHANTOM_OFFICIAL_ICON,
  BITGET_OFFICIAL_ICON,
  TRUST_OFFICIAL_ICON,
  BINANCE_OFFICIAL_ICON,
  BROWSER_INJECTED_ICON,
  getOfficialWalletLogo
} from './WalletIcons';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DetectedWalletItem {
  id: string;
  name: string;
  icon: string;
  provider?: any;
  connector?: Connector;
  isInstalled: boolean;
  installUrl?: string;
  deepLink?: string;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connectors, connectAsync, reset } = useConnect();

  const [eip6963Providers, setEip6963Providers] = useState<EIP6963ProviderDetail[]>([]);
  const [selectedWalletName, setSelectedWalletName] = useState<string>('');
  const [selectedWalletIcon, setSelectedWalletIcon] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'extension' | 'mobile'>('extension');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Multi-injected EIP-6963 Discovery listener
  useEffect(() => {
    const handleAnnouncement = (event: Event) => {
      const customEvent = event as CustomEvent<EIP6963ProviderDetail>;
      if (!customEvent.detail || !customEvent.detail.info) return;

      // Filter out Rabby
      if (
        customEvent.detail.info.name.toLowerCase().includes('rabby') ||
        customEvent.detail.info.rdns?.toLowerCase().includes('rabby')
      ) {
        return;
      }

      setEip6963Providers((prev) => {
        const exists = prev.some((p) => p.info.uuid === customEvent.detail.info.uuid);
        if (exists) return prev;
        return [...prev, customEvent.detail];
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('eip6963:announceProvider', handleAnnouncement);
      window.dispatchEvent(new Event('eip6963:requestProvider'));
      const t1 = setTimeout(() => window.dispatchEvent(new Event('eip6963:requestProvider')), 150);
      const t2 = setTimeout(() => window.dispatchEvent(new Event('eip6963:requestProvider')), 600);

      return () => {
        window.removeEventListener('eip6963:announceProvider', handleAnnouncement);
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, []);

  // Scan all injected window providers across all installed extensions
  const getInstalledAndAvailableWallets = useCallback((): { installed: DetectedWalletItem[]; uninstalled: DetectedWalletItem[] } => {
    if (typeof window === 'undefined') return { installed: [], uninstalled: [] };

    const installed: DetectedWalletItem[] = [];
    const seenIds = new Set<string>();

    const win = window as any;
    const winEth = win.ethereum;

    // Helper to find best connector
    const findConnector = (idOrName: string) => {
      const lower = idOrName.toLowerCase();
      return connectors.find(
        (c) => c.id.toLowerCase() === lower || c.name.toLowerCase().includes(lower) || lower.includes(c.name.toLowerCase())
      );
    };

    // 1. EIP-6963 Discovered Providers (Standard modern extensions)
    eip6963Providers.forEach((p) => {
      const name = p.info.name;
      const lower = name.toLowerCase();
      const id = p.info.uuid || p.info.rdns || lower;
      
      if (!seenIds.has(id) && !seenIds.has(lower)) {
        seenIds.add(id);
        seenIds.add(lower);

        installed.push({
          id,
          name,
          icon: p.info.icon || getOfficialWalletLogo(name),
          provider: p.provider,
          connector: findConnector(name) || findConnector(p.info.rdns) || connectors.find((c) => c.id === 'injected'),
          isInstalled: true,
        });
      }
    });

    // 2. Check window.ethereum.providers array (Multi-wallet injection standard)
    if (winEth && Array.isArray(winEth.providers)) {
      winEth.providers.forEach((prov: any, idx: number) => {
        let name = 'Web3 Provider';
        let icon = BROWSER_INJECTED_ICON;
        let id = `provider-${idx}`;

        if (prov.isMetaMask && !prov.isRabby) {
          name = 'MetaMask';
          icon = METAMASK_OFFICIAL_ICON;
          id = 'metamask';
        } else if (prov.isOkxWallet) {
          name = 'OKX Wallet';
          icon = OKX_OFFICIAL_ICON;
          id = 'okx';
        } else if (prov.isPhantom) {
          name = 'Phantom';
          icon = PHANTOM_OFFICIAL_ICON;
          id = 'phantom';
        } else if (prov.isCoinbaseWallet) {
          name = 'Coinbase Wallet';
          icon = COINBASE_OFFICIAL_ICON;
          id = 'coinbase';
        } else if (prov.isBitKeep || prov.isBitget) {
          name = 'Bitget Wallet';
          icon = BITGET_OFFICIAL_ICON;
          id = 'bitget';
        } else if (prov.isTrust || prov.isTrustWallet) {
          name = 'Trust Wallet';
          icon = TRUST_OFFICIAL_ICON;
          id = 'trust';
        }

        if (name.toLowerCase().includes('rabby')) return;

        if (!seenIds.has(id) && !seenIds.has(name.toLowerCase())) {
          seenIds.add(id);
          seenIds.add(name.toLowerCase());
          installed.push({
            id,
            name,
            icon,
            provider: prov,
            connector: findConnector(id) || findConnector(name) || connectors.find((c) => c.id === 'injected'),
            isInstalled: true,
          });
        }
      });
    }

    // 3. Direct dedicated provider objects
    // MetaMask direct
    if (winEth?.isMetaMask && !winEth?.isRabby && !seenIds.has('metamask')) {
      seenIds.add('metamask');
      installed.push({
        id: 'metamask',
        name: 'MetaMask',
        icon: METAMASK_OFFICIAL_ICON,
        provider: winEth,
        connector: findConnector('metamask') || connectors.find((c) => c.id === 'injected'),
        isInstalled: true,
      });
    }

    // OKX
    if (win.okxwallet && !seenIds.has('okx') && !seenIds.has('okx wallet')) {
      seenIds.add('okx');
      seenIds.add('okx wallet');
      installed.push({
        id: 'okx',
        name: 'OKX Wallet',
        icon: OKX_OFFICIAL_ICON,
        provider: win.okxwallet,
        connector: findConnector('okx') || connectors.find((c) => c.id === 'injected'),
        isInstalled: true,
      });
    }

    // Phantom
    if (win.phantom?.ethereum && !seenIds.has('phantom')) {
      seenIds.add('phantom');
      installed.push({
        id: 'phantom',
        name: 'Phantom',
        icon: PHANTOM_OFFICIAL_ICON,
        provider: win.phantom.ethereum,
        connector: findConnector('phantom') || connectors.find((c) => c.id === 'injected'),
        isInstalled: true,
      });
    }

    // Coinbase
    if (win.coinbaseWalletExtension && !seenIds.has('coinbase') && !seenIds.has('coinbase wallet')) {
      seenIds.add('coinbase');
      seenIds.add('coinbase wallet');
      installed.push({
        id: 'coinbase',
        name: 'Coinbase Wallet',
        icon: COINBASE_OFFICIAL_ICON,
        provider: win.coinbaseWalletExtension,
        connector: findConnector('coinbase') || connectors.find((c) => c.id === 'injected'),
        isInstalled: true,
      });
    }

    // Bitget
    if ((win.bitkeep?.ethereum || win.bitgetWallet) && !seenIds.has('bitget') && !seenIds.has('bitget wallet')) {
      seenIds.add('bitget');
      seenIds.add('bitget wallet');
      installed.push({
        id: 'bitget',
        name: 'Bitget Wallet',
        icon: BITGET_OFFICIAL_ICON,
        provider: win.bitkeep?.ethereum || win.bitgetWallet,
        connector: findConnector('bitget') || connectors.find((c) => c.id === 'injected'),
        isInstalled: true,
      });
    }

    // Trust
    if (win.trustwallet && !seenIds.has('trust') && !seenIds.has('trust wallet')) {
      seenIds.add('trust');
      seenIds.add('trust wallet');
      installed.push({
        id: 'trust',
        name: 'Trust Wallet',
        icon: TRUST_OFFICIAL_ICON,
        provider: win.trustwallet,
        connector: findConnector('trust') || connectors.find((c) => c.id === 'injected'),
        isInstalled: true,
      });
    }

    // Binance Web3
    if (win.binancew3w?.ethereum && !seenIds.has('binance')) {
      seenIds.add('binance');
      installed.push({
        id: 'binance',
        name: 'Binance Web3',
        icon: BINANCE_OFFICIAL_ICON,
        provider: win.binancew3w.ethereum,
        connector: findConnector('binance') || connectors.find((c) => c.id === 'injected'),
        isInstalled: true,
      });
    }

    // Default window.ethereum (Generic Injected)
    if (winEth && !seenIds.has('injected-default') && !seenIds.has('metamask') && installed.length === 0) {
      seenIds.add('injected-default');
      installed.push({
        id: 'injected-default',
        name: 'Browser Injected Wallet',
        icon: BROWSER_INJECTED_ICON,
        provider: winEth,
        connector: connectors[0],
        isInstalled: true,
      });
    }

    // Connectors fallback
    connectors.forEach((c) => {
      const lower = c.name.toLowerCase();
      if (lower.includes('rabby')) return;
      if (!seenIds.has(lower) && !seenIds.has(c.id.toLowerCase())) {
        seenIds.add(lower);
        seenIds.add(c.id.toLowerCase());
        installed.push({
          id: c.id,
          name: c.name === 'Injected' ? 'Detected Browser Extension' : c.name,
          icon: getOfficialWalletLogo(c.name),
          connector: c,
          isInstalled: true,
        });
      }
    });

    // Uninstalled popular wallets (offering direct install link)
    const catalog: DetectedWalletItem[] = [
      { id: 'metamask', name: 'MetaMask', icon: METAMASK_OFFICIAL_ICON, installUrl: 'https://metamask.io/download/', isInstalled: false },
      { id: 'okx', name: 'OKX Wallet', icon: OKX_OFFICIAL_ICON, installUrl: 'https://www.okx.com/web3', isInstalled: false },
      { id: 'coinbase', name: 'Coinbase Wallet', icon: COINBASE_OFFICIAL_ICON, installUrl: 'https://www.coinbase.com/wallet', isInstalled: false },
      { id: 'phantom', name: 'Phantom', icon: PHANTOM_OFFICIAL_ICON, installUrl: 'https://phantom.app/download', isInstalled: false },
      { id: 'trust', name: 'Trust Wallet', icon: TRUST_OFFICIAL_ICON, installUrl: 'https://trustwallet.com/browser-extension', isInstalled: false },
      { id: 'bitget', name: 'Bitget Wallet', icon: BITGET_OFFICIAL_ICON, installUrl: 'https://web3.bitget.com/', isInstalled: false },
    ];

    const uninstalled = catalog.filter((item) => !seenIds.has(item.id) && !seenIds.has(item.name.toLowerCase()));

    return { installed, uninstalled };
  }, [eip6963Providers, connectors]);

  if (!isOpen) return null;

  const { installed, uninstalled } = getInstalledAndAvailableWallets();

  const handleConnectWallet = async (wallet: DetectedWalletItem) => {
    setIsConnecting(true);
    setSelectedWalletName(wallet.name);
    setSelectedWalletIcon(wallet.icon);
    setErrorMessage('');

    try {
      const targetConnector = wallet.connector || connectors.find((c) => c.id === 'injected') || connectors[0];

      // 1. Connect account first through connector
      if (targetConnector) {
        await connectAsync({
          connector: targetConnector,
        });
      } else if (wallet.provider && wallet.provider.request) {
        const accounts = await wallet.provider.request({
          method: 'eth_requestAccounts',
        });
        if (!accounts || accounts.length === 0) {
          throw new Error('No account authorized in wallet.');
        }
      }

      // 2. Safely prompt network switch / addition to Robinhood Chain
      const activeProvider = wallet.provider || (window as any).ethereum;
      if (activeProvider) {
        await switchOrAddRobinhoodChain(activeProvider);
      }

      setIsConnecting(false);
      onClose();
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setIsConnecting(false);
      
      const msg = err?.message?.toLowerCase() || '';
      if (
        err.code === 4001 || 
        msg.includes('reject') || 
        msg.includes('cancel') ||
        msg.includes('denied') ||
        msg.includes('user closed')
      ) {
        setErrorMessage(`Connection request was cancelled in ${wallet.name}.`);
      } else if (err.code === -32002 || msg.includes('already pending')) {
        setErrorMessage(`Request already pending in ${wallet.name}. Please open your browser extension popup to approve.`);
      } else {
        setErrorMessage(
          err?.shortMessage || err?.message || `Failed to connect ${wallet.name}. Please ensure your wallet is active and unlocked.`
        );
      }
    }
  };

  if (!isOpen || !mounted) return null;

  const handleReset = () => {
    reset();
    setIsConnecting(false);
    setErrorMessage('');
    setSelectedWalletName('');
    setSelectedWalletIcon('');
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return createPortal(
    <div className="fixed inset-0 z-[999999] overflow-y-auto p-4 sm:p-6 flex min-h-full items-center justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-200 font-mono text-xs">
      <div 
        className="relative w-full max-w-md max-h-[85vh] flex flex-col bg-[#0e0e11] border border-zinc-800 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.95)] overflow-hidden text-zinc-100 my-auto z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="shrink-0 px-5 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/40">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-100">
              {isConnecting ? 'Connecting Wallet' : 'Connect Web3 Wallet'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Toggle */}
        {!isConnecting && !errorMessage && (
          <div className="shrink-0 flex border-b border-zinc-800/80 bg-zinc-950/60 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('extension')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'extension'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <MonitorIcon className="w-3.5 h-3.5" />
              <span>Browser Extensions ({installed.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('mobile')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'mobile'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <SmartphoneIcon className="w-3.5 h-3.5" />
              <span>Mobile dApp</span>
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {/* Connecting State */}
          {isConnecting ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center p-3 shadow-lg">
                  {selectedWalletIcon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={selectedWalletIcon} 
                      alt={selectedWalletName} 
                      className="w-10 h-10 object-contain rounded-lg" 
                    />
                  ) : (
                    <span className="text-2xl">⚡</span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#0e0e11] flex items-center justify-center">
                  <span className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-zinc-100">
                  Connecting {selectedWalletName || 'Wallet'}...
                </h4>
                <p className="text-[11px] text-zinc-400 max-w-xs leading-relaxed">
                  Please confirm the request in your {selectedWalletName} extension popup and approve switching to Robinhood Chain.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-[11px] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : errorMessage ? (
            /* Error State */
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 text-lg">
                ⚠️
              </div>

              <div className="space-y-1.5">
                <h4 className="text-sm font-semibold text-red-400">
                  Connection Incomplete
                </h4>
                <p className="text-[11px] text-zinc-400 max-w-sm leading-relaxed px-2 bg-zinc-950 p-2.5 rounded-lg border border-zinc-850">
                  {errorMessage}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors cursor-pointer"
                >
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : activeTab === 'extension' ? (
            /* Extensions View */
            <div className="space-y-4">
              {/* Installed / Discovered Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1 font-medium">
                  <span className="uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Detected Extensions ({installed.length})
                  </span>
                  <span className="text-zinc-500 text-[10px]">Ready to Connect</span>
                </div>

                <div className="space-y-1.5">
                  {installed.length > 0 ? (
                    installed.map((wallet) => (
                      <button
                        key={wallet.id}
                        type="button"
                        onClick={() => handleConnectWallet(wallet)}
                        className="w-full flex items-center justify-between p-3 bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800/90 hover:border-emerald-500/50 rounded-xl transition-all group cursor-pointer text-left shadow-sm active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center p-1.5 overflow-hidden shrink-0 group-hover:border-emerald-500/30 transition-colors">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={wallet.icon}
                              alt={wallet.name}
                              className="w-full h-full object-contain rounded"
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-xs">
                              <span>{wallet.name}</span>
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-normal border border-emerald-500/20">
                                Installed
                              </span>
                            </div>
                            <div className="text-[10px] text-zinc-500">
                              Click to connect & switch to Robinhood Chain
                            </div>
                          </div>
                        </div>
                        <span className="text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all text-sm font-bold">
                          →
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 text-center space-y-2">
                      <p className="text-zinc-400 text-[11px]">
                        No active browser wallet extension was automatically detected.
                      </p>
                      <p className="text-zinc-500 text-[10px]">
                        Install MetaMask, OKX, or Phantom below to connect.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Other Catalog Wallets */}
              {uninstalled.length > 0 && (
                <div className="pt-2 border-t border-zinc-850/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1 font-medium">
                    <span className="uppercase tracking-wider">Other Popular Wallets</span>
                    <span className="text-[10px]">Install Extension</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {uninstalled.map((wallet) => (
                      <a
                        key={wallet.id}
                        href={wallet.installUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 p-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-750 rounded-xl transition-all group"
                      >
                        <div className="w-6 h-6 rounded bg-zinc-900 flex items-center justify-center p-1 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={wallet.icon}
                            alt={wallet.name}
                            className="w-full h-full object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                          />
                        </div>
                        <div className="overflow-hidden text-left">
                          <div className="font-medium text-zinc-400 group-hover:text-zinc-200 truncate text-[11px]">
                            {wallet.name}
                          </div>
                          <div className="text-[9px] text-zinc-600 group-hover:text-emerald-400 flex items-center gap-0.5">
                            <span>Get</span>
                            <span>↗</span>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Mobile dApp View */
            <div className="space-y-3">
              <div className="text-[11px] text-zinc-400 leading-relaxed bg-zinc-950 p-3 rounded-xl border border-zinc-850 flex items-start gap-2.5">
                <SmartphoneIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-zinc-200 block mb-0.5">Open on Mobile Devices</span>
                  Tap below to launch RH FLOW directly inside your wallet mobile dApp browser.
                </div>
              </div>

              <div className="space-y-2">
                <a
                  href={getMetaMaskDeepLink(currentUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center p-1.5 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={METAMASK_OFFICIAL_ICON} alt="MetaMask" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <div className="font-semibold text-zinc-200 group-hover:text-emerald-400 text-xs">
                        MetaMask Mobile
                      </div>
                      <div className="text-[10px] text-zinc-500">Open in MetaMask mobile dApp browser</div>
                    </div>
                  </div>
                  <span className="text-zinc-500 group-hover:text-emerald-400 text-xs">Open ↗</span>
                </a>

                <a
                  href={getOKXDeepLink(currentUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center p-1.5 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={OKX_OFFICIAL_ICON} alt="OKX" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <div className="font-semibold text-zinc-200 group-hover:text-emerald-400 text-xs">
                        OKX Mobile Wallet
                      </div>
                      <div className="text-[10px] text-zinc-500">Open in OKX mobile dApp browser</div>
                    </div>
                  </div>
                  <span className="text-zinc-500 group-hover:text-emerald-400 text-xs">Open ↗</span>
                </a>

                <a
                  href={getCoinbaseDeepLink(currentUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center p-1.5 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={COINBASE_OFFICIAL_ICON} alt="Coinbase" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <div className="font-semibold text-zinc-200 group-hover:text-emerald-400 text-xs">
                        Coinbase Wallet
                      </div>
                      <div className="text-[10px] text-zinc-500">Open in Coinbase mobile dApp browser</div>
                    </div>
                  </div>
                  <span className="text-zinc-500 group-hover:text-emerald-400 text-xs">Open ↗</span>
                </a>

                <a
                  href={getPhantomDeepLink(currentUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center p-1.5 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={PHANTOM_OFFICIAL_ICON} alt="Phantom" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <div className="font-semibold text-zinc-200 group-hover:text-emerald-400 text-xs">
                        Phantom Mobile
                      </div>
                      <div className="text-[10px] text-zinc-500">Open in Phantom mobile dApp browser</div>
                    </div>
                  </div>
                  <span className="text-zinc-500 group-hover:text-emerald-400 text-xs">Open ↗</span>
                </a>

                <a
                  href={getTrustDeepLink(currentUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center p-1.5 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={TRUST_OFFICIAL_ICON} alt="Trust" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <div className="font-semibold text-zinc-200 group-hover:text-emerald-400 text-xs">
                        Trust Wallet Mobile
                      </div>
                      <div className="text-[10px] text-zinc-500">Open in Trust Wallet mobile dApp browser</div>
                    </div>
                  </div>
                  <span className="text-zinc-500 group-hover:text-emerald-400 text-xs">Open ↗</span>
                </a>
              </div>
            </div>
          )}

          {/* Footer Security Badge */}
          <div className="pt-2 border-t border-zinc-850 flex items-center justify-between text-[10px] text-zinc-500">
            <div className="flex items-center gap-1.5">
              <ShieldLockIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Robinhood Chain Network</span>
            </div>
            <span>EIP-6963 Verified</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
