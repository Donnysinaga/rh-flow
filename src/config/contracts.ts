import { parseAbi } from 'viem';

export const UNISWAP_V2_FACTORY_ABI = parseAbi([
  'function allPairsLength() external view returns (uint256)',
  'function allPairs(uint256) external view returns (address)',
  'function getPair(address, address) external view returns (address)',
  'function feeTo() external view returns (address)',
]);

export const UNISWAP_V2_PAIR_ABI = parseAbi([
  'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
  'function token0() external view returns (address)',
  'function token1() external view returns (address)',
  'function totalSupply() external view returns (uint256)',
]);

export const UNISWAP_V2_ROUTER_ABI = parseAbi([
  'function WETH() external pure returns (address)',
  'function factory() external pure returns (address)',
  'function getAmountsOut(uint256 amountIn, address[] memory path) external view returns (uint256[] memory amounts)',
]);

export const ERC20_ABI = parseAbi([
  'function name() external view returns (string)',
  'function symbol() external view returns (string)',
  'function decimals() external view returns (uint8)',
  'function totalSupply() external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
]);

export const PONS_V2_FACTORY_ABI = parseAbi([
  'event TokenLaunched(address indexed token, address indexed creator, uint256 timestamp)',
]);
