'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { motion } from 'framer-motion';

export default function NoOrganizationPage() {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { refreshOrganization } = useAuth();

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const res = await fetch('/api/organizations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });

        setLoading(false);

        if (res.ok) {
            await refreshOrganization();
            router.push('/dashboard');
        } else {
            const { error } = await res.json();
            alert(`Error: ${error}`);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
            >
                <div className="text-center mb-6">
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-2xl font-bold text-gray-800"
                    >
                        Organizasyon Oluştur
                    </motion.h1>
                    <p className="text-gray-500 mt-2 text-sm">
                        Dashboard'u kullanmaya başlamadan önce bir organizasyon oluşturmanız gerekiyor.
                    </p>
                </div>

                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label htmlFor="orgName" className="block text-sm font-medium text-gray-700 mb-1">
                            Organizasyon Adı
                        </label>
                        <input
                            id="orgName"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Örn: My Startup Inc."
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                    </div>

                    <motion.button
                        type="submit"
                        disabled={loading || !name}
                        whileTap={{ scale: 0.97 }}
                        className={`w-full py-2 rounded-lg text-white font-medium transition-colors ${loading || !name
                                ? 'bg-blue-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-500'
                            }`}
                    >
                        {loading ? 'Oluşturuluyor...' : 'Organizasyonu Oluştur'}
                    </motion.button>
                </form>

                <div className="mt-6 text-center text-xs text-gray-400">
                    <p>Organizasyon oluşturduktan sonra projeler eklemeye başlayabilirsiniz 🚀</p>
                </div>
            </motion.div>
        </div>
    );
}
