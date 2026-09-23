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
  title: 'RH FLOW — Robinhood Chain Trading Intelligence',
  description: 'Track tokens, wallets and market flow across Robinhood Chain using real on-chain data.',
  icons: { icon: '/favicon.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-[#09090b] text-zinc-100 antialiased min-h-screen`}>
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

