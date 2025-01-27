import { DownloadLink } from "@/components/download-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { ConnectionCardProps } from "./lib";
import { connectionStorage } from "../utils/connections";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context";

export function ConnectionCard({
  displayName,
  name,
  onEdit,
}: ConnectionCardProps) {
  const { parentOrganization } = useAppContext();
  const { apiKey } = connectionStorage(name, parentOrganization?.id) || {};
  const router = useRouter();

  return (
    <Card className="bg-gray-800 border-none">
      <CardHeader>
        <div className="flex flex-col gap-2">
          <h3 className="font-medium text-white">{displayName}</h3>
          <div className="flex gap-2">
            <Image
              src={`/icons/${name}.svg`}
              alt={name}
              className="h-6 w-6"
              width={25}
              height={25}
            />
            <p className="text-sm text-white capitalize">{name}</p>
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
        {apiKey ? (
          <Button
            variant="default"
            className="w-full text-base py-5"
            onClick={() => router.push(`/dashboard/connections/${name}`)}
          >
            View
          </Button>
        ) : (
          <DownloadLink
            fileUrl="/forecast-data.zip"
            fileName={`${name}-data.zip`}
            className="w-full text-base py-5"
          >
            Export CSV
          </DownloadLink>
        )}
      </CardContent>
    </Card>
  );
}
