"use client";
// TODO: Switch to SSC with State Management

import { AppProvider } from "@/context";
import { AppSidebar } from "./sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 bg-navy text-white p-8">{children}</main>
      </SidebarProvider>
    </AppProvider>
  );
}
