import { AppSidebar } from "./sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 bg-navy text-white p-8">{children}</main>
    </SidebarProvider>
  );
}
