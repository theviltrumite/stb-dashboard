// app/lib/data.ts
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type {
  Organization,
  Project,
  OrganizationUsage,
  ProjectForm,
} from './definitions';

export async function getOrganizationsByOwner(ownerId: string): Promise<Organization[]> {
  const { data, error } = await supabaseAdmin
    .from<Organization>('organizations')
    .select('*')
    .eq('owner_id', ownerId)
    .eq('is_active', true);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getOrganizationById(orgId: string): Promise<Organization | null> {
  const { data, error } = await supabaseAdmin
    .from<Organization>('organizations')
    .select('*')
    .eq('id', orgId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function getProjects(orgId: string): Promise<Project[]> {
  const { data, error } = await supabaseAdmin
    .from<Project>('projects')
    .select('*')
    .eq('organization_id', orgId);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createProject(payload: ProjectForm): Promise<Project> {
  const { data, error } = await supabaseAdmin
    .from<Project>('projects')
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

export async function updateProject(id: string, payload: Partial<ProjectForm>): Promise<Project> {
  const { data, error } = await supabaseAdmin
    .from<Project>('projects')
    .update({
      name: payload.name,
      is_active: payload.is_active,
    })
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

/**
 * Get usage rows for an organization (ordered desc by period_start_at)
 */
export async function getOrganizationUsage(orgId: string): Promise<OrganizationUsage[]> {
  const { data, error } = await supabaseAdmin
    .from<OrganizationUsage>('organization_usage')
    .select('*')
    .eq('organization_id', orgId)
    .order('period_start_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Increment usage for the current monthly period.
 * - If a row exists for (organization_id, period_start_at) => update request_count & api_calls
 * - Otherwise insert a new row with period_start_at = start of month UTC
 */
export async function incrementOrganizationUsage(orgId: string, incrementBy = 1): Promise<void> {
  // Calculate period boundaries in UTC (start and end of current month)
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));

  const periodStartIso = start.toISOString();
  const periodEndIso = end.toISOString();

  // Check if exists
  const { data: existing, error: selErr } = await supabaseAdmin
    .from('organization_usage')
    .select('*')
    .eq('organization_id', orgId)
    .eq('period_start_at', periodStartIso)
    .maybeSingle();

  if (selErr) throw new Error(selErr.message);

  if (!existing) {
    const { error: insErr } = await supabaseAdmin.from('organization_usage').insert({
      organization_id: orgId,
      period_start_at: periodStartIso,
      period_end_at: periodEndIso,
      request_count: incrementBy,
      api_calls: incrementBy,
      data_stored_mb: 0,
    });
    if (insErr) throw new Error(insErr.message);
  } else {
    const { error: updErr } = await supabaseAdmin
      .from('organization_usage')
      .update({
        request_count: (existing.request_count ?? 0) + incrementBy,
        api_calls: (existing.api_calls ?? 0) + incrementBy,
      })
      .eq('organization_id', orgId)
      .eq('period_start_at', periodStartIso);
    if (updErr) throw new Error(updErr.message);
  }
}
