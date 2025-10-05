'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

export default function TestButton() {
    const [loading, setLoading] = useState(false);
    const { organization } = useAuth();
    const router = useRouter();

    const handleClick = async () => {
        if (!organization) {
            router.push('/no-org');
            return;
        }

        setLoading(true);
        const res = await fetch('/api/test', { method: 'POST' });
        setLoading(false);

        if (!res.ok) {
            const { error } = await res.json();
            alert(`Error: ${error}`);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
            {loading ? 'Requesting...' : 'Send Test Request'}
        </button>
    );
}
