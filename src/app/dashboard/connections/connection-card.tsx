import { DownloadLink } from "@/components/download-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { ConnectionCardProps } from "./lib";

export function ConnectionCard({ name, type, onEdit }: ConnectionCardProps) {
  return (
    <Card className="bg-gray-800 border-none">
      <CardHeader>
        <div className="flex flex-col gap-2">
          <h3 className="font-medium text-white">{name}</h3>
          <div className="flex gap-2">
            <Image
              src={`/icons/${type}.svg`}
              alt={type}
              className="h-6 w-6"
              width={25}
              height={25}
            />
            <p className="text-sm text-white capitalize">{type}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button
          variant="default"
          className="w-full text-base py-5"
          onClick={onEdit}
        >
          Edit
        </Button>
        <DownloadLink
          fileUrl="/forecast-data.zip"
          fileName={`${type}-data.zip`}
          className="w-full text-base py-5"
        >
          Export CSV
        </DownloadLink>
      </CardContent>
    </Card>
  );
}
