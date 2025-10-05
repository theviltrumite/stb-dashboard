'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProjects, getOrganizationUsage } from '@/app/lib/data';

export default function DashboardOverviewPage() {
    const { user, organization, loading } = useAuth();
    const router = useRouter();
    const [activeProjects, setActiveProjects] = useState(0);
    const [inactiveProjects, setInactiveProjects] = useState(0);
    const [requestCount, setRequestCount] = useState(0);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [loading, user, router]);

    useEffect(() => {
        async function fetchData() {
            if (organization) {
                const projects = await getProjects(organization.id);
                setActiveProjects(projects.filter(p => p.is_active).length);
                setInactiveProjects(projects.filter(p => !p.is_active).length);

                const usage = await getOrganizationUsage(organization.id);
                if (usage.length > 0) {
                    setRequestCount(usage[0].request_count);
                }
            }
        }
        fetchData();
    }, [organization]);

    const handleTestRequest = async () => {
        setUpdating(true);
        const res = await fetch('/api/test', { method: 'POST' });
        if (res.ok) {
            // isteği yaptıktan sonra usage yeniden çek
            if (organization) {
                const usage = await getOrganizationUsage(organization.id);
                if (usage.length > 0) {
                    setRequestCount(usage[0].request_count);
                }
            }
        } else {
            console.error('Test endpoint failed', await res.text());
        }
        setUpdating(false);
    };

    if (loading) return <p>Loading...</p>;
    if (!user) return null;

    return (
        <main className="space-y-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            {organization ? (
                <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-gray-100">
                        <p><strong>Organization:</strong> {organization.name}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg bg-blue-50 text-center">
                            <p className="text-lg font-semibold">{activeProjects}</p>
                            <p className="text-sm text-gray-600">Active Projects</p>
                        </div>
                        <div className="p-4 rounded-lg bg-yellow-50 text-center">
                            <p className="text-lg font-semibold">{inactiveProjects}</p>
                            <p className="text-sm text-gray-600">Inactive Projects</p>
                        </div>
                        <div className="p-4 rounded-lg bg-green-50 text-center">
                            <p className="text-lg font-semibold">{requestCount}</p>
                            <p className="text-sm text-gray-600">Request Count</p>
                        </div>
                    </div>

                    <div>
                        <button
                            onClick={handleTestRequest}
                            disabled={updating}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50"
                        >
                            {updating ? 'Updating...' : 'Send Test Request'}
                        </button>
                    </div>
                </div>
            ) : (
                <p>No organization found for this user.</p>
            )}
        </main>
    );
}
