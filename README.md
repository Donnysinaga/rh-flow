# RH FLOW — Robinhood Chain Trading Terminal & Intelligence Hub

**RH FLOW** is a high-performance, non-custodial decentralized trading terminal and intelligence hub built natively for **Robinhood Chain (Chain ID: 4663)**.

Designed for traders, creators, and DeFi participants, RH FLOW delivers sub-second transaction telemetry, fair-launch bonding curve integration (Pons Family v2), on-chain bytecode security audits, and multi-wallet connectivity.

---

## ⚡ Key Features

- **Multi-Wallet Injected Hub (EIP-6963)**
  - Seamless auto-detection and 1-click network switching for **MetaMask**, **Coinbase Wallet**, **OKX Wallet**, **Phantom**, **Bitget**, **Trust Wallet**, and standard browser extensions.
  - Automatic balance synchronization for ETH and ERC-20 tokens.

- **Pons Family v2 Token Launcher & Bonding Curves**
  - Direct integration with verified on-chain factory (`0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e`).
  - Fair-launch mathematical curves (1 Billion fixed supply, 4.2 ETH graduation milestone).
  - Automated liquidity migration and locked LP creation.

- **Real-Time Token Discovery & DEX Swaps**
  - Indexing of newly launched and verified tokens across Robinhood Chain.
  - Interactive Lightweight Candlestick Charts with multi-timeframe feeds (`1m`, `5m`, `15m`, `1h`, `1D`).
  - Instant 1-click buy/sell routing supporting both standard AMM routers and active bonding curves with custom slippage protection.

- **On-Chain Intelligence & Security Audits**
  - Automated bytecode verification, honeypot heuristics, and top-holder concentration analysis.
  - Smart Money activity classification based on sequencer transaction frequency.
  - Personal portfolio overview with token balances and trade history.

---

## 🌐 Network Information

| Parameter | Value |
| :--- | :--- |
| **Network Name** | Robinhood Chain |
| **Chain ID** | `4663` (`0x1237`) |
| **Currency Symbol** | `ETH` |
| **Decimals** | `18` |
| **Primary RPC** | `https://rpc-robinhood.blockmachine.io` |
| **Fallback RPC** | `https://robinhood.rpc.blxrbdn.com` |
| **Block Explorer (Robinscan)** | `https://robinscan.io` |
| **Block Explorer (Blockscout)** | `https://robinhoodchain.blockscout.com` |
| **Pons v2 Factory** | `0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e` |

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Web3 / EVM**: [Wagmi v2](https://wagmi.sh/), [Viem](https://viem.sh/)
- **Charts**: [Lightweight Charts](https://tradingview.github.io/lightweight-charts/)

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/Donnysinaga/rh-flow.git
cd rh-flow
npm install
```

### 2. Run Local Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### 3. Production Build

```bash
npm run build
npm run start
```

---

## 🚀 Deployment (Online)

### Deploy to Vercel (Recommended)

1. Push this repository to your GitHub account.
2. Go to [Vercel](https://vercel.com) and import the `rh-flow` repository.
3. Click **Deploy**. Vercel will automatically detect Next.js and build the production bundle.

---

## 📄 License

MIT License. Open-source and non-custodial.
