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
    icon: '/favicon.png',
    shortcut: '/favicon.ico',
    apple: '/logo.png',
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
