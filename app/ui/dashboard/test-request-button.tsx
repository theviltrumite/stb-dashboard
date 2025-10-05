// app/ui/dashboard/test-request-button.tsx
'use client';

export default function TestRequestButton() {
    async function handleClick() {
        const res = await fetch('/api/test', { method: 'POST' });
        if (!res.ok) {
            const err = await res.json();
            alert(`Hata: ${err.error}`);
        }
    }

    return (
        <button
            onClick={handleClick}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
        >
            Send Test Request
        </button>
    );
}
