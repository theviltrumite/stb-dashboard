'use client';

import { useState } from 'react';

export default function TestButton() {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
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
