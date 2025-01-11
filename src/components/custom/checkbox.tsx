import { Checkbox as BaseCheckbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const CustomCheckbox = ({
  ...props
}: React.ComponentProps<typeof BaseCheckbox>) => {
  return (
    <BaseCheckbox
      {...props}
      className={cn(
        "border-gray-600 bg-gray-700 size-5 data-[state=checked]:bg-blue-500",
        props.className
      )}
    />
  );
};

export { CustomCheckbox };
