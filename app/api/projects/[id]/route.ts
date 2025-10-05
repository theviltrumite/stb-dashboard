import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    if (!id) {
        return NextResponse.json({ error: 'Missing project ID' }, { status: 400 });
    }

    const body = await req.json();

    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { error } = await supabase
        .from('projects')
        .update({ is_active: body.is_active })
        .eq('id', id);

    if (error) {
        console.error('PATCH error:', error);
        return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
}

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    if (!id) {
        return NextResponse.json({ error: 'Missing project ID' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { error } = await supabase.from('projects').delete().eq('id', id);

    if (error) {
        console.error('DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
}
