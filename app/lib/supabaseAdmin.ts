// app/lib/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRole) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env variables.');
}

/**
 * Server-side Supabase client (service role).
 * Use this only in server code (server actions, app/api routes, getServerSideProps, etc).
 */
export const supabaseAdmin = createClient(url, serviceRole, {
    auth: { persistSession: false },
});
