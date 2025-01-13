"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserTab from "./user-tab";
import OrganizationTab from "./org-tab";

export default function Settings() {
  const [currentTab, setCurrentTab] = useState("account");

  return (
    <div className="space-y-6">
      <Tabs
        defaultValue={currentTab}
        className="w-full bg-gray-800 rounded-lg shadow-lg p-4"
        onValueChange={(value) => setCurrentTab(value)}
      >
        <TabsList className="grid p-0 w-[400px] grid-cols-2 bg-gray-800">
          {["account", "organization"].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className={cn("text-base !text-white/50 hover:!text-white", {
                "!bg-gray-700 !text-white": currentTab === tab,
              })}
            >
              {tab === "account" ? "Account settings" : "Organization settings"}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {currentTab === "account" ? <UserTab /> : <OrganizationTab />}
    </div>
  );
}
