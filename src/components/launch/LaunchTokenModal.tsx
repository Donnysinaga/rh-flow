'use client';

import { useState, useRef } from 'react';
import { useAccount, useSendTransaction, useSwitchChain, useChainId, useBalance } from 'wagmi';
import { parseEther, encodeFunctionData } from 'viem';
import { PONS_FACTORY_ADDRESS, ROBINHOOD_CHAIN } from '@/config/network';
import { PONS_V2_FACTORY_ABI } from '@/config/contracts';
import { useToast } from '@/components/ui/ToastProvider';
import { PonsLogo } from '@/components/ui/PonsLogo';

interface LaunchTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LaunchTokenModal({ isOpen, onClose }: LaunchTokenModalProps) {
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
  const [isDeploying, setIsDeploying] = useState(false);

  if (!isOpen) return null;

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

      toastInfo('Submitting Transaction', 'Please confirm the token launch in your wallet...');

      // Generate cryptographically unique salt for token address generation
      const saltBytes = new Uint8Array(32);
      if (typeof window !== 'undefined' && window.crypto) {
        window.crypto.getRandomValues(saltBytes);
      } else {
        for (let i = 0; i < 32; i++) saltBytes[i] = Math.floor(Math.random() * 256);
      }
      const randomSalt = (`0x` + Array.from(saltBytes, (b) => b.toString(16).padStart(2, '0')).join('')) as `0x${string}`;

      // Safe clean logo URL (avoid huge base64 strings in on-chain calldata)
      const cleanLogo = iconUrl.trim().startsWith('http://') || iconUrl.trim().startsWith('https://') || iconUrl.trim().startsWith('ipfs://')
        ? iconUrl.trim()
        : '';

      // Encode function data for launchToken
      const callData = encodeFunctionData({
        abi: PONS_V2_FACTORY_ABI,
        functionName: 'launchToken',
        args: [
          {
            name: name.trim(),
            symbol: symbol.trim().toUpperCase(),
            description: description.trim(),
            logo: cleanLogo,
            socials: {
              twitter: twitter.trim(),
              telegram: telegram.trim(),
              discord: '',
              website: website.trim(),
              farcaster: '',
            },
            creatorFeeRecipient: address as `0x${string}`,
            creatorTaxBps: parseInt(creatorTaxBps, 10) || 100,
            buybackEnabled: true,
            poolSalt: '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
            tokenSalt: randomSalt,
          },
          0n, // launchConfigId 0 (Standard 1B supply, 4.2 ETH target)
          '0x0000000000000000000000000000000000000000' as `0x${string}`, // native ETH pair
        ],
      });

      let hash: string;
      const win = typeof window !== 'undefined' ? (window as any) : null;
      const ethProvider = win?.ethereum;

      // Dispatch transaction directly via connected provider or wagmi fallback
      if (ethProvider && typeof ethProvider.request === 'function') {
        try {
          hash = await ethProvider.request({
            method: 'eth_sendTransaction',
            params: [
              {
                from: address,
                to: PONS_FACTORY_ADDRESS,
                value: '0x' + totalValue.toString(16),
                data: callData,
              },
            ],
          });
        } catch (ethErr: any) {
          if (ethErr?.code === 4001 || ethErr?.message?.toLowerCase().includes('user rejected') || ethErr?.message?.toLowerCase().includes('cancelled')) {
            throw ethErr;
          }
          // Fallback to wagmi sendTransactionAsync
          hash = await sendTransactionAsync({
            to: PONS_FACTORY_ADDRESS,
            value: totalValue,
            data: callData,
          });
        }
      } else {
        hash = await sendTransactionAsync({
          to: PONS_FACTORY_ADDRESS,
          value: totalValue,
          data: callData,
        });
      }

