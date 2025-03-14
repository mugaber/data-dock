import { getOrgMembers } from "./organization";
import { convertToCSV, downloadCSV } from "./csv";
import { Organization } from "@/lib/types";

export { getOrgMembers, convertToCSV, downloadCSV };

export const getInvitationsUsers = (orgData: Organization) => {
  if (!orgData?.invitations?.length) return [];

  return orgData.invitations.map((invitation) => ({
    id: invitation.email,
    full_name: invitation.email,
    email: invitation.email,
    type: "member",
    invited: true,
    avatar_url:
      "https://www.gravatar.com/avatar/3b3be63a4c2a439b013787725dfce802?d=identicon",
  }));
};
