// app/lib/data.ts
import { getSupabaseAdmin } from '@/app/lib/supabaseAdmin';
import type { Organization, Project, ProjectForm, OrganizationUsage } from '@/app/lib/definitions';

/* -------------------------
   Organization / projects
   ------------------------- */

export async function getOrganizationsByOwner(ownerId: string): Promise<Organization[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('owner_id', ownerId)
    .eq('is_active', true);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getOrganizationById(orgId: string): Promise<Organization | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function getProjects(orgId: string): Promise<Project[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('organization_id', orgId);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createProject(payload: ProjectForm): Promise<Project> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('projects')
    .insert({
      name: payload.name,
      organization_id: payload.organization_id,
      is_active: payload.is_active ?? true,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateProject(id: string, payload: Partial<Project>): Promise<Project> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('projects')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

/* -------------------------
   Organization usage
   ------------------------- */

export async function getOrganizationUsage(orgId: string): Promise<OrganizationUsage[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('organization_usage')
    .select('*')
    .eq('organization_id', orgId)
    .order('period_start_at', { ascending: false })
    .limit(12);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function incrementOrganizationUsage(orgId: string, incrementBy = 1): Promise<void> {
  const now = new Date();
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
  const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));

  const periodStartIso = periodStart.toISOString();
  const periodEndIso = periodEnd.toISOString();

  const supabase = getSupabaseAdmin();
  const { data: existing, error: selectError } = await supabase
    .from('organization_usage')
    .select('*')
    .eq('organization_id', orgId)
    .eq('period_start_at', periodStartIso)
    .maybeSingle();

  if (selectError) throw new Error(selectError.message);

  if (!existing) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('organization_usage').insert({
      organization_id: orgId,
      period_start_at: periodStartIso,
      period_end_at: periodEndIso,
      request_count: incrementBy,
      api_calls: incrementBy,
      data_stored_mb: 0,
    });
    if (error) throw new Error(error.message);
    return;
  }

  const { error: updateError } = await supabase
    .from('organization_usage')
    .update({
      request_count: (existing.request_count ?? 0) + incrementBy,
      api_calls: (existing.api_calls ?? 0) + incrementBy,
    })
    .eq('organization_id', orgId)
    .eq('period_start_at', periodStartIso);

  if (updateError) throw new Error(updateError.message);
}
