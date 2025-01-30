"use client";

import { Search } from "lucide-react";
import { CustomInput } from "@/components/custom";
import SettingsModal from "./settings-modal";
import { useState } from "react";
import { ConnectionCardProps } from "./lib";
import ConnectionCard from "./connection-card";
import DockModal from "./dock-modal";
import { useAppContext } from "@/context";
import { ConnectionLoadingCard } from "@/components/connection-card-skeleton";
import Image from "next/image";
export default function Connections() {
  const { parentOrganization } = useAppContext();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDockOpen, setIsDockOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] =
    useState<ConnectionCardProps | null>(null);

  const handleEdit = (connection: ConnectionCardProps) => {
    setSelectedConnection(connection);
    setIsSettingsOpen(true);
  };

  const handleDock = (connection: ConnectionCardProps) => {
    setSelectedConnection(connection);
    setIsDockOpen(true);
  };

  return (
    <div className="mx-auto h-full max-w-[1400px] p-6 text-lg">
      <div className="flex flex-col h-full gap-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Connections</h1>
          <p className="text-base text-gray-300">
            Your integration connections
          </p>
        </div>

        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <CustomInput
            type="text"
            placeholder="Search"
            className="w-full pl-10 bg-gray-800 border-gray-700"
          />
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {!parentOrganization?.name &&
            Array(4)
              .fill(0)
              .map((_, index) => <ConnectionLoadingCard key={index} />)}

          {parentOrganization?.connections?.map((connection) => (
            <ConnectionCard
              key={connection.name}
              name={connection.name}
              type={connection.type}
              onEdit={() => handleEdit(connection)}
              onDock={() => handleDock(connection)}
            />
          ))}
        </div>

        {parentOrganization?.connections?.length === 0 && (
          <div className="flex w-full h-full flex-col items-center justify-center gap-8">
            <Image
              src="/server-status.svg"
              alt="No connections"
              width={500}
              height={500}
              priority
              className="dark:invert"
            />

            <div className="flex flex-col items-center justify-center w-full text-base">
              <p className="text-gray-400 text-center">
                You don&apos;t have any connection.
              </p>
              <p className="text-gray-400 text-center">
                Go to integrations to connect and start syncing your data.
              </p>
            </div>
          </div>
        )}

        <DockModal
          open={isDockOpen}
          onOpenChange={setIsDockOpen}
          connection={selectedConnection}
        />

        <SettingsModal
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          connection={selectedConnection}
        />
      </div>
    </div>
  );
}
