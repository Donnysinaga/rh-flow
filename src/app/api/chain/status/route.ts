import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
// import { networkConfig } from '@/config/network'; // Adjust import based on actual file struct

const RPC_URL = 'https://rpc-robinhood.blockmachine.io';

export async function GET(request: NextRequest) {
  try {
    const start = Date.now();
    
    const rpcResponse = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1,
      }),
      cache: 'no-store'
    });
    
    let blockNumber = null;
    let rpcStatus = 'OFFLINE';
    
    if (rpcResponse.ok) {
      const data = await rpcResponse.json();
      if (data.result) {
        blockNumber = parseInt(data.result, 16);
        rpcStatus = 'ONLINE';
      }
    }
    
    const rpcLatencyMs = Date.now() - start;
    
    let indexerStatus = 'OFFLINE';
    try {
      const dataDir = path.join(process.cwd(), 'data');
      const statePath = path.join(dataDir, 'indexer-state.json');
      if (fs.existsSync(statePath)) {
        const stateStr = fs.readFileSync(statePath, 'utf8');
        const state = JSON.parse(stateStr);
        if (state.status) {
          indexerStatus = state.status;
        }
      }
    } catch (e) {
      console.error('Error reading indexer state:', e);
    }
    
    return NextResponse.json({
      blockNumber,
      rpcLatencyMs,
      rpcStatus,
      indexerStatus,
      chainId: 4663,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10'
      }
    });
    
  } catch (error) {
    console.error('Error fetching chain status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
