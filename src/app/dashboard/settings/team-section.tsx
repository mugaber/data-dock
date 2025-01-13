import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CustomCheckbox } from "@/components/custom";
import { CustomTableHead } from "@/components/custom/table";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/context";
import { getOrgMembers } from "../utils";

export function TeamSection() {
  const { parentOrganization, allUsers } = useAppContext();
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const orgMembers = getOrgMembers(
    allUsers,
    parentOrganization?.members,
    parentOrganization?.owner ?? ""
  );

  const membersWithoutOwner = orgMembers?.filter(
    (member) => member?.type !== "owner"
  );

  const handleCheckboxChange = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleAllCheckBox = () => {
    if (selectedMembers.length === membersWithoutOwner.length) {
      return setSelectedMembers([]);
    }

    setSelectedMembers(membersWithoutOwner.map((member) => member.id));
  };

  return (
    <div className="space-y-6 bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Team</h2>

        <Button
          className={cn("text-base", {
            "bg-destructive": selectedMembers.length,
          })}
        >
          {selectedMembers.length ? (
            <Trash2 className="mr-1 h-4 w-4" />
          ) : (
            <Plus className="mr-1 h-4 w-4" />
          )}
          {selectedMembers.length ? "Remove" : "Add new member"}
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-none hover:bg-gray-800">
            <TableHead className="w-[35px]">
              <CustomCheckbox
                checked={
                  selectedMembers.length === membersWithoutOwner.length &&
                  membersWithoutOwner.length > 0
                }
                onClick={handleAllCheckBox}
                disabled={membersWithoutOwner.every(
                  (member) => member.type === "owner"
                )}
              />
            </TableHead>
            <CustomTableHead>name</CustomTableHead>
            <CustomTableHead>type</CustomTableHead>
            <CustomTableHead>email</CustomTableHead>
            <CustomTableHead className="w-[70px]">action</CustomTableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orgMembers?.map((member) => (
            <TableRow
              key={member?.id}
              className="border-none text-base hover:bg-gray-700"
            >
              <TableCell>
                <CustomCheckbox
                  checked={selectedMembers.includes(member.id)}
                  onClick={() => handleCheckboxChange(member.id)}
                  disabled={member.type === "owner"}
                />
              </TableCell>
              <TableCell className="text-white">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member?.avatar_url} />
                    <AvatarFallback>{member?.full_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <span>{member?.full_name}</span>
                </div>
              </TableCell>
              <TableCell className="text-white/50">{member.type}</TableCell>
              <TableCell className="text-white/50">{member.email}</TableCell>

              <TableCell className="flex justify-center">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    disabled={member.type === "owner"}
                    className="hover:bg-gray-800 !text-white"
                  >
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-gray-700 border border-gray-700 text-white"
                  >
                    <DropdownMenuItem className="text-destructive cursor-pointer">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
