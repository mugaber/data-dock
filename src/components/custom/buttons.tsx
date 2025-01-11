import { Button as BaseButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PrimaryButton = ({
  ...props
}: React.ComponentProps<typeof BaseButton>) => {
  return (
    <BaseButton
      {...props}
      className={cn(
        "bg-primary hover:bg-primary/90 text-lg text-white h-12",
        props.className
      )}
    />
  );
};

export { PrimaryButton };
