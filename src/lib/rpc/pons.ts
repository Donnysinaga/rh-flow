import { parseAbiItem, formatEther, formatUnits } from 'viem';
import { publicClient } from '../web3/client';
import {
  PONS_V2_FACTORY_ADDRESS,
  PONS_BUYBACK_VAULT_ADDRESS,
  PONS_FEE_ESCROW_ADDRESS,
  PONS_MEME_HOOK_ADDRESS,
} from '../../config/network';
import {
  PONS_V2_FACTORY_ABI,
  PONS_V2_CURVE_ABI,
  PONS_V2_TOKEN_ABI,
  PONS_V2_BUYBACK_VAULT_ABI,
  PONS_V2_FEE_ESCROW_ABI,
} from '../../config/contracts';

export interface PonsSocials {
  twitter: string;
  telegram: string;
  discord: string;
  website: string;
  farcaster: string;
}

export interface PonsTokenMetadata {
  tokenDeployer: string;
  tokenLogo: string;
  tokenDescription: string;
  tokenSocials: PonsSocials;
}

export interface PonsCurveState {
  quoteReserve: string;
  tokenReserve: string;
  realQuoteReserve: string;
  graduationThreshold: string;
  sellableTokens: string;
  readyToGraduate: boolean;
  graduated: boolean;
  feeBps: number;
  creatorTaxBps: number;
  buybackEnabled: boolean;
  progressPercent: number;
  currentPriceEth: number;
}

export interface PonsLaunchDetails {
  tokenAddress: string;
  curveAddress: string;
  deployer: string;
  creatorFeeRecipient: string;
  pairToken: string;
  graduationThreshold: string;
  poolFee: number;
  tickSpacing: number;
  creatorTaxBps: number;
  buybackEnabled: boolean;
  phase: number; // 0: NotGraduated, 1: Swept, 2: PoolCreated, 3: Rescued
  phaseLabel: string;
  sweptQuote: string;
  sweptTokens: string;
  sweptAt: number;
  exists: boolean;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  metadata?: PonsTokenMetadata;
  curve?: PonsCurveState;
}

export interface PonsLaunchLog {
  tokenAddress: string;
  curveAddress: string;
  deployer: string;
  pairToken: string;
  launchConfigId: bigint;
  graduationThreshold: bigint;
  blockNumber: bigint;
  transactionHash: string;
}

const TokenLaunchedEvent = parseAbiItem(
  'event TokenLaunched(address indexed token, address indexed curve, address indexed deployer, address pairToken, uint256 launchConfigId, uint256 graduationThreshold)'
);

/**
 * Format IPFS URI into HTTP URL
 */
export function formatIpfsUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  return url;
}

/**
 * Get detailed Pons v2 Token status directly from Robinhood Chain contracts
 */
