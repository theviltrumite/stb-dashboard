'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/context/AuthContext';

// shadcn/ui
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function CreateProjectForm() {
    const { organization } = useAuth();
    const router = useRouter();

    const [name, setName] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!organization) {
            router.push('/dashboard/no-org');
            return;
        }

        setSubmitting(true);
        setError(null);

        const res = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                organization_id: organization.id,
                is_active: isActive,
            }),
        });

        if (res.ok) {
            router.push('/dashboard');
        } else {
            const data = await res.json().catch(() => ({}));
            setError(data?.error || 'Bir hata oluştu.');
        }

        setSubmitting(false);
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-white p-6 rounded-2xl shadow-lg border max-w-xl mx-auto"
        >
            <h1 className="text-2xl font-bold mb-6 text-center">✨ Yeni Proje Oluştur</h1>

            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertTitle>Hata</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {!organization && (
                <Alert className="mb-4">
                    <AlertTitle>Organizasyon bulunamadı</AlertTitle>
                    <AlertDescription>
                        Proje oluşturabilmek için önce bir organizasyon oluşturmalısınız.
                    </AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="name">Proje Adı</Label>
                    <Input
                        id="name"
                        placeholder="Örn. STB Dashboard"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="flex items-center justify-between">
                    <Label htmlFor="is_active" className="cursor-pointer">
                        Aktif Proje Olsun
                    </Label>
                    <Switch
                        id="is_active"
                        checked={isActive}
                        onCheckedChange={(checked) => setIsActive(checked)}
                    />
                </div>

                <Button
                    type="submit"
                    disabled={submitting || !name.trim() || !organization}
                    className="w-full bg-blue-600 text-white hover:bg-blue-500"
                >
                    {submitting ? 'Oluşturuluyor...' : 'Proje Oluştur'}
                </Button>
            </form>
        </motion.div>
    );
}
