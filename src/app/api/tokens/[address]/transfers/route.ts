import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@/lib/utils/format';
import { fetchTokenTransfers } from '@/lib/api/blockscout';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ address: string }> | { address: string } }
) {
  try {
    const params = await Promise.resolve(context.params);
    const address = params.address;

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid address format', items: [] }, { status: 400 });
    }

    const data = await fetchTokenTransfers(address);
    const rawItems = data?.items || [];

    const items = rawItems.map((tx: any) => ({
      hash: tx.transaction_hash || tx.hash || '',
      from: tx.from?.hash || '',
      to: tx.to?.hash || '',
      amount: tx.total?.value || tx.value || '0',
      timestamp: tx.timestamp || '',
      blockNumber: tx.block_number || tx.block || 0,
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error in /api/tokens/[address]/transfers:', error);
    return NextResponse.json({ items: [] });
  }
}
