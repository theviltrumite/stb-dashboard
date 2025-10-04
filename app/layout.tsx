import '@/app/ui/global.css';
import { inter } from './ui/fonts';
import { Metadata } from 'next';
import Head from 'next/head';

export const metadata: Metadata = {
  title: {
    template: '%s | STB Dashboard',
    default: 'STB Dashboard',
  },
  description: 'The official Next.js Learn Dashboard built with App Router.',
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        <link rel="icon" type="image/png" href="/favicon.png" />
      </Head>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
