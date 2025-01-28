"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CustomInput } from "@/components/custom";
import { useAppContext } from "@/context";
import { updateUser } from "@/lib/supabase/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
export default function UserTab() {
  const { currentUser, setCurrentUser, refetchAllUsers } = useAppContext();
  const [editState, setEditState] = useState({
    show: false,
    loading: false,
  });
  const [userName, setUserName] = useState(currentUser?.full_name || "");
  const userEmail = currentUser?.email || "";
  const { toast } = useToast();

  useEffect(() => {
    setUserName(currentUser?.full_name || "");
  }, [currentUser]);

  const handleCancel = () => {
    setUserName(currentUser?.full_name || "");
    setEditState({ show: false, loading: false });
  };

  const handleChangeName = async () => {
    setEditState((prev) => ({ ...prev, loading: true }));
    try {
      await updateUser(currentUser?.id ?? "", {
        full_name: userName,
      });
      setCurrentUser((prev) => {
        if (!prev) return null;
        return { ...prev, full_name: userName };
      });
      toast({
        title: "Success",
        description: "Your name has been updated successfully",
      });
      refetchAllUsers();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setEditState({ show: false, loading: false });
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-6">Account information</h2>
      <div className="space-y-2">
        {editState.show ? (
          <div className="flex flex-col gap-2">
            <Label className="text-base" htmlFor="name">
              Account name
            </Label>
            <CustomInput
              id="name"
              type="text"
              required
              autoFocus
              value={userName}
              placeholder="Change your account name"
              onChange={(e) => setUserName(e.target.value)}
            />

            <Label className="text-base mt-2" htmlFor="email">
              Account email
            </Label>
            <CustomInput
              id="email"
              type="email"
              value={userEmail}
              disabled
              placeholder="Change your account email"
              onChange={() => {}}
            />

            <Separator className="!my-4 bg-gray-700" />
            <div className="flex gap-4">
              <Button
                className="text-base"
                onClick={handleChangeName}
                disabled={editState.loading || !userName.length}
              >
                {editState.loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
              <Button
                className="text-base"
                onClick={handleCancel}
                variant="destructive"
                disabled={editState.loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <p className="text-sm text-gray-400">Name</p>
                <h3 className="text-lg">{userName}</h3>
              </div>
              <Button
                size="sm"
                className="text-base"
                onClick={() => setEditState({ show: true, loading: false })}
              >
                Edit
              </Button>
            </div>

            <div className="flex flex-col">
              <p className="text-sm text-gray-400">Email</p>
              <h3 className="text-lg">{userEmail}</h3>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
