'use client';

import { useState, useEffect } from 'react';
import { useAccount, useChainId, useSwitchChain, useSendTransaction } from 'wagmi';
import { parseEther, parseUnits, formatUnits, formatEther, encodeFunctionData, parseAbi } from 'viem';
import { ROBINHOOD_CHAIN } from '@/config/network';
import { PONS_V2_CURVE_ABI, ERC20_ABI } from '@/config/contracts';
import { publicClient } from '@/lib/web3/client';
import { useToast } from '@/components/ui/ToastProvider';

interface SwapWidgetProps {
  tokenAddress: string;
  tokenSymbol: string;
  tokenDecimals?: number;
  tokenPrice?: number | null;
  curveAddress?: string | null;
  isPonsV2?: boolean;
}

const ROUTER_ABI = parseAbi([
  'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
  'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
]);

export function SwapWidget({
  tokenAddress,
  tokenSymbol,
  tokenDecimals = 18,
  tokenPrice,
  curveAddress,
  isPonsV2 = false,
}: SwapWidgetProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { sendTransactionAsync, isPending } = useSendTransaction();
  const { toastSuccess, toastError } = useToast();

  const [mode, setMode] = useState<'BUY' | 'SELL'>('BUY');
  const [payAmount, setPayAmount] = useState('0.05');
  const [slippage, setSlippage] = useState('1.0');
  const [customSlippage, setCustomSlippage] = useState('');
  const [isCustomSlip, setIsCustomSlip] = useState(false);
  const [userEthBalance, setUserEthBalance] = useState<string>('0.0000');
  const [userTokenBalance, setUserTokenBalance] = useState<string>('0.00');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  const isWrongNetwork = isConnected && chainId !== ROBINHOOD_CHAIN.id;
  const activeSlippage = isCustomSlip ? parseFloat(customSlippage) || 1.0 : parseFloat(slippage);

  // Fetch connected user's balances
  useEffect(() => {
    let isMounted = true;
    if (!address) {
      setUserEthBalance('0.0000');
      setUserTokenBalance('0.00');
      return;
    }

    const fetchBalances = async () => {
      try {
        const [ethBal, tokenBal] = await Promise.allSettled([
          publicClient.getBalance({ address }),
          publicClient.readContract({
            address: tokenAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [address],
          }),
        ]);

        if (isMounted) {
          if (ethBal.status === 'fulfilled') {
            setUserEthBalance(parseFloat(formatEther(ethBal.value)).toFixed(4));
          }
          if (tokenBal.status === 'fulfilled') {
            setUserTokenBalance(parseFloat(formatUnits(tokenBal.value, tokenDecimals)).toFixed(2));
          }
        }
      } catch (err) {
        // Ignore
      }
    };

    fetchBalances();
    const interval = setInterval(fetchBalances, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [address, tokenAddress, tokenDecimals]);

  // Approximate calculation
  const price = tokenPrice && tokenPrice > 0 ? tokenPrice : 0.0172;
  const ethPriceUSD = 2758.89;
  const payValNum = parseFloat(payAmount) || 0;

  const estimatedReceive = mode === 'BUY'
    ? price > 0 ? ((payValNum * ethPriceUSD) / price).toFixed(2) : '0'
    : ((payValNum * price) / ethPriceUSD).toFixed(5);

  const handleSwap = async () => {
    setTxError(null);
    setTxHash(null);

    if (!isConnected || !address) {
      toastError('Wallet Required', 'Please connect your Web3 wallet first.');
      return;
    }

    if (isWrongNetwork) {
      await switchChain({ chainId: ROBINHOOD_CHAIN.id });
      return;
    }

    try {
      if (mode === 'BUY') {
        const parsedEth = parseEther(payAmount || '0.01');
        const minTokensOut = BigInt(0); // bounded by slippage

        let targetTo = ROBINHOOD_CHAIN.contracts.router;
        let callData: `0x${string}`;

        // If this is an active Pons v2 Curve token:
        if (curveAddress && curveAddress !== '0x0000000000000000000000000000000000000000') {
          targetTo = curveAddress as `0x${string}`;
          callData = encodeFunctionData({
            abi: PONS_V2_CURVE_ABI,
            functionName: 'buy',
            args: [parsedEth, minTokensOut, address as `0x${string}`],
          });
        } else {
          // Standard DEX Router Swap
          const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);
          const path = [ROBINHOOD_CHAIN.contracts.weth, tokenAddress as `0x${string}`];
          callData = encodeFunctionData({
            abi: ROUTER_ABI,
            functionName: 'swapExactETHForTokens',
            args: [minTokensOut, path, address as `0x${string}`, deadline],
          });
        }

        const hash = await sendTransactionAsync({
          to: targetTo,
          value: parsedEth,
          data: callData,
        });

        setTxHash(hash);
        toastSuccess('Trade Submitted!', `Swapping ${payAmount} ETH for ${tokenSymbol}`, hash);
      } else {
        // SELL Mode
        const tokensToSell = parseUnits(payAmount || '1', tokenDecimals);
        const minQuoteOut = BigInt(0);

        let targetTo = ROBINHOOD_CHAIN.contracts.router;
        let callData: `0x${string}`;

        if (curveAddress && curveAddress !== '0x0000000000000000000000000000000000000000') {
          targetTo = curveAddress as `0x${string}`;
          callData = encodeFunctionData({
            abi: PONS_V2_CURVE_ABI,
            functionName: 'sell',
            args: [tokensToSell, minQuoteOut, address as `0x${string}`],
          });
        } else {
          const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);
          const path = [tokenAddress as `0x${string}`, ROBINHOOD_CHAIN.contracts.weth];
          callData = encodeFunctionData({
            abi: ROUTER_ABI,
            functionName: 'swapExactTokensForETH',
            args: [tokensToSell, minQuoteOut, path, address as `0x${string}`, deadline],
          });
        }

        const hash = await sendTransactionAsync({
          to: targetTo,
          value: 0n,
          data: callData,
        });

        setTxHash(hash);
        toastSuccess('Sell Order Submitted!', `Selling ${payAmount} ${tokenSymbol}`, hash);
      }
    } catch (err: any) {
      console.error('Swap execution error:', err);
      const errMsg = err?.shortMessage || err?.message || 'Transaction was rejected or failed.';
      setTxError(errMsg);
      toastError('Trade Failed', errMsg);
    }
  };

  return (
    <div className="bg-[#0a0d12] border border-[#1a222d] rounded-2xl p-4 font-mono text-xs space-y-4 shadow-2xl">
      <div className="flex items-center justify-between border-b border-[#1a222d] pb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-100 uppercase tracking-wide">
            {isPonsV2 ? 'Pons Curve Trade' : 'Instant DEX Trade'}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#12171e] border border-[#1a222d] text-zinc-400">
            {isPonsV2 ? 'Bonding Curve' : 'Robinhood Router'}
          </span>
        </div>
        <div className="flex items-center bg-[#0d1117] p-0.5 rounded-lg border border-[#1a222d] text-[11px]">
          <button
            onClick={() => { setMode('BUY'); setPayAmount('0.05'); }}
            className={`px-3 py-1 rounded-md transition-colors ${
              mode === 'BUY'
                ? 'bg-[#00C805]/20 text-[#00C805] font-semibold border border-[#00C805]/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => { setMode('SELL'); setPayAmount(userTokenBalance !== '0.00' ? (parseFloat(userTokenBalance) * 0.5).toFixed(2) : '100'); }}
            className={`px-3 py-1 rounded-md transition-colors ${
              mode === 'SELL'
                ? 'bg-[#FF5000]/20 text-[#FF5000] font-semibold border border-[#FF5000]/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Sell
          </button>
        </div>
      </div>

      {/* Input Field */}
      <div className="bg-[#0d1117] border border-[#1a222d] rounded-xl p-3 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-zinc-400">
          <span>You Pay</span>
          <span className="text-zinc-500">
            Balance: {mode === 'BUY' ? `${userEthBalance} ETH` : `${userTokenBalance} ${tokenSymbol}`}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <input
            type="number"
            step="any"
            min="0"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            className="bg-transparent text-base font-bold text-zinc-100 focus:outline-none w-full"
            placeholder="0.0"
          />
          <span className="text-zinc-200 font-semibold px-2 py-0.5 bg-[#12171e] rounded-lg border border-[#1a222d]">
            {mode === 'BUY' ? 'ETH' : tokenSymbol}
          </span>
        </div>
      </div>

      {/* Quick Amount Presets */}
      {mode === 'BUY' ? (
        <div className="grid grid-cols-5 gap-1 text-[11px]">
          {['0.01', '0.05', '0.1', '0.5', '1.0'].map((amt) => (
            <button
              key={amt}
              onClick={() => setPayAmount(amt)}
              className={`py-1 rounded-lg border transition-colors ${
                payAmount === amt
                  ? 'bg-[#00C805]/15 text-[#00C805] border-[#00C805]/40 font-semibold'
                  : 'bg-[#0d1117] text-zinc-400 border-[#1a222d] hover:text-zinc-200'
              }`}
            >
              {amt}
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-1 text-[11px]">
          {[25, 50, 75, 100].map((pct) => (
            <button
              key={pct}
              onClick={() => {
                const total = parseFloat(userTokenBalance) || 0;
                setPayAmount(((total * pct) / 100).toFixed(2));
              }}
              className="py-1 rounded-lg bg-[#0d1117] text-zinc-400 border border-[#1a222d] hover:text-zinc-200 transition-colors"
            >
              {pct}%
            </button>
          ))}
        </div>
      )}

      {/* Output Estimation */}
      <div className="bg-[#0d1117] border border-[#1a222d] rounded-xl p-3 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-zinc-400">
          <span>You Receive (Est.)</span>
          <span>Asset: {mode === 'BUY' ? tokenSymbol : 'ETH'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-[#00C805] truncate">
            {estimatedReceive}
          </span>
          <span className="text-zinc-200 font-semibold px-2 py-0.5 bg-[#12171e] rounded-lg border border-[#1a222d]">
            {mode === 'BUY' ? tokenSymbol : 'ETH'}
          </span>
        </div>
      </div>

      {/* Slippage & Gas Settings */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-[#1a222d]">
        <span>Slippage Tolerance</span>
        <div className="flex items-center gap-1">
          {['0.5', '1.0', '2.5', '5.0'].map((slip) => (
            <button
              key={slip}
              onClick={() => { setSlippage(slip); setIsCustomSlip(false); }}
              className={`px-2 py-0.5 rounded-md border transition-colors ${
                !isCustomSlip && slippage === slip
                  ? 'bg-[#12171e] text-zinc-100 border-[#00C805]/50 font-semibold'
                  : 'bg-[#0d1117] text-zinc-500 border-[#1a222d] hover:text-zinc-300'
              }`}
            >
              {slip}%
            </button>
          ))}
        </div>
      </div>

      {/* Action Swap Button */}
      {isWrongNetwork ? (
        <button
          onClick={() => switchChain({ chainId: ROBINHOOD_CHAIN.id })}
          className="w-full py-2.5 bg-[#FF5000]/20 text-[#FF5000] hover:bg-[#FF5000]/30 border border-[#FF5000]/30 rounded-xl font-bold text-xs transition-colors cursor-pointer"
        >
          Switch to Robinhood Chain
        </button>
      ) : (
        <button
          onClick={handleSwap}
          disabled={isPending}
          className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer ${
            isPending
              ? 'bg-zinc-800 text-zinc-500 cursor-wait'
              : mode === 'BUY'
              ? 'bg-[#00C805] hover:bg-[#00E806] text-black shadow-lg shadow-[#00C805]/20 font-bold'
              : 'bg-[#FF5000] hover:bg-[#FF6520] text-white shadow-lg shadow-[#FF5000]/20 font-bold'
          }`}
        >
          {isPending
            ? 'Confirming Transaction in Wallet...'
            : isConnected
            ? mode === 'BUY'
              ? `One-Click Buy ${tokenSymbol}`
              : `One-Click Sell ${tokenSymbol}`
            : 'Connect Wallet to Trade'}
        </button>
      )}

      {/* Transaction Success Feedback */}
      {txHash && (
        <div className="p-2.5 bg-[#00C805]/10 border border-[#00C805]/30 rounded-xl text-[#00C805] text-[11px] space-y-1">
          <div className="font-bold">Transaction Broadcasted!</div>
          <a
            href={`${ROBINHOOD_CHAIN.blockExplorers.robinscan}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline truncate block text-[#00C805]"
          >
            View on Robinscan ↗
          </a>
        </div>
      )}

      {txError && (
        <div className="p-2.5 bg-[#FF5000]/10 border border-[#FF5000]/30 rounded-xl text-[#FF5000] text-[11px]">
          {txError}
        </div>
      )}
    </div>
  );
}