export async function getPonsTokenDetails(tokenAddress: string): Promise<PonsLaunchDetails | null> {
  try {
    const launch = await publicClient.readContract({
      address: PONS_V2_FACTORY_ADDRESS as `0x${string}`,
      abi: PONS_V2_FACTORY_ABI,
      functionName: 'getLaunchedToken',
      args: [tokenAddress as `0x${string}`],
    });

    if (!launch || !launch.exists) {
      return null;
    }

    const phaseLabels = ['NotGraduated (Bonding Curve)', 'Swept (Graduating)', 'PoolCreated (Uniswap v4)', 'Rescued'];
    const phaseLabel = phaseLabels[launch.phase] || 'Unknown';

    // Query Token Metadata & ERC-20 attributes
    const [name, symbol, decimals, totalSupply, logoRes, descRes, socialsRes, tokenInfoResult] = await Promise.all([
      publicClient.readContract({ address: tokenAddress as `0x${string}`, abi: PONS_V2_TOKEN_ABI, functionName: 'name' }).catch(() => 'Unknown'),
      publicClient.readContract({ address: tokenAddress as `0x${string}`, abi: PONS_V2_TOKEN_ABI, functionName: 'symbol' }).catch(() => 'UNKNOWN'),
      publicClient.readContract({ address: tokenAddress as `0x${string}`, abi: PONS_V2_TOKEN_ABI, functionName: 'decimals' }).catch(() => 18),
      publicClient.readContract({ address: tokenAddress as `0x${string}`, abi: PONS_V2_TOKEN_ABI, functionName: 'totalSupply' }).catch(() => BigInt(0)),
      publicClient.readContract({ address: tokenAddress as `0x${string}`, abi: PONS_V2_TOKEN_ABI, functionName: 'logo' }).catch(() => ''),
      publicClient.readContract({ address: tokenAddress as `0x${string}`, abi: PONS_V2_TOKEN_ABI, functionName: 'description' }).catch(() => ''),
      publicClient.readContract({ address: tokenAddress as `0x${string}`, abi: PONS_V2_TOKEN_ABI, functionName: 'socials' }).catch(() => null),
      publicClient.readContract({ address: tokenAddress as `0x${string}`, abi: PONS_V2_TOKEN_ABI, functionName: 'getTokenInfo' }).catch(() => null),
    ]);

    let metadata: PonsTokenMetadata | undefined = undefined;
    
    // Extract logo & description (from direct getters or tokenInfoResult fallback)
    let rawLogo = (logoRes as string) || '';
    let rawDesc = (descRes as string) || '';
    let twitter = '';
    let telegram = '';
    let discord = '';
    let website = '';
    let farcaster = '';

    if (Array.isArray(socialsRes)) {
      twitter = socialsRes[0] || '';
      telegram = socialsRes[1] || '';
      discord = socialsRes[2] || '';
      website = socialsRes[3] || '';
      farcaster = socialsRes[4] || '';
    } else if (socialsRes && typeof socialsRes === 'object') {
      twitter = (socialsRes as any).twitter || '';
      telegram = (socialsRes as any).telegram || '';
      discord = (socialsRes as any).discord || '';
      website = (socialsRes as any).website || '';
      farcaster = (socialsRes as any).farcaster || '';
    }

    if (tokenInfoResult && Array.isArray(tokenInfoResult)) {
      const [deployer, infoLogo, infoDesc, infoSocials] = tokenInfoResult;
      if (!rawLogo && infoLogo) rawLogo = infoLogo;
      if (!rawDesc && infoDesc) rawDesc = infoDesc;
      if (!twitter && infoSocials?.twitter) twitter = infoSocials.twitter;
      if (!telegram && infoSocials?.telegram) telegram = infoSocials.telegram;
      if (!discord && infoSocials?.discord) discord = infoSocials.discord;
      if (!website && infoSocials?.website) website = infoSocials.website;
      if (!farcaster && infoSocials?.farcaster) farcaster = infoSocials.farcaster;
    }

    metadata = {
      tokenDeployer: launch.deployer,
      tokenLogo: formatIpfsUrl(rawLogo),
      tokenDescription: rawDesc,
      tokenSocials: {
        twitter,
        telegram,
        discord,
        website,
        farcaster,
      },
    };

    // Query Curve state if curve address exists
    let curve: PonsCurveState | undefined = undefined;
    if (launch.curve && launch.curve !== '0x0000000000000000000000000000000000000000') {
      try {
        const [reserves, realQuote, sellable, feeBps, creatorTaxBps, ready, graduated] = await Promise.all([
          publicClient.readContract({ address: launch.curve as `0x${string}`, abi: PONS_V2_CURVE_ABI, functionName: 'getReserves' }),
          publicClient.readContract({ address: launch.curve as `0x${string}`, abi: PONS_V2_CURVE_ABI, functionName: 'realQuoteReserve' }),
          publicClient.readContract({ address: launch.curve as `0x${string}`, abi: PONS_V2_CURVE_ABI, functionName: 'sellableTokens' }),
          publicClient.readContract({ address: launch.curve as `0x${string}`, abi: PONS_V2_CURVE_ABI, functionName: 'feeBps' }),
          publicClient.readContract({ address: launch.curve as `0x${string}`, abi: PONS_V2_CURVE_ABI, functionName: 'creatorTaxBps' }),
          publicClient.readContract({ address: launch.curve as `0x${string}`, abi: PONS_V2_CURVE_ABI, functionName: 'readyToGraduate' }),
          publicClient.readContract({ address: launch.curve as `0x${string}`, abi: PONS_V2_CURVE_ABI, functionName: 'graduated' }),
        ]);

        const [quoteReserve, tokenReserve] = reserves;
        const progressPercent = launch.graduationThreshold > BigInt(0)
          ? Math.min(100, Math.max(0, (Number(realQuote) / Number(launch.graduationThreshold)) * 100))
          : 0;

        const currentPriceEth = Number(tokenReserve) > 0
          ? Number(quoteReserve) / Number(tokenReserve)
          : 0;

        curve = {
          quoteReserve: quoteReserve.toString(),
          tokenReserve: tokenReserve.toString(),
          realQuoteReserve: formatEther(realQuote),
          graduationThreshold: formatEther(launch.graduationThreshold),
          sellableTokens: formatUnits(sellable, decimals),
          readyToGraduate: ready,
          graduated: graduated,
          feeBps: Number(feeBps),
          creatorTaxBps: Number(creatorTaxBps),
          buybackEnabled: launch.buybackEnabled,
          progressPercent,
          currentPriceEth,
        };
      } catch (err) {
        console.error('Error reading Pons curve state:', err);
      }
    }

    return {
      tokenAddress,
      curveAddress: launch.curve,
      deployer: launch.deployer,
      creatorFeeRecipient: launch.creatorFeeRecipient,
      pairToken: launch.pairToken,
      graduationThreshold: formatEther(launch.graduationThreshold),
      poolFee: launch.poolFee,
      tickSpacing: launch.tickSpacing,
      creatorTaxBps: launch.creatorTaxBps,
      buybackEnabled: launch.buybackEnabled,
      phase: launch.phase,
      phaseLabel,
      sweptQuote: formatEther(launch.sweptQuote),
      sweptTokens: formatUnits(launch.sweptTokens, decimals),
      sweptAt: Number(launch.sweptAt),
      exists: launch.exists,
      name,
      symbol,
      decimals,
      totalSupply: formatUnits(totalSupply, decimals),
      metadata,
      curve,
    };
  } catch (error) {
    console.error('Error in getPonsTokenDetails:', error);
    return null;
  }
}

