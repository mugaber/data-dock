import { createClient } from "./client";

export const getParentOrganization = async (userId: string) => {
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
