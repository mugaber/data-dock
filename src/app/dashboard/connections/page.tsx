"use client";

import { Search } from "lucide-react";
import { CustomInput } from "@/components/custom";
import SettingsModal from "./settings-modal";
import { useState } from "react";
import { ConnectionCardProps, connections } from "./lib";
import ConnectionCard from "./connection-card";
import DockModal from "./dock-modal";

export default function Connections() {
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
    <div className="mx-auto max-w-[1400px] p-6 text-lg">
      <div className="flex flex-col gap-6">
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
          {connections.map((connection) => (
            <ConnectionCard
              key={connection.id}
              {...connection}
              onEdit={() => handleEdit(connection)}
              onDock={() => handleDock(connection)}
            />
          ))}
        </div>

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
