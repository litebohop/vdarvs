import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types/common.types";
import type { User } from "@/types/entities.types";

type DbProfile = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  village: string | null;
  district: string | null;
  chief_id: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
};

function mapProfile(row: DbProfile): User {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    village: row.village ?? undefined,
    district: row.district ?? undefined,
    chiefId: row.chief_id ?? undefined,
    phone: row.phone ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
    createdAt: row.created_at,
  };
}

export async function insertProfile(input: {
  id: string;
  email: string;
  fullName: string;
  role?: UserRole;
}): Promise<User> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: input.id,
      email: input.email,
      full_name: input.fullName,
      role: input.role ?? "citizen",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapProfile(data as DbProfile);
}

export async function updateProfile(
  id: string,
  patch: {
    fullName?: string;
    village?: string;
    district?: string;
    phone?: string;
  },
): Promise<User> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...(patch.fullName ? { full_name: patch.fullName } : {}),
      ...(patch.village ? { village: patch.village } : {}),
      ...(patch.district ? { district: patch.district } : {}),
      ...(patch.phone ? { phone: patch.phone } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapProfile(data as DbProfile);
}

export async function updateProfileRole(
  id: string,
  role: UserRole,
): Promise<User> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapProfile(data as DbProfile);
}

export async function fetchChiefProfileByChiefId(
  chiefId: string,
): Promise<User | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("chief_id", chiefId)
    .eq("role", "village_chief")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapProfile(data as DbProfile) : null;
}
