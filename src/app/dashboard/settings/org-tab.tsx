"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { TeamSection } from "./team-section";
import { CustomInput } from "@/components/custom";
import { useAppContext } from "@/context";
import { useToast } from "@/hooks/use-toast";
import { updateOrganization } from "@/lib/supabase/actions";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrganizationTab() {
  const { selectedOrganization, setSelectedOrganization, currentUser } =
    useAppContext();
  const [orgEditState, setOrgEditState] = useState({
    show: false,
    loading: false,
  });
  const [orgName, setOrgName] = useState(selectedOrganization?.name || "");
  const { toast } = useToast();

  const isOrgOwner = selectedOrganization?.owner === currentUser?.id;

  useEffect(() => {
    setOrgName(selectedOrganization?.name || "");
  }, [selectedOrganization]);

  const handleCancel = () => {
    setOrgEditState({ show: false, loading: false });
    setOrgName(selectedOrganization?.name || "");
  };

  const handleSaveOrgName = async () => {
    setOrgEditState((prev) => ({ ...prev, loading: true }));
    try {
      await updateOrganization(selectedOrganization?.id || "", {
        id: selectedOrganization?.id || "",
        name: orgName,
      });
      setSelectedOrganization((prev) => {
        if (!prev) return null;
        return { ...prev, name: orgName };
      });
      toast({
        title: "Success",
        description: "Organization name updated successfully",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      toast({ title: "Error", description: errorMessage });
    } finally {
      setOrgEditState({ show: false, loading: false });
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-6">
          Organization information
        </h2>
        <div className="space-y-2">
          {orgEditState.show ? (
            <>
              <Label className="text-base" htmlFor="orgName">
                Organization name
              </Label>
              <CustomInput
                id="orgName"
                type="text"
                required
                autoFocus
                placeholder="Change your organization name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />

              <Separator className="!my-6 bg-gray-700" />
              <div className="flex gap-4">
                <Button
                  className="text-base"
                  onClick={handleSaveOrgName}
                  disabled={orgEditState.loading || !orgName.length}
                >
                  {orgEditState.loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Save"
                  )}
                </Button>
                <Button
                  className="text-base"
                  onClick={handleCancel}
                  variant="destructive"
                  disabled={orgEditState.loading}
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <div className="flex justify-between items-center">
              {!orgName ? (
                <Skeleton className="h-4 w-40 bg-gray-700 mt-2 mb-2" />
              ) : (
                <>
                  <h3 className="text-lg">{orgName}</h3>
                  {isOrgOwner && (
                    <Button
                      size="sm"
                      className="text-base"
                      onClick={() =>
                        setOrgEditState({ loading: false, show: true })
                      }
                    >
                      Edit
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <TeamSection />
    </div>
  );
}