/**
 * Scan recent Pons v2 token launches from blockchain logs
 */
export async function getRecentPonsLaunches(blocksToScan: bigint = BigInt(30000)): Promise<PonsLaunchLog[]> {
  try {
    const currentBlock = await publicClient.getBlockNumber();
    const fromBlock = currentBlock > blocksToScan ? currentBlock - blocksToScan : BigInt(0);

    // Scan in 5000-block chunks to comply with RPC max block range limits
    const CHUNK_SIZE = BigInt(5000);
    const logs: any[] = [];

    for (let from = fromBlock; from <= currentBlock; from += CHUNK_SIZE) {
      const to = from + CHUNK_SIZE - BigInt(1) > currentBlock ? currentBlock : from + CHUNK_SIZE - BigInt(1);
      try {
        const chunkLogs = await publicClient.getLogs({
          address: PONS_V2_FACTORY_ADDRESS as `0x${string}`,
          event: TokenLaunchedEvent,
          fromBlock: from,
          toBlock: to,
        });
        if (chunkLogs.length > 0) {
          logs.push(...chunkLogs);
        }
      } catch (err) {
        // Silently continue scanning next chunk
      }
    }

    return logs.map(log => ({
      tokenAddress: log.args.token as string,
      curveAddress: log.args.curve as string,
      deployer: log.args.deployer as string,
      pairToken: log.args.pairToken as string,
      launchConfigId: log.args.launchConfigId as bigint,
      graduationThreshold: log.args.graduationThreshold as bigint,
      blockNumber: log.blockNumber,
      transactionHash: log.transactionHash,
    }));
  } catch (error) {
    console.error('Error scanning Pons launches:', error);
    return [];
  }
}

/**
 * Read Buyback Vault state for a token (5-year linear vesting)
 */
export async function getPonsBuybackVault(tokenAddress: string) {
  try {
    const [totalLocked, totalReleased, vestedAmount, releasable, vestingStart, duration] = await Promise.all([
      publicClient.readContract({ address: PONS_BUYBACK_VAULT_ADDRESS as `0x${string}`, abi: PONS_V2_BUYBACK_VAULT_ABI, functionName: 'totalLocked', args: [tokenAddress as `0x${string}`] }),
      publicClient.readContract({ address: PONS_BUYBACK_VAULT_ADDRESS as `0x${string}`, abi: PONS_V2_BUYBACK_VAULT_ABI, functionName: 'totalReleased', args: [tokenAddress as `0x${string}`] }),
      publicClient.readContract({ address: PONS_BUYBACK_VAULT_ADDRESS as `0x${string}`, abi: PONS_V2_BUYBACK_VAULT_ABI, functionName: 'vestedAmount', args: [tokenAddress as `0x${string}`] }),
      publicClient.readContract({ address: PONS_BUYBACK_VAULT_ADDRESS as `0x${string}`, abi: PONS_V2_BUYBACK_VAULT_ABI, functionName: 'releasable', args: [tokenAddress as `0x${string}`] }),
      publicClient.readContract({ address: PONS_BUYBACK_VAULT_ADDRESS as `0x${string}`, abi: PONS_V2_BUYBACK_VAULT_ABI, functionName: 'vestingStart', args: [tokenAddress as `0x${string}`] }),
      publicClient.readContract({ address: PONS_BUYBACK_VAULT_ADDRESS as `0x${string}`, abi: PONS_V2_BUYBACK_VAULT_ABI, functionName: 'VESTING_DURATION' }),
    ]);

    return {
      totalLocked: formatEther(totalLocked),
      totalReleased: formatEther(totalReleased),
      vestedAmount: formatEther(vestedAmount),
      releasable: formatEther(releasable),
      vestingStart: Number(vestingStart),
      vestingDurationSeconds: Number(duration),
    };
  } catch (err) {
    return null;
  }
}

/**
 * Read Fee Escrow balances for a recipient
 */
export async function getPonsFeeEscrow(recipientAddress: string, tokenAddress?: string) {
  try {
    const ethBalance = await publicClient.readContract({
      address: PONS_FEE_ESCROW_ADDRESS as `0x${string}`,
      abi: PONS_V2_FEE_ESCROW_ABI,
      functionName: 'balanceOf',
      args: [recipientAddress as `0x${string}`],
    });

    let tokenBalance = BigInt(0);
    if (tokenAddress) {
      tokenBalance = await publicClient.readContract({
        address: PONS_FEE_ESCROW_ADDRESS as `0x${string}`,
        abi: PONS_V2_FEE_ESCROW_ABI,
        functionName: 'balanceOfToken',
        args: [recipientAddress as `0x${string}`, tokenAddress as `0x${string}`],
      });
    }

    return {
      ethBalance: formatEther(ethBalance),
      tokenBalance: formatEther(tokenBalance),
    };
  } catch (err) {
    return null;
  }
}

