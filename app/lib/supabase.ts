import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Kullanıcı tarafı (tarayıcı) için public client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sunucu tarafı (API route, server actions) için admin client
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
