// app/api/test/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { incrementOrganizationUsage, getOrganizationsByOwner } from '@/app/lib/data';

export async function POST() { 
    const cookieStore = cookies(); 
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ ok: true });
}
