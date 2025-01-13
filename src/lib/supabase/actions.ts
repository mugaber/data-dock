import { User } from "@supabase/supabase-js";
import { createClient } from "./client";
import { Organization } from "../types";

export {
  getParentOrganization,
  getOrgUsers,
  updateUser,
  getAllUsers,
  getUser,
  updateOrganization,
};

const getParentOrganization = async (userId: string) => {
  const { data, error } = await createClient()
    .from("users")
    .select(
      `
			organizations (
				id,
				name,
				owner,
				members,
				created_at,
				updated_at
			)
		`
    )
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data.organizations;
};

const getAllUsers = async () => {
  const { data, error } = await createClient().from("users").select(`
    *,
    organizations(*)
  `);
  if (error) throw error;
  return data;
};

const getUser = async (userId: string) => {
  const { data, error } = await createClient()
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
};

const getOrgUsers = async (organizationId: string) => {
  if (!organizationId) return [];
  const { data, error } = await createClient()
    .from("users")
    .select("*, organizations(*)")
    .eq("organizations.id", organizationId);

  if (error) throw error;
  return data;
};

type UpdateUser = Partial<User> & {
  full_name: string;
};

const updateUser = async (userId: string, data: UpdateUser) => {
  const { error } = await createClient()
    .from("users")
    .update(data)
    .eq("id", userId);

  if (error) throw error;
  return data;
};

const updateOrganization = async (
  organizationId: string,
  data: Organization
) => {
  const { error } = await createClient()
    .from("organizations")
    .update(data)
    .eq("id", organizationId);
  if (error) throw error;
  return data;
};
