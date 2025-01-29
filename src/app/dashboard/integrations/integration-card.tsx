import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { IntegrationCardProps } from "./lib";

export default function IntegrationCard({
  name,
  type,
  onEdit,
}: IntegrationCardProps) {
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
        <Button
          variant="default"
          className="w-full text-base py-5"
          onClick={onEdit}
        >
          Connect
        </Button>
      </CardContent>
    </Card>
  );
}
