import { parseAbiItem } from 'viem';
import { publicClient } from '../web3/client';
import { PONS_V2_FACTORY_ADDRESS } from '../../config/network';

export interface PonsLaunchData {
  tokenAddress: string;
  creator: string;
  amount: bigint;
  timestamp: bigint;
  transactionHash: string;
}

const TokenLaunchedEvent = parseAbiItem(
  'event TokenLaunched(address indexed token, address indexed creator, uint256 amount, uint256 timestamp)'
);

export async function getRecentPonsLaunches(fromBlock: bigint, toBlock: 'latest' | bigint = 'latest'): Promise<PonsLaunchData[] | null> {
  try {
    const logs = await publicClient.getLogs({
      address: PONS_V2_FACTORY_ADDRESS as `0x${string}`,
      event: TokenLaunchedEvent,
      fromBlock,
      toBlock,
    });

    return logs.map(log => {
      const { args, transactionHash } = log;
      return {
        tokenAddress: args.token as string,
        creator: args.creator as string,
        amount: args.amount as bigint,
        timestamp: args.timestamp as bigint,
        transactionHash: transactionHash as string,
      };
    });
  } catch (error) {
    console.error('Error fetching recent PONS launches:', error);
    return null;
  }
}
