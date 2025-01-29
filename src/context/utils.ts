import { Organization } from "@/lib/types";

export const getConnectionsArray = (orgData: Organization) => {
  if (!orgData.connections) return [];
  try {
    return JSON.parse(orgData.connections as unknown as string);
  } catch {
    return [];
  }
};

export const getInvitationsArray = (orgData: Organization) => {
  if (!orgData.invitations) return [];
  try {
    return JSON.parse(orgData.invitations as unknown as string);
  } catch {
    return [];
  }
};

export const processOrgData = (orgData: Organization) => {
  const connections = getConnectionsArray(orgData);
  const invitations = getInvitationsArray(orgData);
  return { ...orgData, connections, invitations };
};
