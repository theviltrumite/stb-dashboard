// app/api/organizations/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST(req: Request) {
    const cookieStore = await cookies(); // ✅ ÖNEMLİ: await eklendi
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await req.json();
    if (!name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('organizations')
        .insert({ name, owner_id: user.id, is_active: true })
        .select()
        .single();

    if (error) {
        console.error('[ORG_CREATE_ERROR]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ organization: data }, { status: 201 });
}
