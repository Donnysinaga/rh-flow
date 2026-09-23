export const ROBINHOOD_CHAIN = {
  id: 4663,
  name: 'Robinhood Chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    primary: 'https://rpc-robinhood.blockmachine.io',
    fallback: 'https://robinhood.rpc.blxrbdn.com',
  },
  blockExplorers: {
    robinscan: 'https://robinscan.io',
    blockscout: 'https://robinhoodchain.blockscout.com',
  },
  contracts: {
    factory: '0x8bcEaA40B9AcdfAedF85AdF4FF01F5Ad6517937f' as `0x${string}`,
    router: '0x07E9002B1549bE8E5A4f94AD0c9CA586Cf7078a6' as `0x${string}`,
    weth: '0x0bd7d308f8e1639fab988df18a8011f41eacad73' as `0x${string}`,
    ponsFactory: '0x7ed598bcef8bd9edd8c97a195c6d13f40801ec7e' as `0x${string}`,
    ponsRouter: '0xe33e9e479df8802cb0866d5d05258bec4cf62948' as `0x${string}`,
  },
} as const;

export const BLOCKSCOUT_API = 'https://robinhoodchain.blockscout.com/api/v2';
