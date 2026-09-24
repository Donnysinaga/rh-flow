'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  METAMASK_OFFICIAL_ICON,
  WALLETCONNECT_OFFICIAL_ICON,
  COINBASE_OFFICIAL_ICON,
  OKX_OFFICIAL_ICON,
  PHANTOM_OFFICIAL_ICON,
  BITGET_OFFICIAL_ICON,
  TRUST_OFFICIAL_ICON,
  BINANCE_OFFICIAL_ICON,
  RAINBOW_OFFICIAL_ICON,
  BROWSER_INJECTED_ICON,
  SearchIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  HelpCircleIcon,
  QrCodeIcon,
  SmartphoneIcon,
  getOfficialWalletLogo
} from './WalletIcons';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WalletItemData {
  id: string;
  name: string;
  icon: string;
  badge?: string;
  isInstalled: boolean;
  provider?: any;
  connector?: Connector;
  installUrl?: string;
  deepLink?: string;
}

type ModalView = 'main' | 'qr' | 'search' | 'help';

// Comprehensive catalog of popular Web3 wallets
const POPULAR_CATALOG: Omit<WalletItemData, 'isInstalled'>[] = [
  { id: 'metamask', name: 'MetaMask', icon: METAMASK_OFFICIAL_ICON, installUrl: 'https://metamask.io/download/' },
  { id: 'okx', name: 'OKX Wallet', icon: OKX_OFFICIAL_ICON, installUrl: 'https://www.okx.com/web3' },
  { id: 'phantom', name: 'Phantom', icon: PHANTOM_OFFICIAL_ICON, installUrl: 'https://phantom.app/download' },
  { id: 'coinbase', name: 'Coinbase Wallet', icon: COINBASE_OFFICIAL_ICON, installUrl: 'https://www.coinbase.com/wallet' },
  { id: 'trust', name: 'Trust Wallet', icon: TRUST_OFFICIAL_ICON, installUrl: 'https://trustwallet.com/browser-extension' },
  { id: 'bitget', name: 'Bitget Wallet', icon: BITGET_OFFICIAL_ICON, installUrl: 'https://web3.bitget.com/' },
  { id: 'binance', name: 'Binance Web3', icon: BINANCE_OFFICIAL_ICON, installUrl: 'https://www.binance.com/en/web3wallet' },
  { id: 'rainbow', name: 'Rainbow', icon: RAINBOW_OFFICIAL_ICON, installUrl: 'https://rainbow.me/' },
  { id: 'zerion', name: 'Zerion Wallet', icon: BROWSER_INJECTED_ICON, installUrl: 'https://zerion.io/' },
  { id: 'safe', name: 'Safe Wallet', icon: BROWSER_INJECTED_ICON, installUrl: 'https://safe.global/' },
  { id: 'tokenpocket', name: 'TokenPocket', icon: BROWSER_INJECTED_ICON, installUrl: 'https://www.tokenpocket.pro/' },
  { id: 'imtoken', name: 'imToken', icon: BROWSER_INJECTED_ICON, installUrl: 'https://token.im/' },
  { id: 'coin98', name: 'Coin98', icon: BROWSER_INJECTED_ICON, installUrl: 'https://coin98.com/' },
];

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connectors, connectAsync, reset } = useConnect();

  const [eip6963Providers, setEip6963Providers] = useState<EIP6963ProviderDetail[]>([]);
  const [activeView, setActiveView] = useState<ModalView>('main');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedWalletName, setSelectedWalletName] = useState<string>('');
  const [selectedWalletIcon, setSelectedWalletIcon] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset state on open/close
  useEffect(() => {
    if (isOpen) {
      setActiveView('main');
      setSearchQuery('');
      setErrorMessage('');
      setIsConnecting(false);
    }
  }, [isOpen]);

  // EIP-6963 Discovery listener
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

  // Discover all installed window providers
  const getDetectedWallets = useCallback((): Map<string, WalletItemData> => {
    const map = new Map<string, WalletItemData>();
    if (typeof window === 'undefined') return map;

    const win = window as any;
    const winEth = win.ethereum;

    const findConnector = (idOrName: string) => {
      const lower = idOrName.toLowerCase();
      return connectors.find(
        (c) => c.id.toLowerCase() === lower || c.name.toLowerCase().includes(lower) || lower.includes(c.name.toLowerCase())
      );
    };

    // 1. EIP-6963
    eip6963Providers.forEach((p) => {
      const name = p.info.name;
      const lower = name.toLowerCase();
      if (lower.includes('rabby')) return;

      let key = lower;
      if (lower.includes('metamask')) key = 'metamask';
      else if (lower.includes('okx')) key = 'okx';
      else if (lower.includes('phantom')) key = 'phantom';
      else if (lower.includes('coinbase')) key = 'coinbase';
      else if (lower.includes('bitget') || lower.includes('bitkeep')) key = 'bitget';
      else if (lower.includes('trust')) key = 'trust';
      else if (lower.includes('binance')) key = 'binance';

      map.set(key, {
        id: p.info.uuid || key,
        name,
        icon: p.info.icon || getOfficialWalletLogo(name),
        badge: 'INSTALLED',
        isInstalled: true,
        provider: p.provider,
        connector: findConnector(name) || findConnector(p.info.rdns) || connectors.find((c) => c.id === 'injected'),
      });
    });

    // 2. window.ethereum.providers array
    if (winEth && Array.isArray(winEth.providers)) {
      winEth.providers.forEach((prov: any, idx: number) => {
        if (prov.isMetaMask && !prov.isRabby && !map.has('metamask')) {
          map.set('metamask', {
            id: 'metamask',
            name: 'MetaMask',
            icon: METAMASK_OFFICIAL_ICON,
            badge: 'INSTALLED',
            isInstalled: true,
            provider: prov,
            connector: findConnector('metamask') || connectors.find((c) => c.id === 'injected'),
          });
        } else if (prov.isOkxWallet && !map.has('okx')) {
          map.set('okx', {
            id: 'okx',
            name: 'OKX Wallet',
            icon: OKX_OFFICIAL_ICON,
            badge: 'INSTALLED',
            isInstalled: true,
            provider: prov,
            connector: findConnector('okx') || connectors.find((c) => c.id === 'injected'),
          });
        } else if (prov.isPhantom && !map.has('phantom')) {
          map.set('phantom', {
            id: 'phantom',
            name: 'Phantom',
            icon: PHANTOM_OFFICIAL_ICON,
            badge: 'INSTALLED',
            isInstalled: true,
            provider: prov,
            connector: findConnector('phantom') || connectors.find((c) => c.id === 'injected'),
          });
        } else if (prov.isCoinbaseWallet && !map.has('coinbase')) {
          map.set('coinbase', {
            id: 'coinbase',
            name: 'Coinbase Wallet',
            icon: COINBASE_OFFICIAL_ICON,
            badge: 'INSTALLED',
            isInstalled: true,
            provider: prov,
            connector: findConnector('coinbase') || connectors.find((c) => c.id === 'injected'),
          });
        }
      });
    }

    // 3. Direct objects
    if (winEth?.isMetaMask && !winEth?.isRabby && !map.has('metamask')) {
      map.set('metamask', {
        id: 'metamask',
        name: 'MetaMask',
        icon: METAMASK_OFFICIAL_ICON,
        badge: 'INSTALLED',
        isInstalled: true,
        provider: winEth,
        connector: findConnector('metamask') || connectors.find((c) => c.id === 'injected'),
      });
    }

    if (win.okxwallet && !map.has('okx')) {
      map.set('okx', {
        id: 'okx',
        name: 'OKX Wallet',
        icon: OKX_OFFICIAL_ICON,
        badge: 'INSTALLED',
        isInstalled: true,
        provider: win.okxwallet,
        connector: findConnector('okx') || connectors.find((c) => c.id === 'injected'),
      });
    }

    if (win.phantom?.ethereum && !map.has('phantom')) {
      map.set('phantom', {
        id: 'phantom',
        name: 'Phantom',
        icon: PHANTOM_OFFICIAL_ICON,
        badge: 'INSTALLED',
        isInstalled: true,
        provider: win.phantom.ethereum,
        connector: findConnector('phantom') || connectors.find((c) => c.id === 'injected'),
      });
    }

    if (win.coinbaseWalletExtension && !map.has('coinbase')) {
      map.set('coinbase', {
        id: 'coinbase',
        name: 'Coinbase Wallet',
        icon: COINBASE_OFFICIAL_ICON,
        badge: 'INSTALLED',
        isInstalled: true,
        provider: win.coinbaseWalletExtension,
        connector: findConnector('coinbase') || connectors.find((c) => c.id === 'injected'),
      });
    }

    if ((win.bitkeep?.ethereum || win.bitgetWallet) && !map.has('bitget')) {
      map.set('bitget', {
        id: 'bitget',
        name: 'Bitget Wallet',
        icon: BITGET_OFFICIAL_ICON,
        badge: 'INSTALLED',
        isInstalled: true,
        provider: win.bitkeep?.ethereum || win.bitgetWallet,
        connector: findConnector('bitget') || connectors.find((c) => c.id === 'injected'),
      });
    }

    if (win.trustwallet && !map.has('trust')) {
      map.set('trust', {
        id: 'trust',
        name: 'Trust Wallet',
        icon: TRUST_OFFICIAL_ICON,
        badge: 'INSTALLED',
        isInstalled: true,
        provider: win.trustwallet,
        connector: findConnector('trust') || connectors.find((c) => c.id === 'injected'),
      });
    }

    if (win.binancew3w?.ethereum && !map.has('binance')) {
      map.set('binance', {
        id: 'binance',
        name: 'Binance Web3',
        icon: BINANCE_OFFICIAL_ICON,
        badge: 'INSTALLED',
        isInstalled: true,
        provider: win.binancew3w.ethereum,
        connector: findConnector('binance') || connectors.find((c) => c.id === 'injected'),
      });
    }

    // Default window.ethereum if nothing else detected
    if (winEth && map.size === 0) {
      map.set('injected-default', {
        id: 'injected-default',
        name: 'Browser Injected Wallet',
        icon: BROWSER_INJECTED_ICON,
        badge: 'INSTALLED',
        isInstalled: true,
        provider: winEth,
        connector: connectors[0],
      });
    }

    return map;
  }, [eip6963Providers, connectors]);

  // Connect Handler preserving 100% web3 functionality
  const handleConnectWallet = async (wallet: WalletItemData) => {
    if (!wallet.isInstalled && wallet.installUrl) {
      window.open(wallet.installUrl, '_blank');
      return;
    }

    setIsConnecting(true);
    setSelectedWalletName(wallet.name);
    setSelectedWalletIcon(wallet.icon);
    setErrorMessage('');

    try {
      const targetConnector = wallet.connector || connectors.find((c) => c.id === 'injected') || connectors[0];

      if (targetConnector) {
        await connectAsync({ connector: targetConnector });
      } else if (wallet.provider && wallet.provider.request) {
        const accounts = await wallet.provider.request({
          method: 'eth_requestAccounts',
        });
        if (!accounts || accounts.length === 0) {
          throw new Error('No account authorized in wallet.');
        }
      }

      // Prompt network switch / add Robinhood Chain
      const activeProvider = wallet.provider || (typeof window !== 'undefined' ? (window as any).ethereum : null);
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
          err?.shortMessage || err?.message || `Failed to connect ${wallet.name}. Please ensure your extension is active and unlocked.`
        );
      }
    }
  };

  const handleReset = () => {
    reset();
    setIsConnecting(false);
    setErrorMessage('');
    setSelectedWalletName('');
    setSelectedWalletIcon('');
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const detectedMap = useMemo(() => getDetectedWallets(), [getDetectedWallets]);

  // Primary Wallets list to show on Main Pons view:
  // 1. WalletConnect (QR Code)
  // 2. MetaMask
  // 3. OKX Wallet
  // 4. Phantom
  // Plus any additional installed wallets detected
  const mainWalletRows = useMemo(() => {
    const list: WalletItemData[] = [];

    // 1. WalletConnect row
    list.push({
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: WALLETCONNECT_OFFICIAL_ICON,
      badge: 'QR CODE',
      isInstalled: true,
    });

    // 2. MetaMask
    const mm = detectedMap.get('metamask');
    list.push({
      id: 'metamask',
      name: 'MetaMask',
      icon: METAMASK_OFFICIAL_ICON,
      badge: mm ? 'INSTALLED' : undefined,
      isInstalled: !!mm,
      provider: mm?.provider,
      connector: mm?.connector,
      installUrl: 'https://metamask.io/download/',
    });

    // 3. OKX Wallet
    const okx = detectedMap.get('okx');
    list.push({
      id: 'okx',
      name: 'OKX Wallet',
      icon: OKX_OFFICIAL_ICON,
      badge: okx ? 'INSTALLED' : undefined,
      isInstalled: !!okx,
      provider: okx?.provider,
      connector: okx?.connector,
      installUrl: 'https://www.okx.com/web3',
    });

    // 4. Phantom
    const phantom = detectedMap.get('phantom');
    list.push({
      id: 'phantom',
      name: 'Phantom',
      icon: PHANTOM_OFFICIAL_ICON,
      badge: phantom ? 'INSTALLED' : undefined,
      isInstalled: !!phantom,
      provider: phantom?.provider,
      connector: phantom?.connector,
      installUrl: 'https://phantom.app/download',
    });

    // 5. Any extra installed wallets (e.g. Coinbase, Bitget, Trust, Binance)
    detectedMap.forEach((wallet, key) => {
      if (!['metamask', 'okx', 'phantom'].includes(key)) {
        list.push(wallet);
      }
    });

    return list;
  }, [detectedMap]);

  // Search filter list
  const filteredCatalog = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const allWallets: WalletItemData[] = POPULAR_CATALOG.map((item) => {
      const detected = detectedMap.get(item.id);
      return {
        ...item,
        isInstalled: !!detected,
        badge: detected ? 'INSTALLED' : undefined,
        provider: detected?.provider,
        connector: detected?.connector,
      };
    });

    if (!q) return allWallets;
    return allWallets.filter((w) => w.name.toLowerCase().includes(q));
  }, [searchQuery, detectedMap]);

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] overflow-y-auto p-4 flex min-h-full items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-[380px] bg-[#141416] border border-[#27272a] rounded-[28px] shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden text-zinc-100 flex flex-col my-auto transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="shrink-0 px-5 pt-5 pb-3 flex items-center justify-between">
          {/* Left action button (Back if in subview, or Help icon) */}
          {activeView !== 'main' && !isConnecting && !errorMessage ? (
            <button
              type="button"
              onClick={() => setActiveView('main')}
              className="w-8 h-8 rounded-full bg-[#1c1d22] hover:bg-[#282932] border border-[#2e2f38] flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Back"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveView('help')}
              className="w-8 h-8 rounded-full bg-[#1c1d22] hover:bg-[#282932] border border-[#2e2f38] flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Help / What is a Wallet?"
            >
              <HelpCircleIcon className="w-4 h-4" />
            </button>
          )}

          {/* Title */}
          <h3 className="text-[15px] font-semibold tracking-tight text-white">
            {isConnecting
              ? 'Connecting'
              : errorMessage
              ? 'Connection'
              : activeView === 'qr'
              ? 'WalletConnect'
              : activeView === 'search'
              ? 'Search Wallet'
              : activeView === 'help'
              ? 'What is a Wallet?'
              : 'Connect Wallet'}
          </h3>

          {/* Close button */}
          <button
            type="button"
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-[#1c1d22] hover:bg-[#282932] border border-[#2e2f38] flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer text-sm"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 pt-1 space-y-2 max-h-[75vh] overflow-y-auto">
          {/* 1. Connecting State */}
          {isConnecting ? (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-18 h-18 rounded-2xl bg-[#1c1d22] border border-[#2e2f38] flex items-center justify-center p-3.5 shadow-2xl">
                  {selectedWalletIcon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={selectedWalletIcon} 
                      alt={selectedWalletName} 
                      className="w-11 h-11 object-contain rounded-xl" 
                    />
                  ) : (
                    <span className="text-2xl">⚡</span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#00C805] border-2 border-[#141416] flex items-center justify-center">
                  <span className="w-2.5 h-2.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-base font-semibold text-white">
                  Continue in {selectedWalletName || 'Wallet'}
                </h4>
                <p className="text-xs text-zinc-400 max-w-[260px] leading-relaxed">
                  Accept connection request in the wallet extension and switch network to Robinhood Chain.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-2 rounded-xl bg-[#1c1d22] hover:bg-[#282932] text-zinc-300 hover:text-white border border-[#2e2f38] text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : errorMessage ? (
            /* 2. Error State */
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 text-xl">
                ⚠️
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-red-400">
                  Connection Incomplete
                </h4>
                <p className="text-xs text-zinc-400 max-w-[280px] leading-relaxed p-3 bg-[#1c1d22] rounded-xl border border-[#2e2f38]">
                  {errorMessage}
                </p>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-2 rounded-xl bg-[#00C805] hover:bg-[#00E806] text-black font-semibold text-xs transition-colors cursor-pointer"
                >
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleReset();
                    setActiveView('main');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#1c1d22] hover:bg-[#282932] text-zinc-300 text-xs transition-colors cursor-pointer border border-[#2e2f38]"
                >
                  Back
                </button>
              </div>
            </div>
          ) : activeView === 'main' ? (
            /* 3. Main Pons / Reown AppKit List View */
            <div className="space-y-2">
              {/* Primary list items */}
              {mainWalletRows.map((wallet) => {
                const isWC = wallet.id === 'walletconnect';

                return (
                  <button
                    key={wallet.id}
                    type="button"
                    onClick={() => {
                      if (isWC) {
                        setActiveView('qr');
                      } else {
                        handleConnectWallet(wallet);
                      }
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#1c1d22] hover:bg-[#25262c] border border-transparent hover:border-[#343540] transition-all duration-150 group cursor-pointer text-left active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#141416] border border-[#2e2f38] flex items-center justify-center p-2 shrink-0 group-hover:border-[#3e404d] transition-colors">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={wallet.icon}
                          alt={wallet.name}
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>
                      <span className="font-semibold text-sm text-zinc-100 group-hover:text-white transition-colors">
                        {wallet.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {wallet.badge && (
                        <span 
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            wallet.badge === 'QR CODE'
                              ? 'bg-[#0f2e1b] text-[#00C805] border border-[#00C805]/30'
                              : 'bg-[#0f2e1b] text-[#00C805] border border-[#00C805]/30'
                          }`}
                        >
                          {wallet.badge}
                        </span>
                      )}
                      <ChevronRightIcon className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                    </div>
                  </button>
                );
              })}

              {/* Search Wallet Row */}
              <button
                type="button"
                onClick={() => setActiveView('search')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#1c1d22] hover:bg-[#25262c] border border-transparent hover:border-[#343540] transition-all duration-150 group cursor-pointer text-left active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#141416] border border-[#2e2f38] flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 transition-colors shrink-0">
                    <SearchIcon className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-sm text-zinc-300 group-hover:text-white transition-colors">
                    Search Wallet
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-zinc-400 bg-[#282932] px-2 py-0.5 rounded-full">
                    550+
                  </span>
                  <ChevronRightIcon className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                </div>
              </button>
            </div>
          ) : activeView === 'qr' ? (
            /* 4. WalletConnect / Mobile QR Code View */
            <div className="space-y-4 py-2">
              <div className="bg-[#1c1d22] p-4 rounded-2xl border border-[#2e2f38] text-center space-y-3">
                <div className="w-48 h-48 mx-auto bg-white rounded-2xl p-3 flex flex-col items-center justify-center shadow-inner relative group">
                  {/* Stylized QR Code placeholder with WalletConnect Brand */}
                  <div className="w-full h-full border-2 border-dashed border-zinc-300 rounded-xl flex flex-col items-center justify-center text-zinc-800 p-2 text-center bg-zinc-50">
                    <QrCodeIcon className="w-16 h-16 text-zinc-800 mb-1" />
                    <span className="text-[11px] font-bold text-zinc-700">Scan with your mobile wallet</span>
                    <span className="text-[9px] text-zinc-500">Robinhood Chain (4663)</span>
                  </div>
                </div>

                <div className="space-y-1 text-center">
                  <p className="text-xs text-zinc-300 font-medium">
                    Scan with MetaMask, OKX, Phantom or Trust Wallet
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Or copy the connection link below
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#282932] hover:bg-[#343540] text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>{copiedLink ? '✓ Link Copied to Clipboard' : '📋 Copy Connection Link'}</span>
                </button>
              </div>

              {/* Direct Mobile Launch Shortcuts */}
              <div className="space-y-2">
                <div className="text-[11px] font-medium text-zinc-400 px-1 uppercase tracking-wider">
                  Open Direct in Mobile App
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={getMetaMaskDeepLink(currentUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2.5 bg-[#1c1d22] hover:bg-[#25262c] rounded-xl border border-[#2e2f38] transition-colors group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={METAMASK_OFFICIAL_ICON} alt="MetaMask" className="w-5 h-5 object-contain" />
                    <span className="text-xs text-zinc-300 group-hover:text-white font-medium">MetaMask</span>
                  </a>
                  <a
                    href={getOKXDeepLink(currentUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2.5 bg-[#1c1d22] hover:bg-[#25262c] rounded-xl border border-[#2e2f38] transition-colors group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={OKX_OFFICIAL_ICON} alt="OKX" className="w-5 h-5 object-contain" />
                    <span className="text-xs text-zinc-300 group-hover:text-white font-medium">OKX Wallet</span>
                  </a>
                  <a
                    href={getPhantomDeepLink(currentUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2.5 bg-[#1c1d22] hover:bg-[#25262c] rounded-xl border border-[#2e2f38] transition-colors group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={PHANTOM_OFFICIAL_ICON} alt="Phantom" className="w-5 h-5 object-contain" />
                    <span className="text-xs text-zinc-300 group-hover:text-white font-medium">Phantom</span>
                  </a>
                  <a
                    href={getTrustDeepLink(currentUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2.5 bg-[#1c1d22] hover:bg-[#25262c] rounded-xl border border-[#2e2f38] transition-colors group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={TRUST_OFFICIAL_ICON} alt="Trust" className="w-5 h-5 object-contain" />
                    <span className="text-xs text-zinc-300 group-hover:text-white font-medium">Trust Wallet</span>
                  </a>
                </div>
              </div>
            </div>
          ) : activeView === 'search' ? (
            /* 5. Search Wallets View */
            <div className="space-y-3">
              <div className="relative">
                <SearchIcon className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search wallet name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-[#1c1d22] border border-[#2e2f38] focus:border-[#00C805] text-white text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                {filteredCatalog.length > 0 ? (
                  filteredCatalog.map((wallet) => (
                    <button
                      key={wallet.id}
                      type="button"
                      onClick={() => handleConnectWallet(wallet)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#1c1d22] hover:bg-[#25262c] border border-transparent hover:border-[#343540] transition-colors group cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#141416] border border-[#2e2f38] flex items-center justify-center p-1.5 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={wallet.icon}
                            alt={wallet.name}
                            className="w-full h-full object-contain rounded"
                          />
                        </div>
                        <span className="font-medium text-xs text-zinc-200 group-hover:text-white">
                          {wallet.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {wallet.isInstalled ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#0f2e1b] text-[#00C805] border border-[#00C805]/30">
                            INSTALLED
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300 flex items-center gap-0.5">
                            <span>Get</span>
                            <span>↗</span>
                          </span>
                        )}
                        <ChevronRightIcon className="w-3.5 h-3.5 text-zinc-500" />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-zinc-500">
                    No wallets found matching &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* 6. Help / "What is a Wallet?" View */
            <div className="space-y-3 py-1 text-zinc-300 text-xs leading-relaxed">
              <div className="bg-[#1c1d22] p-3.5 rounded-2xl border border-[#2e2f38] space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-1.5 text-xs">
                  <span className="text-[#00C805]">●</span> A Digital Key to Web3
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Wallets let you store your crypto assets, interact with smart contracts on Robinhood Chain, and authenticate without a password.
                </p>
              </div>

              <div className="bg-[#1c1d22] p-3.5 rounded-2xl border border-[#2e2f38] space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-1.5 text-xs">
                  <span className="text-[#00C805]">●</span> Robinhood Chain Verified
                </h4>
                <p className="text-[11px] text-zinc-400">
                  RH FLOW automatically adds and connects to Robinhood Chain (ID: 4663) using ultra-fast RPC nodes.
                </p>
              </div>

              <div className="pt-1">
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-[#00C805] hover:bg-[#00E806] text-black text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Get Started with MetaMask</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-3 border-t border-[#27272a] bg-[#111113] flex items-center justify-between text-[11px] text-zinc-500">
          <span className="text-zinc-500 font-medium">
            UX by <span className="text-zinc-300 font-semibold">reown</span>
          </span>
          <div className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C805]"></span>
            <span>Robinhood Chain</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
