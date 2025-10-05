// app/api/projects/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST(req: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies });

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, organization_id, is_active } = await req.json();

        if (!name || !organization_id) {
            return NextResponse.json(
                { error: 'Eksik bilgi: name ve organization_id gerekli.' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('projects')
            .insert({
                name,
                organization_id,
                is_active,
            })
            .select()
            .single();

        if (error) {
            console.error('[PROJECT_CREATE_ERROR]', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ project: data }, { status: 201 });
    } catch (err) {
        console.error('[PROJECT_CREATE_UNEXPECTED]', err);
        return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
    }
}
