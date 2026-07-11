import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MEDEK | Üniversite Akreditasyon Sistemi',
  description: 'Kurumsal Akreditasyon ve Görev Yönetim Sistemi',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-800 antialiased`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}