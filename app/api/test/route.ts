// app/api/test/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST() {
    const cookieStore = await cookies(); // ✅ await ekledik
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    console.log('[API /test] Cookies', JSON.stringify(cookieStore.getAll(), null, 2));

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ Organizasyonu DB'den tekrar çek
    const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('id, owner_id, is_active')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: true })  // en eskiyi al
        .limit(1)
        .maybeSingle();


    console.log('[API TEST] user.id =', user.id);
    console.log('[API TEST] orgError =', orgError);
    console.log('[API TEST] org data =', org);

    if (orgError || !org) {
        return NextResponse.json({ error: 'No organization' }, { status: 403 });
    }

    console.log('[API /test] User:', user);
    console.log('[API /test] Org:', org);

    // ✅ organization_usage tablosunu güncelle
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59));
    const periodStartIso = start.toISOString();
    const periodEndIso = end.toISOString();

    // Var mı kontrol et
    const { data: existing } = await supabase
        .from('organization_usage')
        .select('*')
        .eq('organization_id', org.id)
        .eq('period_start_at', periodStartIso)
        .maybeSingle();

    if (!existing) {
        // Yoksa yeni satır ekle
        const { error: insertError } = await supabase
            .from('organization_usage')
            .insert({
                organization_id: org.id,
                period_start_at: periodStartIso,
                period_end_at: periodEndIso,
                request_count: 1,
            });

        if (insertError) {
            console.error('Insert error:', insertError);
            return NextResponse.json({ error: 'Failed to insert usage' }, { status: 500 });
        }
    } else {
        // Varsa request_count'u 1 artır
        const { error: updateError } = await supabase
            .from('organization_usage')
            .update({ request_count: existing.request_count + 1 })
            .eq('organization_id', org.id)
            .eq('period_start_at', periodStartIso);

        if (updateError) {
            console.error('Update error:', updateError);
            return NextResponse.json({ error: 'Failed to update usage' }, { status: 500 });
        }
    }

    return NextResponse.json({ ok: true });
}
