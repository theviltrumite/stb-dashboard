// app/ui/dashboard/usage-test.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';

export default function UsageTest() {
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);

    const handleTest = async () => {
        setLoading(true);
        setMsg(null);
        try {
            const { data: sessionData, error: sessErr } = await supabase.auth.getSession();
            if (sessErr) {
                setMsg('❌ Session error: ' + sessErr.message);
                return;
            }
            const token = sessionData?.session?.access_token;
            if (!token) {
                setMsg('⚠️ Oturum yok veya token alınamadı.');
                return;
            }

            const res = await fetch('/api/test', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const body = await res.json();
            if (!res.ok) {
                setMsg(`❌ ${body.error ?? 'Hata oluştu'}`);
            } else {
                setMsg(`✅ Başarılı: ${body.message ?? 'Kayıt arttırıldı'}. Org: ${body.organization_id ?? '—'}`);
            }
        } catch (err: any) {
            console.error(err);
            setMsg('❌ İstek sırasında hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-4">
            <button
                onClick={handleTest}
                disabled={loading}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 disabled:opacity-50"
            >
                {loading ? 'Gönderiliyor...' : 'Usage Artırmayı Test Et'}
            </button>

            {msg && (
                <div className={`mt-3 rounded p-3 text-sm ${msg.startsWith('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {msg}
                </div>
            )}
        </div>
    );
}
