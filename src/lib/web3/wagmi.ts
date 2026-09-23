import { http, createConfig } from 'wagmi';
import { injected, coinbaseWallet } from 'wagmi/connectors';
import { robinhoodChain } from './chains';
import { ROBINHOOD_CHAIN } from '../../config/network';

export const wagmiConfig = createConfig({
  chains: [robinhoodChain],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
    coinbaseWallet({
      appName: 'RH FLOW',
    }),
  ],
  transports: {
    [robinhoodChain.id]: http(ROBINHOOD_CHAIN.rpcUrls.primary),
  },
});
