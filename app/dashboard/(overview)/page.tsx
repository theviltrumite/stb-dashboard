import ProjectList from '@/app/ui/dashboard/projects-list';
import RequestCountCard from '@/app/ui/dashboard/request-count-card';
import TestButton from '@/app/ui/dashboard/test-button';

export default function DashboardPage() {
    return (
        <div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <RequestCountCard />
            </div>

            <div className="mt-6">
                <TestButton />
            </div>

            <ProjectList />
        </div>
    );
}
