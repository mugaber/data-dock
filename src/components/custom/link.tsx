import { cn } from "@/lib/utils";
import { Button as BaseButton } from "@/components/ui/button";
import { ComponentProps } from "react";

const linkStyles = cn(
  "text-blue-500 hover:text-blue-500/90 hover:no-underline",
  "transition-colors duration-200",
  "text-lg cursor-pointer p-0",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  "disabled:pointer-events-none disabled:opacity-50"
);

const CustomLink = ({
  className,
  ...props
}: ComponentProps<typeof BaseButton>) => {
  return (
    <BaseButton
      variant="link"
      {...props}
      className={cn(linkStyles, className)}
    />
  );
};

export { CustomLink };
