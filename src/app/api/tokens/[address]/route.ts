import { NextRequest, NextResponse } from 'next/server';

const BLOCKSCOUT_API = 'https://robinhoodchain.blockscout.com/api/v2';
const RPC_URL = 'https://rpc-robinhood.blockmachine.io';
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const DEX_FACTORY = '0x8bcEaA40B9AcdfAedF85AdF4FF01F5Ad6517937f';
const WETH = '0x0bd7d308f8e1639fab988df18a8011f41eacad73';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    
    if (!ADDRESS_REGEX.test(address)) {
      return NextResponse.json({ error: 'Invalid address format' }, { status: 400 });
    }
    
    // Fetch token details from Blockscout
    const bsResponse = await fetch(`${BLOCKSCOUT_API}/tokens/${address}`, {
      next: { revalidate: 30 }
    });
    
    let tokenData = null;
    if (bsResponse.ok) {
      tokenData = await bsResponse.json();
    }
    
    // Attempt to fetch pair info from UniswapV2Factory (getPair function: 0xe6a43905)
    // padding token and WETH addresses to 32 bytes
    const paddedToken = address.replace('0x', '').padStart(64, '0');
    const paddedWeth = WETH.replace('0x', '').padStart(64, '0');
    const rpcData = `0xe6a43905${paddedToken}${paddedWeth}`;
    
    let pairAddress = null;
    try {
      const rpcResponse = await fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{ to: DEX_FACTORY, data: rpcData }, 'latest'],
          id: 1
        })
      });
      if (rpcResponse.ok) {
        const json = await rpcResponse.json();
        if (json.result && json.result !== '0x' && json.result.length === 66) {
          const extractedAddress = '0x' + json.result.slice(26);
          if (extractedAddress !== '0x0000000000000000000000000000000000000000') {
            pairAddress = extractedAddress;
          }
        }
      }
    } catch (e) {
      console.error('Error fetching pair info via RPC:', e);
    }

    if (!tokenData) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...tokenData,
      dexPairAddress: pairAddress
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
      }
    });
  } catch (error) {
    console.error('Error fetching token details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
