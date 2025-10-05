'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CreateProjectPage() {
    const { user, organization, loading } = useAuth();
    const router = useRouter();
    const [name, setName] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [loading, user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!organization) {
            setError('Organizasyon bulunamadı. Proje eklenemez.');
            return;
        }

        setSubmitting(true);
        setError(null);

        const res = await fetch('/api/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                organization_id: organization.id,
                is_active: isActive,
            }),
        });

        if (res.ok) {
            router.push('/dashboard');
        } else {
            const data = await res.json();
            setError(data.error || 'Bir hata oluştu.');
        }

        setSubmitting(false);
    };

    if (loading) return <p>Loading...</p>;
    if (!user) return null;

    return (
        <main className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-6">Yeni Proje Oluştur</h1>
            {error && <p className="text-red-600 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block font-medium mb-1">
                        Proje Adı
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        id="is_active"
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                    />
                    <label htmlFor="is_active" className="font-medium">
                        Aktif Proje Olsun
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-500 disabled:opacity-50"
                >
                    {submitting ? 'Oluşturuluyor...' : 'Proje Oluştur'}
                </button>
            </form>
        </main>
    );
}
