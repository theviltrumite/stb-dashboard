// app/lib/actions.ts
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/app/lib/supabaseAdmin';
import { createProject as createProjectRecord, updateProject as updateProjectRecord, deleteProject as deleteProjectRecord } from './data';
import type { ProjectForm } from './definitions';

/**
 * Zod schema for project create/update
 */
const ProjectSchema = z.object({
    name: z.string().min(2, 'Project name must be at least 2 characters.'),
    organization_id: z.string().uuid(),
    is_active: z.boolean().optional(),
});

/**
 * Create a project (server action).
 * Expects formData from a Next.js form action or direct payload.
 */
export async function createProjectAction(formData: FormData | Record<string, any>) {
    // normalize
    const raw = formData instanceof FormData ? Object.fromEntries(formData.entries()) : formData;

    const parsed = ProjectSchema.safeParse({
        name: raw.name,
        organization_id: raw.organization_id,
        is_active: raw.is_active === 'true' || raw.is_active === true,
    });

    if (!parsed.success) {
        return { errors: parsed.error.flatten().fieldErrors, message: 'Invalid project data.' };
    }

    try {
        await createProjectRecord(parsed.data as ProjectForm);
    } catch (err) {
        return { message: `Database error: ${(err as Error).message}` };
    }

    // revalidate and redirect to organization's dashboard overview (adjust path as you use)
    revalidatePath('/dashboard');
    redirect('/dashboard');
}

/**
 * Update project action
 */
export async function updateProjectAction(id: string, formData: FormData | Record<string, any>) {
    const raw = formData instanceof FormData ? Object.fromEntries(formData.entries()) : formData;

    const parsed = ProjectSchema.partial({ name: true }).safeParse({
        name: raw.name,
        organization_id: raw.organization_id,
        is_active: raw.is_active === 'true' || raw.is_active === true,
    });

    if (!parsed.success) {
        return { errors: parsed.error.flatten().fieldErrors, message: 'Invalid project data.' };
    }

    try {
        await updateProjectRecord(id, parsed.data as Partial<ProjectForm>);
    } catch (err) {
        return { message: `Database error: ${(err as Error).message}` };
    }

    revalidatePath('/dashboard');
    redirect('/dashboard');
}

/**
 * Delete project action
 */
export async function deleteProjectAction(id: string) {
    try {
        await deleteProjectRecord(id);
    } catch (err) {
        return { message: `Database error: ${(err as Error).message}` };
    }
    revalidatePath('/dashboard');
    redirect('/dashboard');
}

/**
 * Track usage (increment) — convenience server action for UI to call.
 * You might also call incrementOrganizationUsage directly from an API route that validates the user's access token.
 */
import { incrementOrganizationUsage } from './data';

export async function trackUsageAction(organizationId: string, increment = 1) {
    try {
        await incrementOrganizationUsage(organizationId, increment);
    } catch (err) {
        return { message: `Failed to track usage: ${(err as Error).message}` };
    }
    revalidatePath('/dashboard');
    return { ok: true };
}