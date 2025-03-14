import { cn } from "@/lib/utils";
import { TableHead } from "../ui/table";

const CustomTableHead = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <TableHead className={cn("text-white/50 uppercase", className)}>
      {children}
    </TableHead>
  );
};

export { CustomTableHead };
