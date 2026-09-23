'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

// Authentic SVG Logos for Paired Assets
function EthLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#627EEA" />
      <path d="M16.498 4v8.87l7.497 3.35L16.498 4z" fill="#fff" fillOpacity="0.602" />
      <path d="M16.498 4L9 16.22l7.498-3.35V4z" fill="#fff" />
      <path d="M16.498 21.968v6.027L24 17.616l-7.502 4.352z" fill="#fff" fillOpacity="0.602" />
      <path d="M16.498 27.995v-6.028L9 17.616l7.498 10.379z" fill="#fff" />
      <path d="M16.498 20.573l7.497-4.353-7.497-3.348v7.701z" fill="#fff" fillOpacity="0.2" />
      <path d="M9 16.22l7.498 4.353v-7.701L9 16.22z" fill="#fff" fillOpacity="0.602" />
    </svg>
  );
}

function NvdaLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#76B900" />
      <path
        d="M16 8.5C12.4 8.5 9.5 11.4 9.5 15c0 3.6 2.9 6.5 6.5 6.5 2.6 0 4.8-1.5 5.8-3.7h-2.5c-.8 1-2 1.6-3.3 1.6-2.4 0-4.4-2-4.4-4.4s2-4.4 4.4-4.4c1.3 0 2.5.6 3.3 1.6h2.5c-1-2.2-3.2-3.7-5.8-3.7zm4.2 6.5c0-.6-.1-1.1-.3-1.6h-3.9v3.2h2.2c-.2.6-.7 1.1-1.3 1.3v2c1.9-.4 3.3-2.3 3.3-4.9z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

function SpcxLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#000000" stroke="#27272a" strokeWidth="1" />
      <path
        d="M7 21l6.5-6.5L7 8h3l4.5 4.5L19 8h3l-6.5 6.5L22 21h-3l-4.5-4.5L10 21H7z"
        fill="#FFFFFF"
      />
      <path
        d="M14 14.5c3.5-3.5 7.5-4.5 11-4.5-1.5 3-4.5 6.5-8.5 8.5"
        stroke="#005288"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GooglLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#FFFFFF" />
      <path
        d="M23.5 16.2c0-.5-.04-1.1-.14-1.6H16v3h4.2c-.18 1-.76 1.8-1.6 2.4v2h2.6c1.5-1.4 2.4-3.5 2.4-5.8z"
        fill="#4285F4"
      />
      <path
        d="M16 24c2.2 0 4-.7 5.4-2l-2.6-2c-.7.5-1.7.8-2.8.8-2.1 0-4-1.4-4.6-3.4H8.7v2.1C10.1 22.3 12.8 24 16 24z"
        fill="#34A853"
      />
      <path
        d="M11.4 17.4c-.1-.5-.2-1-.2-1.4s.1-.9.2-1.4V12.5H8.7c-.6 1.2-1 2.5-1 3.9s.4 2.7 1 3.9l2.7-2.9z"
        fill="#FBBC05"
      />
      <path
        d="M16 10.6c1.2 0 2.3.4 3.1 1.2l2.3-2.3C20 8.2 18.2 7.5 16 7.5c-3.2 0-5.9 1.7-7.3 4.5l2.7 2.1c.6-2 2.5-3.5 4.6-3.5z"
        fill="#EA4335"
      />
    </svg>
  );
}

function TslaLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#E82127" />
      <path
        d="M16 10.5c2.8 0 5.4.6 7.5 1.7l.8-2.2C21.8 8.8 19 8.2 16 8.2s-5.8.6-8.3 1.8l.8 2.2c2.1-1.1 4.7-1.7 7.5-1.7zm6.7 3.8c-1.9-.9-4.2-1.4-6.7-1.4s-4.8.5-6.7 1.4l-.5 1.3h2.6c1.4-.5 3-.8 4.6-.8s3.2.3 4.6.8h2.6l-.5-1.3zM15 15.8h2v8.5h-2v-8.5z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

function GmeLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#000000" stroke="#dc2626" strokeWidth="1" />
      <path
        d="M15 7.5h2v6.5h-2V7.5zm5.5 3.5c2.8 1.6 4.5 4.6 4.5 7.8 0 4.9-4 8.9-8.9 8.9s-8.9-4-8.9-8.9c0-3.2 1.7-6.2 4.5-7.8l1 1.8c-2.2 1.2-3.5 3.6-3.5 6 0 3.8 3.1 6.9 6.9 6.9s6.9-3.1 6.9-6.9c0-2.4-1.3-4.8-3.5-6l1-1.8z"
        fill="#FF0000"
      />
    </svg>
  );
}

function AaplLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#18181b" />
      <path
        d="M19.7 15.8c0-2.1 1.7-3.2 1.8-3.3-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.5.8-3.2.8-.7 0-1.7-.8-2.7-.7-1.4.1-2.7.9-3.4 2.1-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.2 2.7 2.1 1.1 0 1.5-.7 2.8-.7s1.7.7 2.8.7c1.2 0 1.9-1 2.6-2.1.8-1.2 1.2-2.4 1.2-2.5-.1-.1-2.7-1-2.7-3.3zm-2.2-6c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.5.6-1 1.6-.9 2.6 1 .1 1.9-.5 2.5-1.2z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// Paired assets list matching Pons protocol
interface PairedAsset {
  symbol: string;
  name: string;
  target: string;
  address: `0x${string}`;
  renderLogo: (cls?: string) => React.ReactNode;
}

