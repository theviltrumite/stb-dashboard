// app/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!url || !anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_* env variables.');
}

export const supabase = createClient(url, anonKey, {
    auth: {
        // optional: detectSessionInUrl: false,
    },
});
