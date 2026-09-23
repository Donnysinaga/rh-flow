'use client';

export interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: any;
}

export const ROBINHOOD_CHAIN_HEX = '0x1237'; // 4663 in hex

export const ROBINHOOD_CHAIN_PARAMS = {
  chainId: ROBINHOOD_CHAIN_HEX,
  chainName: 'Robinhood Chain',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: [
    'https://rpc-robinhood.blockmachine.io',
    'https://robinhood.rpc.blxrbdn.com',
  ],
  blockExplorerUrls: ['https://robinscan.io'],
};

/**
 * Ensures the connected provider is switched to Robinhood Chain (ID 4663).
 * If the network is not yet added in the wallet (code 4902), automatically adds it.
 */
export async function switchOrAddRobinhoodChain(provider: any): Promise<boolean> {
  if (!provider || !provider.request) return false;

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ROBINHOOD_CHAIN_HEX }],
    });
    return true;
  } catch (switchError: any) {
    const isUnrecognized = 
      switchError.code === 4902 || 
      switchError.data?.originalError?.code === 4902 || 
      switchError.message?.includes('4902') ||
      switchError.message?.toLowerCase().includes('unrecognized chain') ||
      switchError.message?.toLowerCase().includes('not added');

    if (isUnrecognized) {
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [ROBINHOOD_CHAIN_PARAMS],
        });
        return true;
      } catch (addError: any) {
        console.warn('User rejected or error adding Robinhood Chain:', addError);
        return false;
      }
    } else {
      console.warn('Network switch to Robinhood Chain skipped/rejected:', switchError);
      return false;
    }
  }
}

/**
 * Mobile Deep Link Generators
 */
export function getMetaMaskDeepLink(url?: string): string {
  const target = url || (typeof window !== 'undefined' ? window.location.href.replace(/^https?:\/\//, '') : '');
  return `https://metamask.app.link/dapp/${target}`;
}

export function getCoinbaseDeepLink(url?: string): string {
  const target = url || (typeof window !== 'undefined' ? window.location.href : '');
  return `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(target)}`;
}

export function getOKXDeepLink(url?: string): string {
  const target = url || (typeof window !== 'undefined' ? window.location.href : '');
  return `okx://wallet/dapp/details?dappUrl=${encodeURIComponent(target)}`;
}

export function getPhantomDeepLink(url?: string): string {
  const target = url || (typeof window !== 'undefined' ? window.location.href : '');
  return `https://phantom.app/ul/browse/${encodeURIComponent(target)}?ref=${encodeURIComponent(target)}`;
}

export function getTrustDeepLink(url?: string): string {
  const target = url || (typeof window !== 'undefined' ? window.location.href : '');
  return `https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(target)}`;
}