const PAIRED_ASSETS: PairedAsset[] = [
  {
    symbol: 'ETH',
    name: 'Ether',
    target: '4,2 ETH',
    address: '0x0000000000000000000000000000000000000000',
    renderLogo: (cls = "w-5 h-5") => <EthLogo className={cls} />,
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA',
    target: '1,000 NVDA',
    address: '0x0000000000000000000000000000000000000000',
    renderLogo: (cls = "w-5 h-5") => <NvdaLogo className={cls} />,
  },
  {
    symbol: 'SPCX',
    name: 'SpaceX Class A',
    target: '500 SPCX',
    address: '0x0000000000000000000000000000000000000000',
    renderLogo: (cls = "w-5 h-5") => <SpcxLogo className={cls} />,
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Class A',
    target: '1,000 GOOGL',
    address: '0x0000000000000000000000000000000000000000',
    renderLogo: (cls = "w-5 h-5") => <GooglLogo className={cls} />,
  },
  {
    symbol: 'TSLA',
    name: 'Tesla',
    target: '1,000 TSLA',
    address: '0x0000000000000000000000000000000000000000',
    renderLogo: (cls = "w-5 h-5") => <TslaLogo className={cls} />,
  },
  {
    symbol: 'GME',
    name: 'GameStop',
    target: '2,500 GME',
    address: '0x0000000000000000000000000000000000000000',
    renderLogo: (cls = "w-5 h-5") => <GmeLogo className={cls} />,
  },
  {
    symbol: 'AAPL',
    name: 'Apple',
    target: '1,000 AAPL',
    address: '0x0000000000000000000000000000000000000000',
    renderLogo: (cls = "w-5 h-5") => <AaplLogo className={cls} />,
  },
];

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
  const [selectedPair, setSelectedPair] = useState<PairedAsset>(PAIRED_ASSETS[0]);
  const [isPairDropdownOpen, setIsPairDropdownOpen] = useState(false);
  const [initialBuyEth, setInitialBuyEth] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedTxHash, setDeployedTxHash] = useState<string | null>(null);
  const [deployedTokenAddr, setDeployedTokenAddr] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

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

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ipfsUri || data.url) {
          setIconUrl(data.ipfsUri || data.url);
        }
      }
    } catch (err) {
      console.error('Error uploading image to IPFS:', err);
    } finally {
      setIsUploadingImage(false);
    }
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
      let cleanLogo = iconUrl.trim();
      if (!cleanLogo && imagePreview) {
        try {
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dataUrl: imagePreview }),
          });
          if (uploadRes.ok) {
            const upData = await uploadRes.json();
            cleanLogo = upData.ipfsUri || upData.url || '';
          }
        } catch (e) {
          console.error('Pre-launch image upload fallback error:', e);
        }
      }

      // If no custom logo was provided or upload failed, use standard official Robinhood Chain IPFS token logo
      const DEFAULT_TOKEN_IPFS = 'ipfs://bafkreickpwaumbwsrgxl4aolt4xf6fp3iy3lv6bh372x3xen4zsmf62ne4';
      if (!cleanLogo || (!cleanLogo.startsWith('ipfs://') && !cleanLogo.startsWith('http://') && !cleanLogo.startsWith('https://'))) {
        cleanLogo = DEFAULT_TOKEN_IPFS;
      }

      const launchParams = {
        name: name.trim(),
        symbol: symbol.trim().toUpperCase(),
        logo: cleanLogo,
        description: description.trim(),
        socials: {
          twitter: twitter.trim() ? (twitter.startsWith('http') ? twitter : `https://x.com/${twitter.replace('@', '')}`) : '',
          telegram: telegram.trim() ? (telegram.startsWith('http') ? telegram : `https://t.me/${telegram.replace('@', '')}`) : '',
          discord: '',
          website: website.trim() ? (website.startsWith('http') ? website : `https://${website}`) : '',
          farcaster: '',
        },
        creatorFeeRecipient: address as `0x${string}`,
        creatorTaxBps: parseInt(creatorTaxBps, 10) || 100,
        buybackEnabled: true,
        expectedEconomics: '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
        salt: randomSalt,
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
    return createPortal(
      <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-md bg-[#0e1014] border border-[#00C805]/40 rounded-2xl shadow-2xl p-6 font-mono text-xs space-y-4 text-center z-10">
          <div className="w-14 h-14 bg-[#00C805]/10 border border-[#00C805]/30 rounded-full flex items-center justify-center mx-auto text-[#00C805] text-2xl">
            🚀
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-100 uppercase">Token Deployed!</h3>
            <p className="text-zinc-400 text-[11px]">
              <span className="text-[#00C805] font-bold">{name} ({symbol})</span> is now live on Robinhood Chain with 1B tokens in its fair bonding curve.
            </p>
          </div>

          <div className="p-3 bg-[#14161b] border border-zinc-800 rounded-lg text-left text-[11px] space-y-1 text-zinc-400 truncate">
            <div className="text-zinc-500 text-[10px] uppercase">Transaction Hash:</div>
            <a
              href={`${ROBINHOOD_CHAIN.blockExplorers.robinscan}/tx/${deployedTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00C805] hover:underline block truncate font-mono"
            >
              {deployedTxHash}
            </a>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handleGoToTrade}
              className="w-full py-2.5 bg-[#00C805] hover:bg-[#00E806] text-black font-bold rounded-xl transition-colors cursor-pointer shadow-lg shadow-[#00C805]/20 text-xs"
            >
              Go to Token & Trade Now 🚀
            </button>
            <button
              type="button"
              onClick={() => { setDeployedTxHash(null); onClose(); }}
              className="w-full py-2 bg-[#14161b] hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-xl transition-colors text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[999999] overflow-y-auto p-3 sm:p-6 flex min-h-full items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[88vh] flex flex-col bg-[#0e1014] border border-zinc-800 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.95)] overflow-hidden font-sans text-xs my-auto z-10">
        
        {/* Modal Top Header (Fixed at top) */}
        <div className="shrink-0 flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-zinc-800 bg-[#14161b]">
          <div className="flex items-center gap-2.5">
            <PonsLogo className="w-5 h-5" size={20} />
            <div>
              <h3 className="text-sm font-bold text-zinc-100 tracking-wide flex items-center gap-2">
                <span>Launch Token on Robinhood Chain</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#00C805]/10 text-[#00C805] border border-[#00C805]/20 font-mono font-semibold">
                  RH FLOW
                </span>
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Content: 2-Column Responsive Layout with Clean Scroll */}
        <form onSubmit={handleLaunch} className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 bg-[#0e1014]">
          
          {/* Left Column: Form Inputs (7 Cols) */}
          <div className="lg:col-span-7 p-5 sm:p-6 space-y-3.5 border-b lg:border-b-0 lg:border-r border-zinc-800 bg-[#0e1014]">
            
            {/* Token Name & Symbol */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-zinc-300">
                  Token Name <span className="text-[#00C805]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robinhood Flow"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#181a20] border border-zinc-800 focus:border-[#00C805]/60 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none text-xs transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-zinc-300">
                  Symbol <span className="text-[#00C805]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLOW"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#181a20] border border-zinc-800 focus:border-[#00C805]/60 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none text-xs uppercase transition-colors"
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
                className="w-full px-3.5 py-2.5 bg-[#181a20] border border-zinc-800 focus:border-[#00C805]/60 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none text-xs resize-none transition-colors"
              />
            </div>

            {/* Token Image */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-zinc-300">Token image</label>
              {imagePreview ? (
                <div className="p-3 bg-[#181a20] border border-[#00C805]/30 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-black border border-zinc-800 overflow-hidden flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imagePreview} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-zinc-200 font-semibold text-xs">Image Attached</div>
                      <div className="text-[10px] text-[#00C805]">Ready for token metadata</div>
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
                  className="w-full py-4 px-4 border border-dashed border-zinc-750 hover:border-[#00C805]/50 bg-[#181a20]/60 hover:bg-[#181a20] rounded-xl flex items-center justify-center gap-2.5 cursor-pointer transition-all group"
                >
                  <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-[#00C805]">
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

            {/* Social Links: X, Telegram, and Website */}
            <div className="space-y-2">
              <label className="text-[12px] font-medium text-zinc-300 flex items-center justify-between">
                <span>Social & Community Links</span>
                <span className="text-[10px] text-zinc-500 font-normal">Optional</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* X / Twitter */}
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-zinc-500 text-xs select-none">x.com/</span>
                  <input
                    type="text"
                    placeholder="handle"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    className="w-full pl-14 pr-3 py-2 bg-[#181a20] border border-zinc-800 focus:border-[#00C805]/60 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none text-xs transition-colors"
                  />
                </div>

                {/* Telegram */}
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-zinc-500 text-xs select-none">t.me/</span>
                  <input
                    type="text"
                    placeholder="community"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    className="w-full pl-12 pr-3 py-2 bg-[#181a20] border border-zinc-800 focus:border-[#00C805]/60 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none text-xs transition-colors"
                  />
                </div>
              </div>

              {/* Website Input (Full width) */}
              <div className="relative flex items-center">
                <span className="absolute left-3 text-zinc-500 text-xs select-none flex items-center gap-1">
                  <span>🌐</span>
                  <span>https://</span>
                </span>
                <input
                  type="text"
                  placeholder="yourproject.com"
                  value={website.replace(/^https?:\/\//, '')}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    setWebsite(val ? (val.startsWith('http') ? val : `https://${val}`) : '');
                  }}
                  className="w-full pl-20 pr-3 py-2 bg-[#181a20] border border-zinc-800 focus:border-[#00C805]/60 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none text-xs transition-colors"
                />
              </div>
            </div>

            {/* Paired Asset Dropdown (Pons-Style with Official SVGs) */}
            <div className="space-y-1.5 relative">
              <label className="text-[12px] font-medium text-zinc-300">Paired asset</label>
              
              {/* Dropdown Toggle Button */}
              <button
                type="button"
                onClick={() => setIsPairDropdownOpen(!isPairDropdownOpen)}
                className="w-full px-3.5 py-2.5 bg-[#181a20] hover:bg-[#202228] border border-zinc-800 focus:border-[#00C805]/60 rounded-xl flex items-center justify-between text-zinc-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    {selectedPair.renderLogo('w-5 h-5')}
                  </div>
                  <span className="font-semibold text-xs text-zinc-100">{selectedPair.symbol}</span>
                </div>
                <span className={`text-zinc-400 text-xs transition-transform duration-200 ${isPairDropdownOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {/* Dropdown Menu Modal/Overlay */}
              {isPairDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsPairDropdownOpen(false)}
                  />
                  <div className="absolute left-0 right-0 top-[102%] z-50 bg-[#14161b] border border-zinc-750 rounded-xl shadow-2xl overflow-hidden py-1 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-150 font-sans">
                    {PAIRED_ASSETS.map((asset) => {
                      const isSelected = selectedPair.symbol === asset.symbol;
                      return (
                        <button
                          key={asset.symbol}
                          type="button"
                          onClick={() => {
                            setSelectedPair(asset);
                            setIsPairDropdownOpen(false);
                          }}
                          className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#22242c] text-zinc-100 font-semibold'
                              : 'hover:bg-[#1a1c22] text-zinc-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-5 h-5 flex items-center justify-center shrink-0">
                              {asset.renderLogo('w-5 h-5')}
                            </div>
                            <span className="text-xs font-semibold text-zinc-100">{asset.symbol}</span>
                          </div>
                          <span className="text-[11px] text-zinc-400 font-normal">{asset.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              <p className="text-[11px] text-zinc-500">Graduates once the curve raises {selectedPair.target}.</p>
            </div>

            {/* Developer Buy Box (Pons-Style) */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-zinc-300">Developer buy</label>
              <div className="p-3 bg-[#181a20] border border-zinc-800 rounded-xl space-y-2">
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
                    <div className="flex items-center gap-1.5 bg-[#0e1014] px-2.5 py-1 rounded-lg border border-zinc-800">
                      <div className="w-4 h-4 flex items-center justify-center shrink-0">
                        {selectedPair.renderLogo('w-4 h-4')}
                      </div>
                      <span className="text-xs font-bold text-zinc-200">{selectedPair.symbol}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleMaxBuy}
                      className="px-2.5 py-1 bg-[#00C805] hover:bg-[#00E806] text-black font-bold rounded-lg text-[11px] transition-colors cursor-pointer"
                    >
                      Max
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-800 flex items-center justify-between">
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
                      className="w-full px-3 py-2 bg-[#181a20] border border-zinc-800 rounded-xl text-zinc-200 text-xs focus:outline-none"
                    >
                      <option value="0">0.00% Tax (Zero Tax)</option>
                      <option value="50">0.50% Tax</option>
                      <option value="100">1.00% Tax (Standard)</option>
                      <option value="200">2.00% Tax</option>
                      <option value="300">3.00% Tax (Max)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Launch Button & Fee Subtext */}
            <div className="pt-3 border-t border-zinc-800 space-y-2">
              <div className="text-[11px] text-zinc-400">
                <span>
                  {selectedPair.symbol} pair, ETH {totalEthDue > 0 ? totalEthDue.toFixed(4) : '0,0005'} due
                </span>
              </div>

              <button
                type="submit"
                disabled={isDeploying || !isFormValid || !isConnected}
                className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                  !isFormValid || !isConnected
                    ? 'bg-[#1a381e] text-zinc-500 cursor-not-allowed'
                    : isDeploying
                    ? 'bg-[#00C805] text-black cursor-wait'
                    : 'bg-[#00C805] hover:bg-[#00E806] text-black shadow-[#00C805]/20 active:scale-[0.99]'
                }`}
              >
                {isDeploying ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
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
          <div className="lg:col-span-5 p-5 sm:p-6 bg-[#14161b] flex flex-col justify-start">
            <div className="p-5 bg-[#0e1014] border border-zinc-800 rounded-2xl space-y-4 sticky top-6">
              
              {/* Token Logo & Title Preview */}
              <div className="space-y-3">
                <div className="w-16 h-16 rounded-xl bg-[#181a20] border border-zinc-800 flex items-center justify-center overflow-hidden">
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
              <div className="pt-2 border-t border-zinc-800 space-y-2.5 text-[11px]">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Launch fee</span>
                  <span className="text-zinc-200 font-medium">0.0005 ETH</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Paired with</span>
                  <span className="text-zinc-200 font-medium">{selectedPair.symbol}</span>
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
                  <span className="text-[#00C805] font-medium">{selectedPair.target}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Liquidity</span>
                  <span className="text-[#00C805] font-medium">100% Locked</span>
                </div>
              </div>

            </div>
          </div>

        </form>

      </div>
    </div>,
    document.body
  );
}


