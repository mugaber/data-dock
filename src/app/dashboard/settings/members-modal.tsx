import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/context";
import { addMemberToOrganization } from "@/lib/supabase/actions";
import { useToast } from "@/hooks/use-toast";

export default function MembersModal() {
  const { allUsers, parentOrganization, refetchAllUsers } = useAppContext();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAddMember = async () => {
    const newUser = allUsers.find((user) => user.email === email);
    const isUserAlreadyInOrg = parentOrganization?.members?.includes(
      newUser?.id ?? ""
    );

    if (isUserAlreadyInOrg) {
      toast({
        title: "Warning",
        description: "User already exists in the organization",
      });
      return;
    }

    setLoading(true);
    try {
      await addMemberToOrganization(
        newUser?.id || "",
        parentOrganization?.id || ""
      );
      refetchAllUsers();
      toast({
        title: "Member added",
        description: "The member has been added to the organization",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setEmail("");
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="text-base">
          <Plus className="mr-1 h-4 w-4" />
          Add new member
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] bg-[#1a1b1e] border-0 rounded-xl text-white">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl font-semibold">
            Add new member
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Add a new member to your organization.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 px-6 py-4">
          <div className="grid grid-cols-5 items-center gap-4">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-slate-300"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-4 bg-[#141517] border-0 rounded-lg text-white
                focus-visible:ring-1 focus-visible:ring-slate-500
              "
            />
          </div>
          <div className="grid grid-cols-5 items-center gap-4">
            <Label
              htmlFor="role"
              className="text-sm font-medium text-slate-300"
            >
              Role
            </Label>
            <Input
              id="role"
              value="member"
              disabled
              className="col-span-4 bg-[#141517] border-0 rounded-lg text-white 
                focus-visible:ring-1 focus-visible:ring-slate-500"
            />
          </div>
        </div>
        <DialogFooter className="px-6 pb-6">
          <Button
            type="submit"
            disabled={!email.length || loading}
            onClick={handleAddMember}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              "Add"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
