import { lusitana } from '@/app/ui/fonts';
import RequestCountCard from '@/app/ui/dashboard/request-count-card';
import TestButton from '@/app/ui/dashboard/test-button';

export default async function DashboardPage() {
    return (
        <main>
            <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
                Dashboard
            </h1>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* Bu kart sadece client component. Tüm sayfa değil. */}
                <RequestCountCard />
            </div>
            <div className="mt-6">
                <TestButton />
            </div>
        </main>
    );
}
