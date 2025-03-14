import { User } from "@supabase/supabase-js";

export { addMemberType, getOrgMembers };

type MemberWithoutType = User & {
  full_name: string;
  avatar_url: string;
  email: string;
  organizations: {
    owner: string;
  };
  invited?: boolean;
};

export type Member = MemberWithoutType & {
  type: "owner" | "member";
};

const addMemberType = (
  members: MemberWithoutType[],
  ownerId: string
): Member[] => {
  if (!members?.length) return [];

  return members.map((member) => ({
    ...member,
    type: member?.id === ownerId ? "owner" : "member",
  }));
};

const getOrgMembers = (
  allUsers: User[],
  membersIds: string[] | undefined,
  ownerId: string
) => {
  if (!membersIds?.length || !allUsers?.length) return [];
  // TODO: get members emails
  const orgUsers = allUsers.filter((user) => membersIds.includes(user.id));
  return addMemberType(orgUsers as MemberWithoutType[], ownerId);
};
