'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/app/context/AuthContext';

export default function RequestCountCard() {
  const { organization } = useAuth();
  const [count, setCount] = useState<number>(0);
  const supabase = createClientComponentClient();

  // İlk değeri DB'den çek
  useEffect(() => {
    if (!organization) return;

    async function fetchUsage() {
      const { data, error } = await supabase
        .from('organization_usage')
        .select('request_count')
        .eq('organization_id', organization?.id)
        .order('period_start_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setCount(data.request_count ?? 0);
      }
    }

    fetchUsage();
  }, [organization, supabase]);

  // Realtime subscription
  useEffect(() => {
    if (!organization) return;

    const channel = supabase
      .channel('realtime:usage')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'organization_usage',
          filter: `organization_id=eq.${organization.id}`,
        },
        (payload) => {
          type UsagePayload = {
            organization_id: string;
            period_start_at: string;
            request_count: number;
          };

          supabase
            .channel('org-usage')
            .on(
              'postgres_changes',
              {
                event: 'UPDATE',
                schema: 'public',
                table: 'organization_usage',
                filter: `organization_id=eq.${organization.id}`,
              },
              (payload) => {
                const data = payload.new as UsagePayload;  // ✅ Type cast
                if (data?.request_count !== undefined) {
                  setCount(data.request_count);
                }
              }
            )
            .subscribe();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organization, supabase]);

  return (
    <div className="rounded-lg bg-white p-4 shadow-md flex flex-col items-center justify-center">
      <h2 className="text-gray-500 text-sm mb-1">Request Count</h2>
      <p className="text-3xl font-bold">{count}</p>
    </div>
  );
}
