import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getOrganizationsByOwner } from '@/app/lib/data';

export async function POST(req: Request) {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // 🧍‍♂️ Kullanıcıyı al
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 📝 Request body
    const body = await req.json();
    const { name, organization_id, is_active } = body;

    if (!name || !organization_id) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // 👑 Organizasyon sahipliği doğrula
    const organizations = await getOrganizationsByOwner(user.id);
    const ownsOrg = organizations.some((o) => o.id === organization_id);

    if (!ownsOrg) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 🏗️ Supabase Auth client ile INSERT yap
    const { data: project, error } = await supabase
        .from('projects')
        .insert({
            name,
            organization_id,
            is_active: is_active ?? true,
        })
        .select()
        .single();

    if (error) {
        console.error('[API /projects] Insert error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ project }, { status: 201 });
}
