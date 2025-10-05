import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function DELETE(
    _req: Request,
    { params }: { params: { id: string } }
) {
    if (!params?.id) {
        return NextResponse.json({ error: 'Missing project ID' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', params.id);

    if (error) {
        console.error('DELETE error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    if (!params?.id) {
        return NextResponse.json({ error: 'Missing project ID' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { is_active } = body;

    const { error } = await supabase
        .from('projects')
        .update({ is_active })
        .eq('id', params.id);

    if (error) {
        console.error('PATCH error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
