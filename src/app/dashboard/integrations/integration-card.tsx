import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { IntegrationCardProps } from "./lib";
import { useAppContext } from "@/context";
import { Skeleton } from "@/components/ui/skeleton";

export default function IntegrationCard({
  name,
  type,
  onEdit,
}: IntegrationCardProps) {
  const { selectedOrganization, currentUser } = useAppContext();

  const isOrgOwner = selectedOrganization?.owner === currentUser?.id;

  return (
    <Card className="bg-gray-800 border-none">
      <CardHeader className="flex flex-row justify-between">
        <div className="flex gap-2 items-center">
          <Image
            src={`/icons/${name}.svg`}
            alt={type}
            className="h-6 w-6"
            width={25}
            height={25}
          />
          <h3 className="font-medium text-white capitalize">{name}</h3>
        </div>

        <span className="text-sm text-gray-200 bg-gray-700 px-2 py-1 rounded-md">
          {type}
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {selectedOrganization?.id ? (
          <Button
            variant="default"
            className="w-full text-base py-5  disabled:cursor-default"
            onClick={onEdit}
            disabled={!isOrgOwner}
          >
            Connect
          </Button>
        ) : (
          <Skeleton className="w-full h-10 bg-gray-700" />
        )}
      </CardContent>
    </Card>
  );
}
