import { IndexerState, getStatus } from './state';
import { keccak256, toHex, hexToNumber } from 'viem';

export interface ProcessedEvent {
  type: 'pair_created' | 'swap' | 'token_launched';
  blockNumber: number;
  transactionHash: string;
  timestamp?: string;
  data: Record<string, any>;
}

const RPC_URL = 'https://rpc-robinhood.blockmachine.io';
const FACTORY_ADDRESS = '0x8bcEaA40B9AcdfAedF85AdF4FF01F5Ad6517937f';
const PONS_FACTORY = '0x7ed598bcef8bd9edd8c97a195c6d13f40801ec7e';

const PAIR_CREATED_TOPIC = '0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9';
const SWAP_TOPIC = '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822';
const TOKEN_LAUNCHED_TOPIC = keccak256(new TextEncoder().encode('TokenLaunched(address,address,uint256)'));

async function rpcCall(method: string, params: any[] = []) {
  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  
  if (!response.ok) {
    throw new Error(`RPC error: ${response.statusText}`);
  }
  
  const data = await response.json();
  if (data.error) {
    throw new Error(`RPC error: ${data.error.message}`);
  }
  
  return data.result;
}

export async function getHeadBlock(): Promise<number> {
  const hexBlock = await rpcCall('eth_blockNumber');
  return hexToNumber(hexBlock);
}

export async function getBlockLogs(fromBlock: number, toBlock: number): Promise<any[]> {
  const fromHex = toHex(fromBlock);
  const toHexBlock = toHex(toBlock);
  
  return rpcCall('eth_getLogs', [{
    fromBlock: fromHex,
    toBlock: toHexBlock,
    address: [FACTORY_ADDRESS, PONS_FACTORY]
  }]);
}

export async function processBlocks(state: IndexerState): Promise<{ state: IndexerState; events: ProcessedEvent[] }> {
  const newState = { ...state };
  const events: ProcessedEvent[] = [];
  
  try {
    const headBlock = await getHeadBlock();
    newState.rpcHeadBlock = headBlock;
    
    let startBlock = newState.latestIndexedBlock === 0 ? headBlock - 10 : newState.latestIndexedBlock + 1;
    if (startBlock > headBlock) {
      startBlock = headBlock;
    }
    
    // Max 50 blocks
    let endBlock = Math.min(startBlock + 49, headBlock);
    
    if (startBlock <= endBlock && headBlock > 0) {
      const logs = await getBlockLogs(startBlock, endBlock);
      
      for (const log of logs) {
        const topic0 = log.topics[0];
        const blockNum = hexToNumber(log.blockNumber);
        
        let type: ProcessedEvent['type'] | null = null;
        if (topic0 === PAIR_CREATED_TOPIC) type = 'pair_created';
        else if (topic0 === SWAP_TOPIC) type = 'swap';
        else if (topic0 === TOKEN_LAUNCHED_TOPIC) type = 'token_launched';
        
        if (type) {
          events.push({
            type,
            blockNumber: blockNum,
            transactionHash: log.transactionHash,
            timestamp: new Date().toISOString(),
            data: log
          });
        }
      }
      
      newState.latestIndexedBlock = endBlock;
      newState.processedBlocks += (endBlock - startBlock + 1);
    }
    
    newState.blockLag = Math.max(0, headBlock - newState.latestIndexedBlock);
    newState.lastSuccessfulSync = new Date().toISOString();
    newState.errors = 0;
    
  } catch (error) {
    console.error('Error processing blocks:', error);
    newState.errors += 1;
  }
  
  newState.status = getStatus(newState);
  return { state: newState, events };
}
