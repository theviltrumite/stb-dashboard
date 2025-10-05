'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/app/context/AuthContext';

type Project = {
    id: string;
    name: string;
    is_active: boolean;
    created_at: string;
    organization_id: string;
};

export default function ProjectList() {
    const { organization } = useAuth();
    const supabase = createClientComponentClient();
    const [projects, setProjects] = useState<Project[]>([]);

    // 🟡 1️⃣ İlk veri çekimi
    useEffect(() => {
        if (!organization) return;

        const fetchProjects = async () => {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('organization_id', organization.id)
                .order('created_at', { ascending: false });

            if (!error && data) setProjects(data);
        };

        fetchProjects();
    }, [organization, supabase]);

    // 🟠 2️⃣ Realtime senkronizasyon
    useEffect(() => {
        if (!organization) return;

        const channel = supabase
            .channel('projects-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'projects',
                    filter: `organization_id=eq.${organization.id}`,
                },
                (payload) => {
                    console.log('[Realtime Projects]', payload);

                    if (payload.eventType === 'INSERT') {
                        setProjects((prev) => [payload.new as Project, ...prev]);
                    }

                    if (payload.eventType === 'DELETE') {
                        setProjects((prev) =>
                            prev.filter((p) => p.id !== (payload.old as Project).id)
                        );
                    }

                    if (payload.eventType === 'UPDATE') {
                        setProjects((prev) =>
                            prev.map((p) =>
                                p.id === (payload.new as Project).id
                                    ? (payload.new as Project)
                                    : p
                            )
                        );
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [organization, supabase]);

    // 🧰 3️⃣ Proje silme (Optimistic UI)
    const handleDelete = async (id: string) => {
        // 👌 Önce UI'dan kaldır
        setProjects((prev) => prev.filter((p) => p.id !== id));

        const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            const { error } = await res.json();
            alert(`Silme hatası: ${error}`);
        }
    };

    // 🔄 4️⃣ Aktiflik durumunu değiştirme (Optimistic UI)
    const handleToggleActive = async (project: Project) => {
        // 👌 Önce UI'da güncelle
        setProjects((prev) =>
            prev.map((p) =>
                p.id === project.id ? { ...p, is_active: !p.is_active } : p
            )
        );

        const res = await fetch(`/api/projects/${project.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_active: !project.is_active }),
        });

        if (!res.ok) {
            const { error } = await res.json();
            alert(`Güncelleme hatası: ${error}`);
        }
    };

    // 🖼️ 5️⃣ Render
    return (
        <div className="mt-6">
            <h2 className="text-lg font-semibold mb-3">Projeler</h2>

            {projects.length === 0 ? (
                <p className="text-gray-500">Henüz proje yok.</p>
            ) : (
                <ul className="space-y-2">
                    {projects.map((project) => (
                        <li
                            key={project.id}
                            className="border rounded p-3 flex justify-between items-center"
                        >
                            <div>
                                <p className="font-medium">{project.name}</p>
                                <p
                                    className={`text-sm font-medium ${project.is_active ? 'text-green-600' : 'text-gray-500'
                                        }`}
                                >
                                    {project.is_active ? 'Aktif' : 'Pasif'}
                                </p>
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleToggleActive(project)}
                                    className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                                >
                                    Toggle Active
                                </button>
                                <button
                                    onClick={() => handleDelete(project.id)}
                                    className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
