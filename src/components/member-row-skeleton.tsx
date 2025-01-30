import { Skeleton } from "./ui/skeleton";
import { TableCell, TableRow } from "./ui/table";

export default function MemberRowSkeleton() {
  return (
    <TableRow className="mt-4 border-none">
      <TableCell>
        <Skeleton className="h-6 w-6 bg-gray-700" />
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-11 w-11 rounded-full bg-gray-700" />
          <Skeleton className="h-4 w-40 bg-gray-700" />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16 bg-gray-700 mt-1" />
      </TableCell>
      <TableCell className="flex justify-start h-14 items-center mt-1">
        <Skeleton className="h-4 w-56 bg-gray-700" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-3 w-5 bg-gray-700 ml-4" />
      </TableCell>
    </TableRow>
  );
}
