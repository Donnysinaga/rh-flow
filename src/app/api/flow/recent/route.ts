import { NextResponse } from 'next/server';
import { publicClient } from '@/lib/web3/client';
import { fetchRecentTransactions } from '@/lib/api/blockscout';
import { formatEther } from 'viem';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Try to fetch from block explorer first
    const rawData: any = await fetchRecentTransactions().catch(() => null);

    if (rawData && ((Array.isArray(rawData) && rawData.length > 0) || (rawData.items && rawData.items.length > 0))) {
      const items = Array.isArray(rawData) ? rawData : rawData.items;
      const flowItems = items.map((tx: any) => {
        const isContract = tx.to?.is_contract;
        let flowType = 'TRANSFER';
        const method = tx.method || '';
        const methodLower = method.toLowerCase();

        if (methodLower.includes('swap')) {
          flowType = 'SWAP';
        } else if (methodLower.includes('approve') || method === 'permit2TransferAndMulticall') {
          flowType = 'APPROVE';
        } else if (isContract) {
          flowType = 'CALL';
        }

        return {
          hash: tx.hash,
          from: tx.from?.hash || '',
          to: tx.to?.hash || '',
          value: tx.value || '0',
          timestamp: tx.timestamp,
          block: tx.block_number || tx.block || 0,
          method: method || (isContract ? 'Contract Call' : 'Transfer'),
          type: flowType,
          gasUsed: tx.gas_used,
          status: tx.status || 'ok',
          exchangeRate: tx.exchange_rate,
        };
      });

      return NextResponse.json({
        items: flowItems,
        status: 'LIVE',
      });
    }

    // 2. Direct on-chain RPC fallback: Query latest blocks directly from node sequencer
    const latestBlock = await publicClient.getBlock({ includeTransactions: true });
    const blockTxs = (latestBlock.transactions || []).map((tx: any) => {
      let flowType = 'TRANSFER';
      const input = tx.input || '0x';
      let method = 'Transfer';

      if (input.startsWith('0x38ed1739') || input.startsWith('0x7ff36ab5') || input.startsWith('0x18cbafe5') || input.startsWith('0xa9059cbb')) {
        if (input.startsWith('0xa9059cbb')) {
          flowType = 'TRANSFER';
          method = 'transfer(address,uint256)';
        } else if (input.startsWith('0x095ea7b3')) {
          flowType = 'APPROVE';
          method = 'approve(address,uint256)';
        } else {
          flowType = 'SWAP';
          method = 'Swap';
        }
      } else if (input.length > 10) {
        flowType = 'CALL';
        method = input.slice(0, 10);
      }

      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to || '',
        value: tx.value ? tx.value.toString() : '0',
        timestamp: new Date(Number(latestBlock.timestamp) * 1000).toISOString(),
        block: Number(latestBlock.number),
        method,
        type: flowType,
        gasUsed: tx.gas ? tx.gas.toString() : undefined,
        status: 'ok',
      };
    });

    return NextResponse.json({
      items: blockTxs,
      status: 'LIVE',
    });
  } catch (error) {
    console.error('Error in /api/flow/recent:', error);
    return NextResponse.json({
      items: [],
      status: 'DEGRADED',
      error: 'Robinhood Chain RPC error',
    }, { status: 200 });
  }
}

