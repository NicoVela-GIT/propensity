import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout';
import BottomNav from '@/components/layout/BottomNav';
import { alerts, formatCurrency, portfolioMetrics } from '@/lib/data';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Property Tracker - Investment Portfolio Manager',
  description: 'Track your real estate investments and opportunities',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <div className="flex min-h-screen">
          {/* Left Sidebar - Hidden on mobile/tablet */}
          <div className="hidden lg:block">
            <Sidebar
              alertCount={alerts.length}
              portfolioValue={formatCurrency(portfolioMetrics.totalValue)}
              monthlyROI={`${portfolioMetrics.averageROI}%`}
            />
          </div>

          {/* Main Content */}
          <main className="flex-1 overflow-auto pb-20 lg:pb-0">
            {children}
          </main>
        </div>

        {/* Bottom Navigation - Shown on mobile/tablet only */}
        <BottomNav />
      </body>
    </html>
  );
}
