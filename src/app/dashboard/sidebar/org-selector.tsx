"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAppContext } from "@/context";
import { Organization } from "@/lib/types";

export default function OrgSelector() {
  const { allOrganizations, selectedOrganization, setSelectedOrganization } =
    useAppContext();
  const [open, setOpen] = React.useState(false);

  const handleOnSelect = (org: Organization) => {
    if (org.id !== selectedOrganization?.id) {
      setSelectedOrganization(org);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between mb-2 bg-gray-800 hover:bg-gray-700 hover:text-white text-white text-xl font-normal"
        >
          {selectedOrganization?.name
            ? selectedOrganization.name
            : "Select organization..."}
          <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0 bg-gray-800 border border-gray-700">
        <Command className="bg-transparent">
          <CommandList>
            <CommandGroup>
              {allOrganizations.map((org) => (
                <CommandItem
                  key={org.id}
                  value={org.id}
                  onSelect={() => handleOnSelect(org)}
                  className="cursor-pointer text-white"
                >
                  {org.name}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedOrganization?.id === org.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
