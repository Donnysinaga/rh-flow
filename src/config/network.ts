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
    // Official Pons v2 Protocol Contracts (https://docs.ponsfamily.com/v2)
    ponsFactory: '0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e' as `0x${string}`,
    ponsMemeHook: '0xE5e702641Ea86F4ae6cC3cDaeD2B886f976Be044' as `0x${string}`,
    ponsFeeEscrow: '0xd3AFEB2a57f70eF218Aa82451c51B2fb0416Ac9e' as `0x${string}`,
    ponsBuybackVault: '0x42df2a798f82289E177311362e8f5ccC45c1219c' as `0x${string}`,
    ponsLaunchLocker: '0x267444D099b10fB5Ed7c3Cc7B7c767AdcA574952' as `0x${string}`,
    ponsLaunchAndBuy: '0xe33E9E479dF8802cb0866d5d05258bEc4cF62948' as `0x${string}`,
    ponsLaunchDeployer: '0x3711ceA4feaDE896C913C68F01Eda97Cb06D1A42' as `0x${string}`,
    ponsGraduationExecutor: '0xC7819B64A1dAECD7eC19856d026cb14EfBd89046' as `0x${string}`,
    ponsGraduationGuard: '0xf5695117b99B6f6401e67d4195BD653628176C6C' as `0x${string}`,
  },
} as const;

export const BLOCKSCOUT_API = 'https://robinhoodchain.blockscout.com/api/v2';
export const DEX_FACTORY_ADDRESS = ROBINHOOD_CHAIN.contracts.factory;
export const DEX_ROUTER_ADDRESS = ROBINHOOD_CHAIN.contracts.router;
export const WETH_ADDRESS = ROBINHOOD_CHAIN.contracts.weth;
export const PONS_FACTORY_ADDRESS = ROBINHOOD_CHAIN.contracts.ponsFactory;
export const PONS_V2_FACTORY_ADDRESS = ROBINHOOD_CHAIN.contracts.ponsFactory;
export const PONS_ROUTER_ADDRESS = ROBINHOOD_CHAIN.contracts.ponsLaunchAndBuy;
export const PONS_V2_ROUTER_ADDRESS = ROBINHOOD_CHAIN.contracts.ponsLaunchAndBuy;
export const PONS_MEME_HOOK_ADDRESS = ROBINHOOD_CHAIN.contracts.ponsMemeHook;
export const PONS_FEE_ESCROW_ADDRESS = ROBINHOOD_CHAIN.contracts.ponsFeeEscrow;
export const PONS_BUYBACK_VAULT_ADDRESS = ROBINHOOD_CHAIN.contracts.ponsBuybackVault;
export const PONS_LAUNCH_LOCKER_ADDRESS = ROBINHOOD_CHAIN.contracts.ponsLaunchLocker;

