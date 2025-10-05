// app/lib/data.ts
import { supabaseAdmin } from '@/app/lib/supabaseAdmin';
import type { Organization, Project, OrganizationUsage } from '@/app/lib/definitions';

/* -------------------------
   Organization / projects
   ------------------------- */

export async function getOrganizationsByOwner(ownerId: string): Promise<Organization[]> {
  const { data, error } = await supabaseAdmin
    .from('organizations')
    .select('*')
    .eq('owner_id', ownerId)
    .eq('is_active', true);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getOrganizationById(orgId: string): Promise<Organization | null> {
  const { data, error } = await supabaseAdmin
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function getProjects(orgId: string): Promise<Project[]> {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('organization_id', orgId);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createProject(payload: Project): Promise<Project> {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateProject(id: string, payload: Partial<Project>): Promise<Project> {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from('projects').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

/* -------------------------
   Organization usage
   ------------------------- */

export async function getOrganizationUsage(orgId: string): Promise<OrganizationUsage[]> {
  const { data, error } = await supabaseAdmin
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
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59));

  const periodStartIso = start.toISOString();
  const periodEndIso = end.toISOString();

  const { data: existing, error: selectError } = await supabaseAdmin
    .from('organization_usage')
    .select('*')
    .eq('organization_id', orgId)
    .eq('period_start_at', periodStartIso)
    .maybeSingle();

  if (selectError) throw new Error(selectError.message);

  if (!existing) {
    const { error } = await supabaseAdmin.from('organization_usage').insert({
      organization_id: orgId,
      period_start_at: periodStartIso,
      period_end_at: periodEndIso,
      request_count: incrementBy,
    });
    if (error) throw new Error(error.message);
    return;
  }

  const { error: updateError } = await supabaseAdmin
    .from('organization_usage')
    .update({
      request_count: (existing.request_count ?? 0) + incrementBy,
    })
    .eq('organization_id', orgId)
    .eq('period_start_at', periodStartIso);

  if (updateError) throw new Error(updateError.message);
}