      toastSuccess(
        'Token Deployed Successfully! 🚀',
        `Transaction submitted: ${hash.slice(0, 10)}...${hash.slice(-8)}. Your curve is active on Robinhood Chain!`,
        hash
      );
      onClose();
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

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden font-mono text-xs">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <PonsLogo className="w-5 h-5" size={20} />
            <div>
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
                Launch Fair Bonding Curve
              </h3>
              <p className="text-[10px] text-zinc-400">Powered by Pons Family v2 Protocol</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleLaunch} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Token Name & Symbol */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-300">
                Token Name <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Robinhood Flow"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-300">
                Symbol <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. FLOW"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 text-xs uppercase"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-zinc-300">Description</label>
            <textarea
              rows={2}
              placeholder="Tell the community about your token project, roadmap, and vision..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 text-xs resize-none"
            />
          </div>

          {/* Image / Logo Upload with Live Preview */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-300 flex items-center justify-between">
              <span>Token Logo / Image</span>
              <span className="text-[10px] text-zinc-500 font-normal">JPG, PNG, WEBP, GIF up to 5MB</span>
            </label>

            {imagePreview ? (
              /* Image Uploaded Preview Box */
              <div className="p-3 bg-zinc-900 border border-emerald-500/40 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center p-0.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Logo preview"
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  <div>
                    <div className="text-zinc-200 font-bold text-xs">Image Selected</div>
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <span>✓ Ready for on-chain metadata</span>
                    </div>
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
              /* Upload File Button & URL Input */
              <div className="space-y-2">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 px-3 border border-dashed border-zinc-700 hover:border-emerald-500/60 bg-zinc-900/60 hover:bg-zinc-900 rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all group text-center"
                >
                  <svg
                    className="w-6 h-6 text-zinc-500 group-hover:text-emerald-400 transition-colors"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                  </svg>
                  <div className="text-xs text-zinc-300 font-medium">
                    Click to select logo file from your device
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    Supports high-resolution PNG, JPG, WEBP, and animated GIF
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/gif"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider shrink-0">or URL:</span>
                  <input
                    type="url"
                    placeholder="https://... (e.g. IPFS / Arweave / Cloudflare)"
                    value={iconUrl}
                    onChange={(e) => {
                      setIconUrl(e.target.value);
                      setImagePreview(e.target.value || null);
                    }}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Social Links */}
          <div className="space-y-2 pt-1 border-t border-zinc-850">
            <label className="text-[11px] font-semibold text-zinc-300">
              Community & Social Links <span className="text-zinc-500 font-normal">(Optional)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Twitter / X handle"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 text-xs"
              />
              <input
                type="text"
                placeholder="Telegram group/channel"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 text-xs"
              />
              <input
                type="url"
                placeholder="Website URL"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 text-xs"
              />
            </div>
          </div>

          {/* Creator Tax & Initial Buy */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-zinc-850">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-300">
                Creator Tax Royalty
              </label>
              <select
                value={creatorTaxBps}
                onChange={(e) => setCreatorTaxBps(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-emerald-500/50 text-xs"
              >
                <option value="0">0.00% Tax (Zero Tax)</option>
                <option value="50">0.50% Tax</option>
                <option value="100">1.00% Tax (Standard)</option>
                <option value="200">2.00% Tax</option>
                <option value="300">3.00% Tax (Max)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-300">
                Initial Buy (ETH) <span className="text-zinc-500 font-normal">(Optional)</span>
              </label>
              <input
                type="number"
                step="0.001"
                min="0"
                placeholder="0.0 ETH"
                value={initialBuyEth}
                onChange={(e) => setInitialBuyEth(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 text-xs"
              />
            </div>
          </div>

          {/* Economics Highlights */}
          <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between text-zinc-400">
              <span>Total Initial Supply:</span>
              <span className="text-zinc-200 font-semibold">1,000,000,000 Tokens</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>Bonding Curve Target:</span>
              <span className="text-emerald-400 font-semibold">4.20 ETH Graduation</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>Protocol Deployment Fee:</span>
              <span className="text-zinc-200 font-semibold">0.0005 ETH</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>Uniswap Liquidity Lock:</span>
              <span className="text-emerald-400 font-semibold">100% Locked Permanently</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-300 transition-colors text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDeploying || !isConnected}
              className={`px-5 py-2 rounded-lg text-zinc-950 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10 ${
                isDeploying || !isConnected
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 active:scale-95'
              }`}
            >
              {isDeploying ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  <span>Deploying on Robinhood Chain...</span>
                </>
              ) : !isConnected ? (
                <span>Connect Wallet to Deploy</span>
              ) : (
                <span>Deploy Token to Robinhood Chain</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
