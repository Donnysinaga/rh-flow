import { createPublicClient, http, parseAbi } from 'viem';
// Assuming client, contracts and network config files will exist or we define fallback here
// Since user hasn't created them, we will use viem directly with hardcoded default chain for now or assume imports exist.
// Based on user prompt: Import public client from web3/client.ts, Import ABIs from config/contracts.ts, Import addresses from config/network.ts
import { publicClient } from '../web3/client';
import { DEX_FACTORY_ABI, DEX_PAIR_ABI, ERC20_ABI } from '../../config/contracts';
import { DEX_FACTORY_ADDRESS } from '../../config/network';

export async function getFactoryPairsCount(): Promise<bigint | null> {
  try {
    const data = await publicClient.readContract({
      address: DEX_FACTORY_ADDRESS as `0x${string}`,
      abi: DEX_FACTORY_ABI,
      functionName: 'allPairsLength',
    });
    return data as bigint;
  } catch (error) {
    console.error('Error fetching factory pairs count:', error);
    return null;
  }
}

export async function getPairAddress(tokenA: string, tokenB: string): Promise<string | null> {
  try {
    const data = await publicClient.readContract({
      address: DEX_FACTORY_ADDRESS as `0x${string}`,
      abi: DEX_FACTORY_ABI,
      functionName: 'getPair',
      args: [tokenA, tokenB],
    });
    return data as string;
  } catch (error) {
    console.error('Error fetching pair address:', error);
    return null;
  }
}

export async function getPairReserves(pairAddress: string): Promise<[bigint, bigint, number] | null> {
  try {
    const data = await publicClient.readContract({
      address: pairAddress as `0x${string}`,
      abi: DEX_PAIR_ABI,
      functionName: 'getReserves',
    });
    return data as [bigint, bigint, number];
  } catch (error) {
    console.error('Error fetching pair reserves:', error);
    return null;
  }
}

export async function getPairTokens(pairAddress: string): Promise<[string, string] | null> {
  try {
    const [token0, token1] = await Promise.all([
      publicClient.readContract({
        address: pairAddress as `0x${string}`,
        abi: DEX_PAIR_ABI,
        functionName: 'token0',
      }),
      publicClient.readContract({
        address: pairAddress as `0x${string}`,
        abi: DEX_PAIR_ABI,
        functionName: 'token1',
      })
    ]);
    return [token0 as string, token1 as string];
  } catch (error) {
    console.error('Error fetching pair tokens:', error);
    return null;
  }
}

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
}

export async function getTokenInfo(address: string): Promise<TokenInfo | null> {
  try {
    const contract = {
      address: address as `0x${string}`,
      abi: ERC20_ABI,
    };
    
    const results = await publicClient.multicall({
      contracts: [
        { ...contract, functionName: 'name' },
        { ...contract, functionName: 'symbol' },
        { ...contract, functionName: 'decimals' },
        { ...contract, functionName: 'totalSupply' },
      ],
    });
    
    if (results.some(r => r.status === 'failure')) return null;

    return {
      name: results[0].result as string,
      symbol: results[1].result as string,
      decimals: results[2].result as number,
      totalSupply: results[3].result as bigint,
    };
  } catch (error) {
    console.error('Error fetching token info:', error);
    return null;
  }
}

export async function getLatestBlock(): Promise<bigint | null> {
  try {
    return await publicClient.getBlockNumber();
  } catch (error) {
    console.error('Error fetching latest block:', error);
    return null;
  }
}

export async function getEthBalance(address: string): Promise<bigint | null> {
  try {
    return await publicClient.getBalance({ address: address as `0x${string}` });
  } catch (error) {
    console.error('Error fetching ETH balance:', error);
    return null;
  }
}

export async function getRecentSwapEvents(pairAddress: string, fromBlock: bigint, toBlock: bigint): Promise<any[] | null> {
  try {
    const logs = await publicClient.getLogs({
      address: pairAddress as `0x${string}`,
      event: parseAbi(['event Swap(address indexed sender, uint amount0In, uint amount1In, uint amount0Out, uint amount1Out, address indexed to)'])[0],
      fromBlock,
      toBlock,
    });
    return logs;
  } catch (error) {
    console.error('Error fetching recent swap events:', error);
    return null;
  }
}
