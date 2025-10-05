import '@/app/ui/global.css';
import { inter } from './ui/fonts';
import { Metadata } from 'next';
import Head from 'next/head';
import { AuthProvider } from './context/AuthContext';

export const metadata: Metadata = {
  title: {
    template: '%s | STB Dashboard',
    default: 'STB Dashboard',
  },
  description: 'STB Dashboard app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <Head>
        <link rel="icon" type="image/png" href="/favicon.png" />
      </Head>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
