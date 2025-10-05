import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getOrganizationsByOwner, createProject } from '@/app/lib/data';

export async function POST(req: Request) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, organization_id, is_active } = body;

    if (!name || !organization_id) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Kullanıcının bu organizasyonun sahibi olduğundan emin olalım
    const organizations = await getOrganizationsByOwner(user.id);
    const ownsOrg = organizations.some((o) => o.id === organization_id);

    if (!ownsOrg) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const project = await createProject({
            name,
            organization_id,
            is_active,
        });
        return NextResponse.json({ project }, { status: 201 });
    } catch (err) {
        console.error('Error creating project:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
