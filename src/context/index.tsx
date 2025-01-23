import { getAllUsers } from "@/lib/supabase/actions";
import { User } from "@supabase/supabase-js";
import { useContext, useState, createContext, useEffect } from "react";
import { CurrentUser, Organization } from "@/lib/types";

interface AppContextType {
  currentUser: CurrentUser | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<CurrentUser | null>>;
  parentOrganization: Organization | null;
  setParentOrganization: React.Dispatch<
    React.SetStateAction<Organization | null>
  >;
  allUsers: User[];
  refetchAllUsers: () => void;
}

const AppContext = createContext<AppContextType>({
  currentUser: null,
  setCurrentUser: () => {},
  parentOrganization: null,
  setParentOrganization: () => {},
  allUsers: [],
  refetchAllUsers: () => {},
});

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [parentOrganization, setParentOrganization] =
    useState<Organization | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [refetchUsers, setRefetchUsers] = useState(false);

  const refetchAllUsers = () => setRefetchUsers((prev) => !prev);

  useEffect(() => {
    const fetchAllUsers = async () => {
      const users = await getAllUsers();
      setAllUsers(users || []);
    };
    fetchAllUsers();
  }, [parentOrganization?.id, refetchUsers]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        parentOrganization,
        setParentOrganization,
        allUsers,
        refetchAllUsers,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
