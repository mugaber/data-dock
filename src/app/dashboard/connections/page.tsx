"use client";

import { Search } from "lucide-react";
import { CustomInput } from "@/components/custom";
import { CredentialsModal } from "./credentials-modal";
import { useState } from "react";
import { ConnectionCardProps, connections } from "./lib";
import { ConnectionCard } from "./connection-card";

export default function Connections() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] =
    useState<ConnectionCardProps | null>(null);

  const handleEdit = (connection: ConnectionCardProps) => {
    setSelectedConnection(connection);
    setModalOpen(true);
  };

  return (
    <div className="mx-auto max-w-[1400px] p-6 text-lg">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Connections</h1>
          <p className="text-base text-gray-300">
            Your integration connections
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <CustomInput
            type="text"
            placeholder="Search"
            className="w-full pl-10 bg-gray-800 border-gray-700"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {connections.map((connection) => (
            <ConnectionCard
              key={connection.id}
              {...connection}
              onEdit={() => handleEdit(connection)}
            />
          ))}
        </div>

        <CredentialsModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          connection={selectedConnection}
        />
      </div>
    </div>
  );
}
