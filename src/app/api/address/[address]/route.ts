import { NextRequest, NextResponse } from 'next/server';

const BLOCKSCOUT_API = 'https://robinhoodchain.blockscout.com/api/v2';
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    
    if (!ADDRESS_REGEX.test(address)) {
      return NextResponse.json({ error: 'Invalid address format' }, { status: 400 });
    }
    
    // Fetch address info
    const addressRes = await fetch(`${BLOCKSCOUT_API}/addresses/${address}`, {
      next: { revalidate: 15 }
    });
    
    let addressData = null;
    if (addressRes.ok) {
      addressData = await addressRes.json();
    } else if (addressRes.status === 404) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    } else {
      throw new Error(`Blockscout API error: ${addressRes.status}`);
    }
    
    // Fetch token balances
    const tokensRes = await fetch(`${BLOCKSCOUT_API}/addresses/${address}/token-balances`, {
      next: { revalidate: 15 }
    });
    
    let tokenBalances = [];
    if (tokensRes.ok) {
      tokenBalances = await tokensRes.json();
    }
    
    return NextResponse.json({
      ...addressData,
      tokenBalances
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30'
      }
    });
  } catch (error) {
    console.error('Error fetching address info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
