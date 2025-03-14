"use client";

import {
  getAllUsers,
  getOrganizations,
  getParentOrganization,
  getUser,
} from "@/lib/supabase/actions";
import { User } from "@supabase/supabase-js";
import { useContext, useState, createContext, useEffect } from "react";
import { CurrentUser, Organization } from "@/lib/types";
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { processOrgData } from "./utils";

interface AppContextType {
  currentUser: CurrentUser | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<CurrentUser | null>>;
  parentOrganization: Organization | null;
  setParentOrganization: React.Dispatch<
    React.SetStateAction<Organization | null>
  >;
  allUsers: User[];
  refetchAllUsers: () => void;
  refetchCurrentOrg: () => void;
  allOrganizations: Organization[];
  selectedOrganization: Organization | null;
  setSelectedOrganization: React.Dispatch<
    React.SetStateAction<Organization | null>
  >;
}

const AppContext = createContext<AppContextType>({
  currentUser: null,
  setCurrentUser: () => {},
  parentOrganization: null,
  setParentOrganization: () => {},
  allUsers: [],
  refetchAllUsers: () => {},
  refetchCurrentOrg: () => {},
  allOrganizations: [],
  selectedOrganization: null,
  setSelectedOrganization: () => {},
});

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [parentOrganization, setParentOrganization] =
    useState<Organization | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);

  const [refetchUsers, setRefetchUsers] = useState(false);
  const [refetchOrg, setRefetchOrg] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: userInfo, error: userInfoError } =
          await supabase.auth.getUser();

        if (userInfoError) throw userInfoError;

        const userData = await getUser(userInfo.user.id);
        setCurrentUser({
          ...userData,
          email: userInfo?.user?.email,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Something went wrong getting your data.";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        router.push("/");
      }
    };
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchOrgData = async () => {
      if (!currentUser?.id) return;
      const orgData = await getParentOrganization(currentUser?.id);
      const processedOrgData = processOrgData(orgData);
      setParentOrganization(processedOrgData);
      setSelectedOrganization(processedOrgData);
    };
    fetchOrgData();
  }, [currentUser?.id, refetchOrg]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      const users = await getAllUsers();
      setAllUsers(users || []);
    };
    fetchAllUsers();
  }, [parentOrganization?.id, refetchUsers]);

  useEffect(() => {
    const fetchAllOrganizations = async () => {
      const orgIds = currentUser?.organizations;
      if (!orgIds?.length) return;

      const organizations = await getOrganizations(orgIds);
      const processedOrganizations = organizations.map((org) =>
        processOrgData(org)
      );
      setAllOrganizations(processedOrganizations || []);
    };
    fetchAllOrganizations();
  }, [currentUser?.id, currentUser, refetchOrg]);

  const refetchCurrentOrg = () => setRefetchOrg((prev) => !prev);
  const refetchAllUsers = () => setRefetchUsers((prev) => !prev);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        parentOrganization,
        setParentOrganization,
        allUsers,
        allOrganizations,
        selectedOrganization,
        setSelectedOrganization,
        refetchCurrentOrg,
        refetchAllUsers,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
