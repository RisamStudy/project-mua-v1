import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import FontLoader from '@/components/ui/font-loader';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  fallback: ['system-ui', 'arial', 'sans-serif'], // Add fallback fonts
});

export const metadata: Metadata = {
  title: 'RORO MUA Admin',
  description: 'RORO MUA Admin Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="">
      <head>
        {/* Material Icons - removed onError handler for server component compatibility */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        {/* Local fallback CSS */}
        <link
          href="/fonts/material-icons-fallback.css"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-display antialiased bg-gray-50`}>
        <FontLoader />
        {children}
      </body>
    </html>
  );
}