import { useEffect } from "react";
import { useAppContext } from "@/context";
import {
  updateOrganizationInvitations,
  addMemberToOrganization,
} from "@/lib/supabase/actions";
import { toast } from "@/hooks/use-toast";

// TODO: Make this hook more reliable only checking data and showing toast once

export const useSyncInvitations = () => {
  const { parentOrganization, allUsers, refetchCurrentOrg } = useAppContext();

  const orgId = parentOrganization?.id ?? "";

  useEffect(() => {
    const syncInvitations = async () => {
      const invitations = parentOrganization?.invitations ?? [];

      if (!invitations?.length || !allUsers?.length) return;

      try {
        const matchedUsers = allUsers.filter((user) =>
          invitations?.some(
            (invitation) =>
              invitation.email.toLowerCase() === user.email?.toLowerCase()
          )
        );

        if (!matchedUsers.length) return;

        const updatedInvitations = invitations.filter(
          (invitation) =>
            !matchedUsers.some(
              (user) =>
                user.email?.toLowerCase() === invitation.email.toLowerCase()
            )
        );

        const newMembersIds = matchedUsers.map((user) => user.id);

        await Promise.all([
          updateOrganizationInvitations(orgId, updatedInvitations),
          addMemberToOrganization(newMembersIds, orgId),
        ]);

        refetchCurrentOrg();

        toast({
          title: "Members synchronized",
          description: `${matchedUsers.length} invited user(s) have been added as members.`,
        });
      } catch (error) {
        console.error("Failed to sync invitations:", error);
        toast({
          title: "Sync failed",
          description: "Failed to synchronize invited members.",
          variant: "destructive",
        });
      }
    };

    syncInvitations();
  }, [orgId, allUsers, parentOrganization?.invitations, refetchCurrentOrg]);
};
