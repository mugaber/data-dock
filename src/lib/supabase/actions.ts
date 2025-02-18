import { User } from "@supabase/supabase-js";
import { Organization, Connection, Invitation } from "../types";
import { supabase } from "./client";

export {
  getParentOrganization,
  getOrgUsers,
  updateUser,
  getAllUsers,
  getUser,
  updateOrganization,
  addMemberToOrganization,
  removeMembersFromOrganization,
  updateOrganizationConnections,
  updateOrganizationInvitations,
  getOrganizations,
};

const getParentOrganization = async (userId: string) => {
  const { data, error } = await supabase
    .from("users")
    .select(
      `
			organizations (
				id,
				name,
				owner,
				members,
				created_at,
				updated_at,
        connections,
        invitations
			)
		`
    )
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data.organizations as unknown as Organization;
};

const getAllUsers = async () => {
  const { data, error } = await supabase.from("users").select("*");

  if (error) {
    console.error("Error fetching users:", error);
    return null;
  } else {
    return data;
  }
};

const getUser = async (userId: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
};

const getOrgUsers = async (organizationId: string) => {
  if (!organizationId) return [];
  const { data, error } = await supabase
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
  const { error } = await supabase.from("users").update(data).eq("id", userId);

  if (error) throw error;
  return data;
};

// ORGANIZATIONS

const getOrganizations = async (orgIds: string[]) => {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .in("id", orgIds);
  if (error) throw error;
  return data;
};

const updateOrganization = async (
  organizationId: string,
  data: Organization
) => {
  const { error } = await supabase
    .from("organizations")
    .update(data)
    .eq("id", organizationId);
  if (error) throw error;
  return data;
};

const updateOrganizationConnections = async (
  organizationId: string,
  connections: Connection[]
) => {
  const { error } = await supabase
    .from("organizations")
    .update({
      connections: JSON.stringify(connections),
    })
    .eq("id", organizationId);

  if (error) throw error;
  return { success: true };
};

const updateOrganizationInvitations = async (
  organizationId: string,
  invitations: Invitation[]
) => {
  const { error } = await supabase
    .from("organizations")
    .update({ invitations: JSON.stringify(invitations) })
    .eq("id", organizationId);

  if (error) throw error;
  return { success: true };
};

// MEMBERS

const addMemberToOrganization = async (
  userIds: string[],
  organizationId: string
) => {
  if (!userIds?.length || !organizationId) return;

  const { data: orgData, error: fetchError } = await supabase
    .from("organizations")
    .select("members")
    .eq("id", organizationId)
    .single();

  if (fetchError) {
    return Error("Error fetching organization");
  }

  const updatedMembers = [...orgData.members, ...userIds];

  const { error: updateOrgError } = await supabase
    .from("organizations")
    .update({ members: updatedMembers })
    .eq("id", organizationId);

  if (updateOrgError) throw updateOrgError;

  return { success: true };
};

const removeMembersFromOrganization = async (
  organizationId: string,
  membersToRemove: string[]
) => {
  if (!organizationId || !membersToRemove?.length) return;

  const { data: orgData, error: fetchError } = await supabase
    .from("organizations")
    .select("members")
    .eq("id", organizationId)
    .single();

  if (fetchError) {
    return Error("Error fetching organization");
  }

  const updatedMembers = orgData?.members?.filter(
    (member: string) => !membersToRemove.includes(member)
  );

  const { data, error } = await supabase
    .from("organizations")
    .update({ members: updatedMembers })
    .eq("id", organizationId);

  if (error) throw error;
  return data;
};
