'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { AuthUser, Organization } from '@/app/lib/definitions';
import { getOrganizationsByOwner } from '@/app/lib/data';

type AuthContextType = {
    user: AuthUser | null;
    organization: Organization | null;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    organization: null,
    loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const supabase = createClientComponentClient();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const { data } = await supabase.auth.getUser();
            if (data.user) {
                const authUser: AuthUser = {
                    id: data.user.id,
                    email: data.user.email!,
                };
                setUser(authUser);

                // Organization çek
                const orgs = await getOrganizationsByOwner(authUser.id);
                setOrganization(orgs[0] ?? null);
            } else {
                setUser(null);
                setOrganization(null);
            }
            setLoading(false);
        }

        load();
    }, [supabase]);

    return (
        <AuthContext.Provider value={{ user, organization, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
