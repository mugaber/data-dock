import { Input as BaseInput } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const CustomInput = ({ ...props }: React.ComponentProps<typeof BaseInput>) => {
  return (
    <BaseInput
      {...props}
      style={{ fontSize: "1.1rem" }}
      className={cn(
        `
          bg-gray-700 border-gray-600 text-white 
          placeholder:text-gray-400 h-12 text-lg
          [&:not(:placeholder-shown)]:!bg-gray-700
          [&:-webkit-autofill]:!bg-gray-700
          [&:-webkit-autofill:hover]:!bg-gray-700
          [&:-webkit-autofill:focus]:!bg-gray-700
          [&:-webkit-autofill:active]:!bg-gray-700
          [&:-webkit-autofill]:[transition-delay:9999s]
          [&:-webkit-autofill]:[-webkit-text-fill-color:white]
          [&:-webkit-autofill]:![font-size:1.1rem]
        `,
        props.className
      )}
    />
  );
};

export { CustomInput };
