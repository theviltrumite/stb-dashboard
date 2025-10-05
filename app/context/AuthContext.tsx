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
    refreshOrganization: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    organization: null,
    loading: true,
    refreshOrganization: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const supabase = createClientComponentClient();
    const [user, setUser] = useState<User | null>(null);
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);

    const router = useRouter();
    const pathname = usePathname();

    // Kullanıcı session kontrolü (ilk yükleme)
    useEffect(() => {
        let mounted = true;

        async function initAuth() {
            const { data } = await supabase.auth.getUser();
            if (mounted) {
                setUser(data.user ?? null);
                setLoading(false);
            }
        }

        initAuth();

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => {
            mounted = false;
            listener.subscription.unsubscribe();
        };
    }, [supabase]);

    // Organizasyon bilgisini çek
    const refreshOrganization = async () => {
        if (!user) {
            setOrganization(null);
            return;
        }

        const { data, error } = await supabase
            .from('organizations')
            .select('*')
            .eq('owner_id', user.id)
            .maybeSingle();

        if (!error) setOrganization(data);
        else setOrganization(null);
    };

    useEffect(() => {
        if (user) {
            refreshOrganization();
        } else {
            setOrganization(null);
        }
    }, [user]);

    // Login olmuş kullanıcı login sayfasına giderse → dashboard’a at
    useEffect(() => {
        if (loading) return;
        if (user && pathname.startsWith('/(auth)')) {
            router.replace('/dashboard');
        }
    }, [user, loading, pathname, router]);

    // Login olmamış kullanıcı dashboard'a giderse → login’e at
    useEffect(() => {
        if (loading) return;
        if (!user && pathname.startsWith('/dashboard')) {
            router.replace('/login');
        }
    }, [user, loading, pathname, router]);

    return (
        <AuthContext.Provider value={{ user, organization, loading, refreshOrganization }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
