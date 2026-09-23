import { defineChain } from 'viem';

export const robinhoodChain = defineChain({
  id: 4663,
  name: 'Robinhood Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-robinhood.blockmachine.io'],
    },
    public: {
      http: ['https://rpc-robinhood.blockmachine.io'],
    },
  },
  blockExplorers: {
    default: { name: 'Robinscan', url: 'https://robinscan.io' },
    blockscout: { name: 'Blockscout', url: 'https://robinhoodchain.blockscout.com' },
  },
});
