'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useSendTransaction, useSwitchChain, useChainId, useBalance } from 'wagmi';
import { parseEther, encodeFunctionData, formatEther } from 'viem';
import { PONS_FACTORY_ADDRESS, PONS_V2_ROUTER_ADDRESS, ROBINHOOD_CHAIN } from '@/config/network';
import { PONS_V2_FACTORY_ABI, PONS_V2_LAUNCH_AND_BUY_ABI } from '@/config/contracts';
import { publicClient } from '@/lib/web3/client';
import { useToast } from '@/components/ui/ToastProvider';
import { PonsLogo } from '@/components/ui/PonsLogo';

interface LaunchTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LaunchTokenModal({ isOpen, onClose }: LaunchTokenModalProps) {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { data: balanceData } = useBalance({ address, chainId: ROBINHOOD_CHAIN.id });
  const { switchChainAsync } = useSwitchChain();
  const { sendTransactionAsync } = useSendTransaction();
  const { toastSuccess, toastError, toastInfo } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [twitter, setTwitter] = useState('');
  const [telegram, setTelegram] = useState('');
  const [website, setWebsite] = useState('');
  const [creatorTaxBps, setCreatorTaxBps] = useState('100'); // 1% default
  const [initialBuyEth, setInitialBuyEth] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedTxHash, setDeployedTxHash] = useState<string | null>(null);
  const [deployedTokenAddr, setDeployedTokenAddr] = useState<string | null>(null);

  if (!isOpen) return null;

  const userEthBalance = balanceData ? parseFloat(formatEther(balanceData.value)) : 0;
  const launchFeeEth = 0.0005;
  const initialBuyNum = parseFloat(initialBuyEth) || 0;
  const totalEthDue = launchFeeEth + initialBuyNum;

  const handleMaxBuy = () => {
    if (!balanceData) return;
    // Reserve 0.0005 ETH launch fee + 0.001 ETH buffer for gas
    const reserve = 0.0015;
    const maxVal = Math.max(0, userEthBalance - reserve);
    if (maxVal > 0) {
      setInitialBuyEth(maxVal.toFixed(4));
    } else {
      setInitialBuyEth('0');
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toastError('File Too Large', 'Please select an image smaller than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setIconUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isFormValid = name.trim().length > 0 && symbol.trim().length > 0;

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      toastError('Wallet Required', 'Please connect your Web3 wallet to deploy a token.');
      return;
    }

    if (!name.trim() || !symbol.trim()) {
      toastError('Missing Info', 'Please enter a valid Token Name and Symbol.');
      return;
    }

    try {
      setIsDeploying(true);

      // Auto switch network if connected to wrong chain
      if (chainId !== ROBINHOOD_CHAIN.id && switchChainAsync) {
        toastInfo('Switching Network', 'Please switch your wallet to Robinhood Chain...');
        await switchChainAsync({ chainId: ROBINHOOD_CHAIN.id });
      }

      const launchFeeWei = 500000000000000n; // 0.0005 ETH official Pons v2 launch fee
      const initialBuyWei = initialBuyEth && parseFloat(initialBuyEth) > 0 ? parseEther(initialBuyEth) : 0n;
      const totalValue = launchFeeWei + initialBuyWei;

      // Check balance pre-flight
      if (balanceData && balanceData.value < totalValue) {
        const requiredEth = (Number(totalValue) / 1e18).toFixed(4);
        toastError('Insufficient Balance', `You need at least ${requiredEth} ETH + gas on Robinhood Chain.`);
        setIsDeploying(false);
        return;
      }

      toastInfo(
        'Submitting Transaction',
        initialBuyWei > 0n
          ? `Deploying token & executing atomic developer buy (${initialBuyEth} ETH)...`
          : 'Please confirm the token launch in your wallet...'
      );

      // Generate cryptographically unique salt for token address generation
      const saltBytes = new Uint8Array(32);
      if (typeof window !== 'undefined' && window.crypto) {
        window.crypto.getRandomValues(saltBytes);
      } else {
        for (let i = 0; i < 32; i++) saltBytes[i] = Math.floor(Math.random() * 256);
      }
      const randomSalt = (`0x` + Array.from(saltBytes, (b) => b.toString(16).padStart(2, '0')).join('')) as `0x${string}`;

      // Clean logo URL
      const cleanLogo = iconUrl.trim().startsWith('http://') || iconUrl.trim().startsWith('https://') || iconUrl.trim().startsWith('ipfs://')
        ? iconUrl.trim()
        : '';

      const launchParams = {
        name: name.trim(),
        symbol: symbol.trim().toUpperCase(),
        description: description.trim(),
        logo: cleanLogo,
        socials: {
          twitter: twitter.trim() ? (twitter.startsWith('http') ? twitter : `https://x.com/${twitter.replace('@', '')}`) : '',
          telegram: telegram.trim() ? (telegram.startsWith('http') ? telegram : `https://t.me/${telegram.replace('@', '')}`) : '',
          discord: '',
          website: website.trim(),
          farcaster: '',
        },
        creatorFeeRecipient: address as `0x${string}`,
        creatorTaxBps: parseInt(creatorTaxBps, 10) || 100,
        buybackEnabled: true,
        poolSalt: '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
        tokenSalt: randomSalt,
      };

      let callData: `0x${string}`;
      let targetAddress: `0x${string}`;

      if (initialBuyWei > 0n) {
        // Atomic Deploy + Buy in the exact same transaction block
        targetAddress = PONS_V2_ROUTER_ADDRESS;
        callData = encodeFunctionData({
          abi: PONS_V2_LAUNCH_AND_BUY_ABI,
          functionName: 'launchAndBuy',
          args: [
            launchParams,
            0n, // launchConfigId 0 (Standard 1B supply, 4.2 ETH target)
            '0x0000000000000000000000000000000000000000' as `0x${string}`, // native ETH pair
            initialBuyWei,
            0n, // minTokensOut
            address as `0x${string}`, // recipient of bought tokens
            [], // snipeTaxExemptions
          ],
        });
      } else {
        // Standard Fair Launch without initial buy
        targetAddress = PONS_FACTORY_ADDRESS;
        callData = encodeFunctionData({
          abi: PONS_V2_FACTORY_ABI,
          functionName: 'launchToken',
          args: [
            launchParams,
            0n, // launchConfigId 0
            '0x0000000000000000000000000000000000000000' as `0x${string}`, // native ETH pair
          ],
        });
      }

      let hash: string;
      const win = typeof window !== 'undefined' ? (window as any) : null;
      const ethProvider = win?.ethereum;

      if (ethProvider && typeof ethProvider.request === 'function') {
        try {
          hash = await ethProvider.request({
            method: 'eth_sendTransaction',
            params: [
              {
                from: address,
                to: targetAddress,
                value: '0x' + totalValue.toString(16),
                data: callData,
              },
            ],
          });
        } catch (ethErr: any) {
          if (ethErr?.code === 4001 || ethErr?.message?.toLowerCase().includes('user rejected') || ethErr?.message?.toLowerCase().includes('cancelled')) {
            throw ethErr;
          }
          hash = await sendTransactionAsync({
            to: targetAddress,
            value: totalValue,
            data: callData,
          });
        }
      } else {
        hash = await sendTransactionAsync({
          to: targetAddress,
          value: totalValue,
          data: callData,
        });
      }

      setDeployedTxHash(hash);
      toastSuccess(
        initialBuyWei > 0n
          ? 'Token Deployed & Bought Atomically! 🚀'
          : 'Token Deployed Successfully! 🚀',
        `Transaction submitted: ${hash.slice(0, 10)}...${hash.slice(-8)}. Your curve is live!`,
        hash
      );

      try {
        const receipt = await publicClient.waitForTransactionReceipt({ hash: hash as `0x${string}` });
        if (receipt && receipt.logs) {
          for (const log of receipt.logs) {
            if (log.topics && log.topics[1]) {
              const tokenAddr = `0x${log.topics[1].slice(26)}`;
              setDeployedTokenAddr(tokenAddr);
              break;
            }
          }
        }
      } catch {
        // Background receipt fetch
      }
    } catch (err: any) {
      console.error('Deployment error:', err);
      toastError(
        'Launch Failed',
        err?.shortMessage || err?.message || 'Transaction was rejected or failed.'
      );
    } finally {
      setIsDeploying(false);
    }
  };

  const handleGoToTrade = () => {
    const targetAddr = deployedTokenAddr;
    setDeployedTxHash(null);
    setDeployedTokenAddr(null);
    onClose();
    if (targetAddr) {
      router.push(`/token/${targetAddr}`);
    } else {
      router.push('/');
    }
  };

  if (deployedTxHash) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-md bg-[#121316] border border-emerald-500/40 rounded-2xl shadow-2xl p-6 font-mono text-xs space-y-4 text-center">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400 text-2xl">
            🚀
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-100 uppercase">Token Deployed!</h3>
            <p className="text-zinc-400 text-[11px]">
              <span className="text-emerald-400 font-bold">{name} ({symbol})</span> is now live on Robinhood Chain with 1B tokens in its fair bonding curve.
            </p>
          </div>

          <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg text-left text-[11px] space-y-1 text-zinc-400 truncate">
            <div className="text-zinc-500 text-[10px] uppercase">Transaction Hash:</div>
            <a
              href={`${ROBINHOOD_CHAIN.blockExplorers.robinscan}/tx/${deployedTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline block truncate font-mono"
            >
              {deployedTxHash}
            </a>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handleGoToTrade}
              className="w-full py-2.5 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold rounded-xl transition-colors cursor-pointer shadow-lg shadow-lime-400/20 text-xs"
            >
              Go to Token & Trade Now 🚀
            </button>
            <button
              type="button"
              onClick={() => { setDeployedTxHash(null); onClose(); }}
              className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-xl transition-colors text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#131417] border border-zinc-800/90 rounded-2xl shadow-2xl overflow-hidden font-sans text-xs">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-[#17181c]">
          <div className="flex items-center gap-2.5">
            <PonsLogo className="w-5 h-5" size={20} />
            <div>
              <h3 className="text-sm font-bold text-zinc-100 tracking-wide">
                Launch Token on Robinhood Chain
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Content: 2-Column Responsive Layout */}
        <form onSubmit={handleLaunch} className="grid grid-cols-1 lg:grid-cols-12 max-h-[82vh] overflow-y-auto">
          
          {/* Left Column: Form Inputs (7 Cols) */}
          <div className="lg:col-span-7 p-6 space-y-4 border-b lg:border-b-0 lg:border-r border-zinc-800/80">
            
            {/* Token Name & Symbol */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-zinc-300">
                  Token Name <span className="text-lime-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robinhood Flow"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#1a1b20] border border-zinc-800 focus:border-lime-400/60 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none text-xs transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-zinc-300">
                  Symbol <span className="text-lime-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLOW"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#1a1b20] border border-zinc-800 focus:border-lime-400/60 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none text-xs uppercase transition-colors"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-zinc-300">Description</label>
              <textarea
                rows={2}
                placeholder="What is this token about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#1a1b20] border border-zinc-800 focus:border-lime-400/60 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none text-xs resize-none transition-colors"
              />
            </div>

            {/* Token Image */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-zinc-300">Token image</label>
              {imagePreview ? (
                <div className="p-3 bg-[#1a1b20] border border-lime-400/30 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imagePreview} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-zinc-200 font-semibold text-xs">Image Attached</div>
                      <div className="text-[10px] text-lime-400">Ready for token metadata</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-2.5 py-1 text-[11px] text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg border border-red-500/20 transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 px-4 border border-dashed border-zinc-750 hover:border-lime-400/50 bg-[#1a1b20]/60 hover:bg-[#1a1b20] rounded-xl flex items-center justify-center gap-2.5 cursor-pointer transition-all group"
                >
                  <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-lime-400">
                    🖼️
                  </div>
                  <span className="text-zinc-300 font-medium text-xs">Choose image</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp, image/gif"
                onChange={handleImageFileChange}
                className="hidden"
              />
            </div>

            {/* X Profile & Telegram */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-zinc-300">X profile</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-zinc-500 text-xs">x.com/</span>
                  <input
                    type="text"
                    placeholder="handle"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    className="w-full pl-14 pr-3 py-2.5 bg-[#1a1b20] border border-zinc-800 focus:border-lime-400/60 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none text-xs transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-zinc-300">Telegram</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-zinc-500 text-xs">t.me/</span>
                  <input
                    type="text"
                    placeholder="community"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    className="w-full pl-12 pr-3 py-2.5 bg-[#1a1b20] border border-zinc-800 focus:border-lime-400/60 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none text-xs transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Paired Asset */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-zinc-300">Paired asset</label>
              <div className="w-full px-3.5 py-2.5 bg-[#1a1b20] border border-zinc-800 rounded-xl flex items-center justify-between text-zinc-200">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">
                    Ξ
                  </div>
                  <span className="font-semibold text-xs">ETH</span>
                </div>
                <span className="text-zinc-500 text-xs">▼</span>
              </div>
              <p className="text-[11px] text-zinc-500">Graduates once the curve raises 4,2 ETH.</p>
            </div>

            {/* Developer Buy Box (Pons-Style) */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-zinc-300">Developer buy</label>
              <div className="p-3 bg-[#1a1b20] border border-zinc-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0.00"
                    value={initialBuyEth}
                    onChange={(e) => setInitialBuyEth(e.target.value)}
                    className="w-2/3 bg-transparent text-lg sm:text-xl font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-[#131417] px-2 py-1 rounded-lg border border-zinc-800">
                      <span className="text-blue-400 text-xs">Ξ</span>
                      <span className="text-xs font-bold text-zinc-200">ETH</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleMaxBuy}
                      className="px-2.5 py-1 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold rounded-lg text-[11px] transition-colors cursor-pointer"
                    >
                      Max
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/60 flex items-center justify-between">
                  <span>
                    {userEthBalance > 0 ? userEthBalance.toFixed(4) : '0,00'} available, bought in the launch transaction
                  </span>
                </div>
              </div>
            </div>

            {/* Advanced Section Collapsible */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full py-2 text-zinc-300 hover:text-zinc-100 text-xs font-medium cursor-pointer"
              >
                <span>Advanced</span>
                <span className={`transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {showAdvanced && (
                <div className="pt-2 pb-1 space-y-3 animate-in fade-in duration-150">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-400">Creator Tax Royalty</label>
                    <select
                      value={creatorTaxBps}
                      onChange={(e) => setCreatorTaxBps(e.target.value)}
                      className="w-full px-3 py-2 bg-[#1a1b20] border border-zinc-800 rounded-xl text-zinc-200 text-xs focus:outline-none"
                    >
                      <option value="0">0.00% Tax (Zero Tax)</option>
                      <option value="50">0.50% Tax</option>
                      <option value="100">1.00% Tax (Standard)</option>
                      <option value="200">2.00% Tax</option>
                      <option value="300">3.00% Tax (Max)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-400">Website URL (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full px-3 py-2 bg-[#1a1b20] border border-zinc-800 rounded-xl text-zinc-200 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Launch Button & Fee Subtext */}
            <div className="pt-3 border-t border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span>
                  ETH pair, ETH {totalEthDue > 0 ? totalEthDue.toFixed(4) : '0,0005'} due
                </span>
                <span className="text-zinc-600">🔒 100% On-chain</span>
              </div>

              <button
                type="submit"
                disabled={isDeploying || !isFormValid || !isConnected}
                className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                  !isFormValid || !isConnected
                    ? 'bg-[#404c26] text-zinc-400 cursor-not-allowed'
                    : isDeploying
                    ? 'bg-lime-500 text-zinc-950 cursor-wait'
                    : 'bg-lime-400 hover:bg-lime-300 text-zinc-950 shadow-lime-400/20 active:scale-[0.99]'
                }`}
              >
                {isDeploying ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    <span>
                      {initialBuyNum > 0 ? 'Deploying & Buying Atomically...' : 'Deploying on Robinhood Chain...'}
                    </span>
                  </>
                ) : !isConnected ? (
                  'Connect Wallet to Launch'
                ) : !isFormValid ? (
                  'Fill token details'
                ) : initialBuyNum > 0 ? (
                  `Launch & Buy (${totalEthDue.toFixed(4)} ETH)`
                ) : (
                  'Launch Token (0.0005 ETH)'
                )}
              </button>
            </div>

          </div>

          {/* Right Column: Live Token Preview Card (5 Cols) */}
          <div className="lg:col-span-5 p-6 bg-[#17181c]/50 flex flex-col justify-start">
            <div className="p-5 bg-[#121316] border border-zinc-800 rounded-2xl space-y-4 sticky top-6">
              
              {/* Token Logo & Title Preview */}
              <div className="space-y-3">
                <div className="w-16 h-16 rounded-xl bg-[#1c1d22] border border-zinc-800 flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-zinc-600 text-2xl">🖼️</span>
                  )}
                </div>

                <div>
                  <h4 className="text-base font-bold text-zinc-100 truncate">
                    {name.trim() || 'Your token'}
                  </h4>
                  <p className="text-xs text-zinc-400 uppercase font-mono">
                    {symbol.trim() || 'ticker'}
                  </p>
                </div>
              </div>

              {/* Specs Table */}
              <div className="pt-2 border-t border-zinc-800/80 space-y-2.5 text-[11px]">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Launch fee</span>
                  <span className="text-zinc-200 font-medium">0.0005 ETH</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Paired with</span>
                  <span className="text-zinc-200 font-medium">ETH</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Trade fee</span>
                  <span className="text-zinc-200 font-medium">1.0%</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Launch window</span>
                  <span className="text-zinc-200 font-medium">Fair Curve</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Graduation</span>
                  <span className="text-lime-400 font-medium">4.2 ETH</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Liquidity</span>
                  <span className="text-lime-400 font-medium">100% Locked</span>
                </div>
              </div>

            </div>
          </div>

        </form>

      </div>
    </div>
  );
}


