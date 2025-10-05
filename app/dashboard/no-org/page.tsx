'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

export default function NoOrganizationPage() {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { refreshOrganization } = useAuth(); // ✅

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
            await refreshOrganization();   // ✅ Context state'i yenile
            router.push('/dashboard');     // ✅ Sonra yönlendir
        } else {
            const { error } = await res.json();
            alert(`Error: ${error}`);
        }
    }

    return (
        <main className="flex flex-col items-center justify-center min-h-screen">
            <div className="bg-white p-6 rounded shadow-md w-96">
                <h1 className="text-xl font-bold mb-4">Create Your Organization</h1>
                <form onSubmit={handleCreate}>
                    <input
                        className="border p-2 w-full mb-3"
                        placeholder="Organization Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <button
                        disabled={loading || !name}
                        className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-500 disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create'}
                    </button>
                </form>
            </div>
        </main>
    );
}
