import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@/lib/utils/format';
import { fetchAddressTransactions } from '@/lib/api/blockscout';

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

    const data = await fetchAddressTransactions(address);
    const rawItems = data?.items || [];

    const items = rawItems.map((tx: any) => {
      let ethVal = '0';
      try {
        if (tx.value) {
          const valNum = parseFloat(tx.value) / 1e18;
          ethVal = valNum > 0 ? valNum.toFixed(4) : '0';
        }
      } catch {
        ethVal = '0';
      }

      return {
        hash: tx.hash,
        from: tx.from?.hash || '',
        to: tx.to?.hash || '',
        value: ethVal,
        timestamp: tx.timestamp || '',
        block: tx.block_number || tx.block || 0,
        status: tx.status || 'ok',
        method: tx.method || null,
      };
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error in /api/address/[address]/transactions:', error);
    return NextResponse.json({ items: [] });
  }
}
