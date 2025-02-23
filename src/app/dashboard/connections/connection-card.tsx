import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { ConnectionCardProps } from "./lib";
import { Settings } from "lucide-react";
import { useState } from "react";
import { handleSync } from "./lib/sync";
import { Progress } from "@/components/ui/progress";

// TODO: Move the sync data to the Context to avoid losing sync progress on page switch

export default function ConnectionCard({
  type,
  name,
  connectionUrl,
  apiKey,
  onEdit,
  onDock,
}: ConnectionCardProps) {
  const [syncProgress, setSyncProgress] = useState(0);

  const handleSyncButton = async () => {
    await handleSync({
      setSyncProgress,
      connection: {
        type,
        name,
        connectionUrl,
        apiKey,
      },
    });
  };

  return (
    <Card className="bg-gray-800 border-none">
      <CardHeader>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-white">{name}</h3>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-gray-300 hover:bg-gray-800"
              onClick={onEdit}
              disabled={syncProgress > 0}
            >
              <Settings className="!h-6 !w-6" />
            </Button>
          </div>
          <div className="flex gap-1 items-center">
            <Image
              src={`/icons/${type}.svg`}
              alt={type || ""}
              className="h-6 w-6"
              width={24}
              height={24}
            />
            <p className="text-base text-gray-300 capitalize">{type || ""}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid grid-cols-2 gap-3">
        <div className="relative">
          <Button
            variant="default"
            className="w-full disabled:opacity-100 overflow-hidden bg-blue-600 hover:bg-blue-700"
            onClick={handleSyncButton}
            disabled={syncProgress > 0}
          >
            <span className="relative z-10">
              {syncProgress === 0 ? "Sync" : `Syncing: ${syncProgress}%`}
            </span>
            {syncProgress > 0 && (
              <Progress
                value={syncProgress}
                className="absolute inset-0 h-full rounded-md bg-blue-500 transition-all duration-300"
              />
            )}
          </Button>
        </div>

        <Button
          variant="default"
          className="w-full bg-blue-600 hover:bg-blue-700"
          onClick={onDock}
          disabled={syncProgress > 0}
        >
          Dock
        </Button>
      </CardContent>
    </Card>
  );
}
