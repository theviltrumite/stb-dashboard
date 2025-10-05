// app/lib/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js';

export function getSupabaseAdmin() {
    const url = process.env.SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRole) {
        console.error('❌ Supabase env eksik:', { url, serviceRole: !!serviceRole });
        throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env variables.');
    }

    return createClient(url, serviceRole, {
        auth: { persistSession: false },
    });
}
