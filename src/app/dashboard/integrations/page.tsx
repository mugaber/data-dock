"use client";

import { Search } from "lucide-react";
import { CustomInput } from "@/components/custom";
import ConnectionModal from "./connection-modal";
import { useState } from "react";
import { IntegrationCardProps, integrations } from "./lib";
import IntegrationCard from "./integration-card";

export default function Integrations() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] =
    useState<IntegrationCardProps | null>(null);
  const [updatedIntegrations, setUpdatedIntegrations] = useState<string[]>([]);

  const handleEdit = (integration: IntegrationCardProps) => {
    setSelectedIntegration(integration);
    setModalOpen(true);
  };

  return (
    <div className="mx-auto max-w-[1400px] p-6 text-lg">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Integrations</h1>
          <p className="text-base text-gray-300">
            Connect to new services and platforms
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
          {integrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              {...integration}
              onEdit={() => handleEdit(integration)}
              updatedIntegrations={updatedIntegrations}
            />
          ))}
        </div>

        <ConnectionModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          integration={selectedIntegration}
          updatedIntegrations={updatedIntegrations}
          setUpdatedIntegrations={setUpdatedIntegrations}
        />
      </div>
    </div>
  );
}
