import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Caveat } from 'next/font/google';
import './globals.css';
import { appConfig } from '@/lib/config';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToastProvider from '@/components/ToastProvider';
import AuthModalProvider from '@/components/AuthModalProvider';
import SupportWidget from '@/components/SupportWidget';

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-handwriting',
  display: 'swap',
});

export const metadata: Metadata = {
  title: `${appConfig.brandName} - Good Food Everyday | Homemade Tiffin Service`,
  description: `${appConfig.brandName} connects you with authentic homemade tiffin meals prepared daily by trusted home chefs and neighborhood kitchens.`,
  keywords: [
    'homemade tiffin',
    'daily tiffin service',
    'home cooked meals',
    'fresh food delivery',
    'tiffin partner',
    'monthly meal subscription',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakartaSans.variable} ${caveat.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1F2823] antialiased selection:bg-[#E4753F]/20 selection:text-[#24422E]">
        <ToastProvider>
          <AuthModalProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <SupportWidget />
          </AuthModalProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
