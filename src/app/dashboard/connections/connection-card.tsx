import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { ConnectionCardProps } from "./lib";
import { Settings } from "lucide-react";

export default function ConnectionCard({
  type,
  name,
  onEdit,
  onDock,
}: ConnectionCardProps) {
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
            >
              <Settings className="!h-6 !w-6" />
            </Button>
          </div>
          <div className="flex gap-1 items-center">
            <Image
              src={`/icons/${type}.svg`}
              alt={type}
              className="h-6 w-6"
              width={24}
              height={24}
            />
            <p className="text-base text-gray-300 capitalize">{type}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex gap-3">
        <Button
          variant="default"
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          Sync
        </Button>
        <Button
          variant="default"
          className="flex-1 bg-blue-600 hover:bg-blue-700"
          onClick={onDock}
        >
          Dock
        </Button>
      </CardContent>
    </Card>
  );
}
