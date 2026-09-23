import { NextRequest, NextResponse } from 'next/server';

const BLOCKSCOUT_API = 'https://robinhoodchain.blockscout.com/api/v2';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sort = searchParams.get('sort') || 'market_cap';
    const type = searchParams.get('type') || 'ERC-20';
    
    const url = new URL(`${BLOCKSCOUT_API}/tokens`);
    url.searchParams.set('sort', sort);
    url.searchParams.set('type', type);
    
    const response = await fetch(url.toString(), {
      next: { revalidate: 30 }
    });
    
    if (!response.ok) {
      throw new Error(`Blockscout API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
      }
    });
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json(
      { error: 'Internal server error', items: [] },
      { status: 500 }
    );
  }
}
