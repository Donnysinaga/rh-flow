import { http, createConfig } from 'wagmi';
import { injected, coinbaseWallet } from 'wagmi/connectors';
import { robinhoodChain } from './chains';
import { ROBINHOOD_CHAIN } from '../../config/network';

export const wagmiConfig = createConfig({
  chains: [robinhoodChain],
  connectors: [
    injected(),
    injected({ target: 'metaMask' }),
    injected({ target: 'coinbaseWallet' }),
    injected({
      target() {
        if (typeof window === 'undefined') return undefined;
        const win = window as any;
        const prov = win.okxwallet || win.ethereum?.providers?.find((p: any) => p.isOkxWallet);
        if (!prov) return undefined;
        return {
          id: 'okx',
          name: 'OKX Wallet',
          provider: prov,
        };
      },
    }),
    injected({
      target() {
        if (typeof window === 'undefined') return undefined;
        const win = window as any;
        const prov = win.phantom?.ethereum || win.ethereum?.providers?.find((p: any) => p.isPhantom);
        if (!prov) return undefined;
        return {
          id: 'phantom',
          name: 'Phantom',
          provider: prov,
        };
      },
    }),
    injected({
      target() {
        if (typeof window === 'undefined') return undefined;
        const win = window as any;
        const prov = win.bitkeep?.ethereum || win.bitgetWallet || win.ethereum?.providers?.find((p: any) => p.isBitKeep || p.isBitget);
        if (!prov) return undefined;
        return {
          id: 'bitget',
          name: 'Bitget Wallet',
          provider: prov,
        };
      },
    }),
    injected({
      target() {
        if (typeof window === 'undefined') return undefined;
        const win = window as any;
        const prov = win.trustwallet || win.ethereum?.providers?.find((p: any) => p.isTrust || p.isTrustWallet);
        if (!prov) return undefined;
        return {
          id: 'trust',
          name: 'Trust Wallet',
          provider: prov,
        };
      },
    }),
  ],
  transports: {
    [robinhoodChain.id]: http(ROBINHOOD_CHAIN.rpcUrls.primary),
  },
});
