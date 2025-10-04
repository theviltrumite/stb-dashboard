import STBLogo from '@/app/ui/stb-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import styles from '@/app/ui/home.module.css';
import { lusitana } from '@/app/ui/fonts';
import Image from 'next/image';

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="flex h-20 shrink-0 items-end rounded-lg bg-blue-500 p-4 md:h-52">
        <STBLogo />
      </div>
      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 lg:w-2/5 lg:px-20">
          {/* <div className={styles.shape} /> */}
          <p className={`${lusitana.className} text-xl text-gray-800 md:text-3xl md:leading-normal`}>
            <strong>STB</strong>  {' '}
            <a href="https://www.hacettepeteknokent.com.tr/tr/firma/-1537" className="text-blue-500 pe-1">
              Kurumsal
            </a>
            Yönetim Paneli. Organizasyon bilgisi, proje sayısı (aktif/pasif), request sayıları...
          </p>
          <Link
            href="/login"
            className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
          >
            <span>Oturum aç</span> <ArrowRightIcon className="w-5 md:w-6" />
          </Link>
        </div>
        <div className="flex items-center justify-center p-6 lg:w-3/5 lg:px-28 lg:py-12">
          {/* Add Hero Images Here */}
          <Image
            src="/main-desktop.png"
            width={1000}
            height={760}
            className="hidden sm:block"
            alt="Screenshots of the dashboard project showing desktop version"
          />
          <Image
            src="/main-mobile.png"
            width={400}
            height={500}
            className="block sm:hidden w-full h-[500px] object-contain"
            alt="Screenshots of the dashboard project showing mobile version"
          />
        </div>
      </div>
    </main>
  );
}
