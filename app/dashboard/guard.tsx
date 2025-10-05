// app/dashboard/guard.tsx
import { redirect } from 'next/navigation';
import { getSession } from '@/app/lib/getSession';

export default async function Guard({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getSession();

    if (!user) {
        redirect('/login');
    }

    return <>{children}</>;
}
