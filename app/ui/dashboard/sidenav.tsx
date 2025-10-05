'use client';

import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import STBLogo from '@/app/ui/stb-logo';
import { PowerIcon } from '@heroicons/react/24/outline';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function SideNav() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <motion.aside
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex h-full flex-col px-3 py-4 md:px-4 bg-white shadow-lg border-r border-gray-200"
    >
      <Link
        href="/"
        className="mb-4 flex items-center justify-start rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 p-4 shadow-sm hover:shadow-md transition"
      >
        <div className="w-32 text-white md:w-40">
          <STBLogo />
        </div>
      </Link>

      <div className="flex grow flex-col justify-between">
        <div className="hidden md:flex flex-col space-y-2">
          <NavLinks />
        </div>

        <div className="md:hidden mt-auto flex items-center justify-between bg-gray-50 rounded-lg p-2">
          <div className="flex space-x-2">
            <NavLinks />
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSignOut}
            className="flex items-center justify-center rounded-md bg-gray-100 p-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
          >
            <PowerIcon className="w-5 h-5" />
          </motion.button>
        </div>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleSignOut}
          className="hidden md:flex mt-auto items-center justify-start gap-2 rounded-md bg-gray-100 p-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
        >
          <PowerIcon className="w-5 h-5" />
          <span>Sign Out</span>
        </motion.button>
      </div>
    </motion.aside>
  );
}