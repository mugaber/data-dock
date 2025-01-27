"use client";

import {
  Settings,
  Link as Link2,
  ChevronsUpDown,
  Ellipsis,
  Database,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getParentOrganization, getUser } from "@/lib/supabase/actions";
import { signout } from "../auth/actions";
import { useRouter } from "next/navigation";
import { settingsPath, connectionsPath, integrationsPath } from "@/lib/paths";
import { useAppContext } from "@/context";

interface Organization {
  id: string;
  name: string;
  owner: string;
  members: string[];
  created_at: string;
  updated_at: string;
}

interface UserData {
  full_name?: string;
  email?: string;
  avatar_url?: string;
}

const menuItems = [
  { icon: Database, label: "Integrations", path: integrationsPath() },
  { icon: Link2, label: "Connections", path: connectionsPath() },
  { label: "separator" },
  { icon: Settings, label: "Settings", path: settingsPath() },
];

export function AppSidebar() {
  const { toast } = useToast();
  const pathname = usePathname();
  const [orgData, setOrgData] = useState<Organization | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const router = useRouter();
  const { setCurrentUser, setParentOrganization } = useAppContext();

  useEffect(() => {
    const getUserData = async () => {
      try {
        const { data: userInfo, error: userInfoError } =
          await createClient().auth.getUser();
        if (userInfoError) throw userInfoError;
        const userData = await getUser(userInfo.user.id);
        const orgData = await getParentOrganization(userInfo.user.id);
        // @ts-expect-error - TODO: use ORM
        setOrgData(orgData);
        setUserData(userData);
        setCurrentUser({
          ...userData,
          email: userInfo?.user?.email,
        });
        // @ts-expect-error - TODO: use ORM
        setParentOrganization(orgData);
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Something went wrong getting your user data.",
          variant: "destructive",
        });
        router.push("/");
      }
    };
    getUserData();
  }, []);

  const logout = async () => {
    try {
      await signout();
      router.push("/");
      toast({
        title: "Success",
        description: "You have been logged out.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong logging out. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <Sidebar className="p-4 bg-gray-800 text-white border-none">
      <SidebarContent>
        <div className="p-2 flex items-center justify-between">
          <h1 className="text-xl font-semibold truncate">
            {orgData ? (
              orgData.name
            ) : (
              <div className="flex min-h-7 items-center">
                <Ellipsis className="w-6 h-6 text-gray-400 animate-cpulse" />
              </div>
            )}
          </h1>
          <ChevronsUpDown className="w-5 h-5 text-gray-400" />
        </div>
        <Separator className="mb-4 bg-gray-700" />
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                if (item.label === "separator") {
                  return (
                    <Separator className="my-4 bg-gray-700" key="separator" />
                  );
                }
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "w-full py-5 hover:bg-gray-700",
                        pathname === item.path && "bg-gray-700"
                      )}
                    >
                      <Link
                        href={item.path as string}
                        className="flex items-center gap-3"
                      >
                        {item.icon && (
                          <item.icon
                            style={{ width: "1.1rem", height: "1.1rem" }}
                          />
                        )}
                        <span style={{ fontSize: "1.1rem" }}>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="mt-5 flex items-center gap-3">
        <Avatar>
          <AvatarImage src={userData?.avatar_url} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div>
          {userData ? (
            <p className="text-sm truncate">{userData?.full_name}</p>
          ) : (
            <Ellipsis className="w-5 h-5 text-gray-400 animate-cpulse" />
          )}
          <button
            onClick={() => logout()}
            className="text-sm text-gray-400 hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </Sidebar>
  );
}
