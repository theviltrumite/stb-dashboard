'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function RegisterPage() {
    const supabase = createClientComponentClient();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
            setError(error.message);
        } else {
            router.replace('/dashboard');
        }
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center">
            <form onSubmit={handleRegister} className="bg-white p-6 rounded shadow-md w-80">
                <h1 className="text-xl font-bold mb-4">Register</h1>
                <input
                    type="email"
                    placeholder="Email"
                    className="border p-2 w-full mb-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="border p-2 w-full mb-2"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                <button type="submit" className="bg-blue-500 text-white w-full py-2 rounded">
                    Register
                </button>
            </form>
        </main>
    );
}
