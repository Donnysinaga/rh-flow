import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Web3Providers } from '@/lib/web3/providers';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  metadataBase: new URL('https://orbitra.vercel.app'),
  title: 'Orbitra ($ORB) — Robinhood Chain Trading Intelligence',
  description: 'The premier decentralized liquidity terminal & fair-launch protocol on Robinhood Chain ($ORB).',
  icons: { 
    icon: [
      { url: '/favicon.png?v=3', type: 'image/png' },
      { url: '/favicon.ico?v=3' },
    ],
    shortcut: '/favicon.ico?v=3',
    apple: '/apple-icon.png?v=3',
  },
  openGraph: {
    title: 'Orbitra ($ORB) — Robinhood Chain Trading Intelligence',
    description: 'Track tokens, wallets, and market liquidity across Robinhood Chain with Orbitra ($ORB).',
    images: ['/orbitra-hero.jpg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png?v=3" />
        <link rel="shortcut icon" href="/favicon.ico?v=3" />
        <link rel="apple-touch-icon" href="/apple-icon.png?v=3" />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-[#000000] text-zinc-100 antialiased min-h-screen selection:bg-[#00C805] selection:text-black`}>
        <Web3Providers>
          <ToastProvider>
            <Header />
            <main className="min-h-[calc(100vh-3.5rem)]">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </Web3Providers>
      </body>
    </html>
  );
}
