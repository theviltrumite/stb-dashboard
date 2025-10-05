import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabase';

export async function POST(req: Request) {
    try {
        // Authorization header'dan Bearer token al
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing Bearer token' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '').trim();

        // Supabase JWT doğrulaması
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
        }

        const userId = user.id;

        // Aktif organization bul
        const { data: orgs, error: orgError } = await supabaseAdmin
            .from('organizations')
            .select('id')
            .eq('owner_id', userId)
            .eq('is_active', true)
            .limit(1);

        if (orgError) throw orgError;
        if (!orgs || orgs.length === 0) {
            return NextResponse.json({ error: 'No active organization found' }, { status: 403 });
        }

        const organizationId = orgs[0].id;

        // Dönem hesaplama (örnek: gün bazında)
        const now = new Date();
        const start = new Date(now);
        start.setUTCHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setUTCDate(start.getUTCDate() + 1);

        // organization_usage kaydı artır
        const { data: existing } = await supabaseAdmin
            .from('organization_usage')
            .select('request_count')
            .eq('organization_id', organizationId)
            .eq('period_start_at', start.toISOString())
            .maybeSingle();

        if (existing) {
            await supabaseAdmin
                .from('organization_usage')
                .update({ request_count: existing.request_count + 1 })
                .eq('organization_id', organizationId)
                .eq('period_start_at', start.toISOString());
        } else {
            await supabaseAdmin
                .from('organization_usage')
                .insert({
                    organization_id: organizationId,
                    period_start_at: start.toISOString(),
                    period_end_at: end.toISOString(),
                    request_count: 1,
                });
        }

        return NextResponse.json({
            message: 'Usage incremented successfully',
            organization_id: organizationId,
        });
    } catch (error: any) {
        console.error('❌ API /api/test error:', error);
        return NextResponse.json(
            { error: error.message ?? 'Internal server error' },
            { status: 500 },
        );
    }
}
