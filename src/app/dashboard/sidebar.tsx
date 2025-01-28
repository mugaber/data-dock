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
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signout } from "../auth/actions";
import { useRouter } from "next/navigation";
import { settingsPath, connectionsPath, integrationsPath } from "@/lib/paths";
import { useAppContext } from "@/context";

const menuItems = [
  { icon: Database, label: "Integrations", path: integrationsPath() },
  { icon: Link2, label: "Connections", path: connectionsPath() },
  { label: "separator" },
  { icon: Settings, label: "Settings", path: settingsPath() },
];

export function AppSidebar() {
  const { toast } = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, parentOrganization } = useAppContext();

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
            {parentOrganization ? (
              parentOrganization.name
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
          <AvatarImage src={currentUser?.avatar_url} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div>
          {currentUser ? (
            <p className="text-sm truncate">{currentUser?.full_name}</p>
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
