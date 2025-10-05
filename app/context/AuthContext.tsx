'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { User } from '@supabase/supabase-js';
import type { Organization } from '@/app/lib/definitions';

type AuthContextType = {
    user: User | null;
    organization: Organization | null;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    organization: null,
    loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const supabase = createClientComponentClient();
    const [user, setUser] = useState<User | null>(null);
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);

    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        async function loadUser() {
            const { data } = await supabase.auth.getUser();
            setUser(data.user ?? null);
            setLoading(false);
        }

        loadUser();

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
            if (session?.user && pathname.startsWith('/(auth)')) {
                router.push('/dashboard');
            }
        });

        return () => {
            listener.subscription.unsubscribe();
        };
    }, [pathname, router, supabase]);

    // Org bilgisini user değişince çek
    useEffect(() => {
        if (!user) {
            setOrganization(null);
            return;
        }
        async function fetchOrg() {
            const { data, error } = await supabase
                .from('organizations')
                .select('*')
                .eq('owner_id', user?.id)
                .maybeSingle();
            if (!error) setOrganization(data);
        }
        fetchOrg();
    }, [user, supabase]);

    return (
        <AuthContext.Provider value={{ user, organization, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
