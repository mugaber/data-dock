import { Label as BaseLabel } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const CustomLabel = ({ ...props }: React.ComponentProps<typeof BaseLabel>) => {
  return (
    <BaseLabel
      {...props}
      className={cn("text-white text-lg", props.className)}
    />
  );
};

export { CustomLabel };
