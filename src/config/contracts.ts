import { parseAbi } from 'viem';

export const UNISWAP_V2_FACTORY_ABI = parseAbi([
  'function allPairsLength() external view returns (uint256)',
  'function allPairs(uint256) external view returns (address)',
  'function getPair(address tokenA, address tokenB) external view returns (address pair)',
  'function feeTo() external view returns (address)',
]);

export const UNISWAP_V2_PAIR_ABI = parseAbi([
  'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
  'function token0() external view returns (address)',
  'function token1() external view returns (address)',
  'function totalSupply() external view returns (uint256)',
  'event Swap(address indexed sender, uint amount0In, uint amount1In, uint amount0Out, uint amount1Out, address indexed to)',
  'event Sync(uint112 reserve0, uint112 reserve1)',
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

// Official Pons v2 Protocol ABIs on Robinhood Chain
export const PONS_V2_FACTORY_ABI = parseAbi([
  'struct Socials { string twitter; string telegram; string discord; string website; string farcaster; }',
  'struct LaunchParams { string name; string symbol; string description; string logo; Socials socials; address creatorFeeRecipient; uint16 creatorTaxBps; bool buybackEnabled; bytes32 poolSalt; bytes32 tokenSalt; }',
  'struct LaunchConfig { uint256 supply; uint256 curveFeeBps; uint256 phantomQuote; uint256 graduationThreshold; uint24 poolFee; int24 tickSpacing; bool enabled; }',
  'struct LaunchedToken { address token; address curve; address deployer; address creatorFeeRecipient; address pairToken; uint256 graduationThreshold; uint24 poolFee; int24 tickSpacing; uint16 creatorTaxBps; bool buybackEnabled; uint8 phase; uint256 sweptQuote; uint256 sweptTokens; uint256 sweptAt; bool exists; }',
  'struct FeePolicy { address protocolFeeRecipient; uint16 protocolFeeShareBps; uint16 buybackBurnBps; uint16 hookFeeBps; uint16 maxInternalPriceImpactBps; }',
  'function launchToken(LaunchParams params, uint256 launchConfigId, address pairToken) payable returns (address token, address curve)',
  'function getLaunchedToken(address token) view returns (LaunchedToken)',
  'function getLaunchFeePolicy(address token) view returns (FeePolicy)',
  'function launchConfigCount() view returns (uint256)',
  'function getLaunchConfig(uint256 id) view returns (LaunchConfig)',
  'function approvedPairTokens(address pairToken) view returns (bool)',
  'function pairTokenEconomics(address pairToken) view returns (uint256 phantomQuote, uint256 graduationThreshold, uint8 decimals)',
  'function launchFee() view returns (uint256)',
  'function maxCreatorTaxBps() view returns (uint256)',
  'function previewLaunchEconomics(uint256 launchConfigId, address pairToken) view returns (bytes32)',
  'function pendingCreatorFeeRecipient(address token) view returns (address proposed, uint256 effectiveAt, uint256 expiresAt)',
  'event TokenLaunched(address indexed token, address indexed curve, address indexed deployer, address pairToken, uint256 launchConfigId, uint256 graduationThreshold)',
  'event LaunchSwept(address indexed token, address indexed curve, uint256 sweptQuote, uint256 sweptTokens)',
  'event PoolGraduated(address indexed token, address indexed pool, bytes32 poolId)',
  'event CreatorFeeRecipientUpdated(address indexed token, address indexed oldRecipient, address indexed newRecipient)',
]);

export const PONS_V2_CURVE_ABI = parseAbi([
  'function getReserves() view returns (uint256 quoteReserve, uint256 tokenReserve)',
  'function realQuoteReserve() view returns (uint256)',
  'function graduationThreshold() view returns (uint256)',
  'function sellableTokens() view returns (uint256)',
  'function readyToGraduate() view returns (bool)',
  'function graduated() view returns (bool)',
  'function feeBps() view returns (uint256)',
  'function creatorTaxBps() view returns (uint256)',
  'function buybackEnabled() view returns (bool)',
  'function currentSnipeTaxBps(address recipient) view returns (uint256)',
  'function isNativeQuote() view returns (bool)',
  'function pairToken() view returns (address)',
  'function buy(uint256 quoteIn, uint256 minTokensOut, address recipient) payable returns (uint256 tokensOut)',
  'function sell(uint256 tokensIn, uint256 minQuoteOut, address recipient) returns (uint256 quoteOut)',
  'event CurveBuy(address indexed buyer, address indexed recipient, uint256 quoteIn, uint256 tokensOut, uint256 fee, uint256 tax)',
  'event CurveSell(address indexed seller, address indexed recipient, uint256 tokensIn, uint256 quoteOut, uint256 fee, uint256 tax)',
  'event CurveBuyRefunded(address indexed buyer, uint256 refund)',
  'event CurveCompleted(uint256 quoteRaised, uint256 tokensSold)',
]);

export const PONS_V2_TOKEN_ABI = parseAbi([
  'struct Socials { string twitter; string telegram; string discord; string website; string farcaster; }',
  'function getTokenInfo() view returns (address tokenDeployer, string tokenLogo, string tokenDescription, Socials tokenSocials)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
]);

export const PONS_V2_BUYBACK_VAULT_ABI = parseAbi([
  'function totalLocked(address token) view returns (uint256)',
  'function totalReleased(address token) view returns (uint256)',
  'function vestedAmount(address token) view returns (uint256)',
  'function releasable(address token) view returns (uint256)',
  'function vestingStart(address token) view returns (uint256)',
  'function VESTING_DURATION() view returns (uint256)',
  'function release(address token) returns (uint256 released)',
]);

export const PONS_V2_FEE_ESCROW_ABI = parseAbi([
  'function balanceOf(address recipient) view returns (uint256)',
  'function balanceOfToken(address recipient, address token) view returns (uint256)',
  'function claim()',
  'function claimToken(address token)',
]);

export const PONS_V2_MEME_HOOK_ABI = parseAbi([
  'function pendingFees(bytes32 poolId, address currency) view returns (uint256)',
  'function pendingCreatorTax(bytes32 poolId, address currency) view returns (uint256)',
]);

// Aliases for compatibility
export const DEX_FACTORY_ABI = UNISWAP_V2_FACTORY_ABI;
export const DEX_PAIR_ABI = UNISWAP_V2_PAIR_ABI;
export const DEX_ROUTER_ABI = UNISWAP_V2_ROUTER_ABI;
