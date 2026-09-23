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
    
    const response = await fetch(`${BLOCKSCOUT_API}/addresses/${address}/transactions`, {
      next: { revalidate: 15 }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Transactions not found', items: [] }, { status: 404 });
      }
      throw new Error(`Blockscout API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30'
      }
    });
  } catch (error) {
    console.error('Error fetching address transactions:', error);
    return NextResponse.json({ error: 'Internal server error', items: [] }, { status: 500 });
  }
}
