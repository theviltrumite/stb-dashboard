// app/api/test/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getOrganizationsByOwner, incrementOrganizationUsage } from '@/app/lib/data';

export async function POST() {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // ✅ 1. Auth kontrolü
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ 2. Kullanıcının organizasyonunu bul
    const organizations = await getOrganizationsByOwner(user.id);
    const org = organizations[0];

    if (!org) {
        return NextResponse.redirect('/forbidden'); // özel forbidden sayfasına yönlendiriyoruz
    }

    try {
        // ✅ 3. Usage kaydı ekle veya güncelle
        await incrementOrganizationUsage(org.id, 1);

        return NextResponse.json({
            message: 'Request count incremented successfully',
            organization_id: org.id,
        });
    } catch (err) {
        console.error('Error updating usage:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
