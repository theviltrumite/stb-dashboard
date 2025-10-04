// app/lib/definitions.ts
// Types for Supabase schema (PostgreSQL tables)

export type Organization = {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  is_active: boolean;
};

export type Project = {
  id: string;
  name: string;
  organization_id: string;
  created_at: string;
  is_active: boolean;
};

export type OrganizationUsage = {
  organization_id: string;
  period_start_at: string; // timestamp with time zone
  period_end_at: string;
  request_count: number;
};

// Joined version for dashboard overview
export type OrganizationOverview = {
  organization: Organization;
  projects: Project[];
  usage: OrganizationUsage[];
};

// Authenticated user (from Supabase.auth)
export type AuthUser = {
  id: string;
  email: string;
};

// Form schemas
export type ProjectForm = {
  name: string;
  organization_id: string;
  is_active?: boolean;
};
