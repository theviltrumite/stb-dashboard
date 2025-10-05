// app/lib/getSession.ts
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import type { AuthUser } from '@/app/lib/definitions';

export async function getSession() {
    const cookieStore = await cookies();

    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get: (name: string) => cookieStore.get(name)?.value,
            },
        }
    );

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) return null;

    const user: AuthUser = {
        id: session.user.id,
        email: session.user.email!,
    };

    return user;
}
