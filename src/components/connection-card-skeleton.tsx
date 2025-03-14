import { Skeleton } from "./ui/skeleton";
import { Card, CardContent, CardHeader } from "./ui/card";

export function ConnectionLoadingCard() {
  return (
    <Card className="bg-gray-800 border-none space-y-2">
      <CardHeader>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-40 bg-gray-700" />
            <Skeleton className="h-8 w-8 rounded-full bg-gray-700" />
          </div>
          <Skeleton className="h-3 w-24 bg-gray-700" />
        </div>
      </CardHeader>

      <CardContent className="flex w-full gap-3 justify-between items-center">
        <Skeleton className="h-9 w-full bg-gray-700" />
        <Skeleton className="h-9 w-full bg-gray-700" />
      </CardContent>
    </Card>
  );
}
