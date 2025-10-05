'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/app/context/AuthContext';
import { Project } from '@/app/lib/definitions';
import { paginate, searchFilter } from '@/app/lib/utils';
import ProjectsPagination from './projects-pagination';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const PAGE_SIZE = 6;

export default function ProjectList() {
    const { organization } = useAuth();
    const supabase = createClientComponentClient();

    const [projects, setProjects] = useState<Project[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!organization) return;
        const fetchProjects = async () => {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('organization_id', organization.id)
                .order('created_at', { ascending: false });
            if (!error && data) setProjects(data);
            else setError('Projeler yüklenirken hata oluştu.');
        };
        fetchProjects();
    }, [organization, supabase]);

    // 🔥 Realtime sync
    useEffect(() => {
        if (!organization) return;

        const channel = supabase
            .channel('projects-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'projects', filter: `organization_id=eq.${organization.id}` },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setProjects((prev) => [payload.new as Project, ...prev]);
                    } else if (payload.eventType === 'DELETE') {
                        setProjects((prev) => prev.filter((p) => p.id !== (payload.old as Project).id));
                    } else if (payload.eventType === 'UPDATE') {
                        setProjects((prev) =>
                            prev.map((p) => (p.id === (payload.new as Project).id ? (payload.new as Project) : p))
                        );
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [organization, supabase]);

    const filtered = useMemo(() => searchFilter(projects, searchTerm), [projects, searchTerm]);
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = useMemo(() => paginate(filtered, currentPage, PAGE_SIZE), [filtered, currentPage]);

    const handleDelete = async (id: string) => {
        const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
        if (res.ok) {
            setProjects((prev) => prev.filter((p) => p.id !== id));
        } else {
            const { error } = await res.json();
            setError(`Silme hatası: ${error}`);
        }
    };


    const [togglingId, setTogglingId] = useState<string | null>(null);

    const handleToggleActive = async (project: Project) => {
        setTogglingId(project.id);

        const res = await fetch(`/api/projects/${project.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_active: !project.is_active }),
        });

        if (!res.ok) {
            const { error } = await res.json();
            setError(`Güncelleme hatası: ${error}`);
        }

        setTogglingId(null);
    };


    return (
        <div className="mt-8">
            {organization && (
                <h1 className="text-2xl font-bold mb-4 text-gray-800">
                    {organization.name} — Projects
                </h1>
            )}

            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertTitle>Hata</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="mb-4">
                <Input
                    placeholder="Proje ara..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="max-w-xs"
                />
            </div>

            <AnimatePresence>
                {paginated.length === 0 ? (
                    <motion.p
                        key="no-projects"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-gray-500"
                    >
                        Hiç proje yok.
                    </motion.p>
                ) : (
                    paginated.map((project) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="border rounded p-3 mb-2 flex justify-between items-center bg-white shadow-sm hover:shadow-md transition"
                        >
                            <div>
                                <p className="font-medium text-gray-800">{project.name}</p>
                                <p className="text-xs text-gray-500">
                                    {new Date(project.created_at).toLocaleString()}
                                </p>
                                {project.description && (
                                    <p className="text-sm text-gray-600">{project.description}</p>
                                )}
                                <p className={`text-sm font-medium ${project.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                                    {project.is_active ? 'Aktif' : 'Pasif'}
                                </p>
                            </div>
                            <div className="flex space-x-2">
                                {/* <Button variant="secondary" size="sm" onClick={() => handleToggleActive(project)}>
                                    Toggle Active
                                </Button> */}
                                <Button size="sm" onClick={() => handleToggleActive(project)} className="px-4 py-2 rounded-md border border-black bg-white text-black hover:text-white text-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-200">
                                    Toggle Active
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDelete(project.id)}>
                                    Delete
                                </Button>
                            </div>
                        </motion.div>
                    ))
                )}
            </AnimatePresence>

            {totalPages > 1 && (
                <ProjectsPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    );
}
