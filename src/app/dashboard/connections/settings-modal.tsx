"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Check, Copy, Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ConnectionCardProps } from "./lib";
import { Separator } from "@/components/ui/separator";
import { CustomInput } from "@/components/custom";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppContext } from "@/context";
import { updateOrganizationConnections } from "@/lib/supabase/actions";
import { toast } from "@/hooks/use-toast";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection: ConnectionCardProps | null;
}

export default function SettingsModal({
  open,
  onOpenChange,
  connection,
}: SettingsModalProps) {
  const { parentOrganization, refetchCurrentOrg } = useAppContext();

  const [connectionName, setConnectionName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [syncInterval, setSyncInterval] = useState("monthly");

  const [showAPIKey, setShowAPIKey] = useState(false);
  const [copiedStates, setCopiedStates] = useState({
    apiKey: false,
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setConnectionName(connection?.name || "");
    setApiKey(connection?.apiKey || "");
    setSyncInterval(connection?.syncInterval || "monthly");
  }, [connection]);

  const handleCopy = async (text: string, field: keyof typeof copiedStates) => {
    await navigator.clipboard.writeText(text);
    setCopiedStates((prev) => ({ ...prev, [field]: true }));
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [field]: false }));
    }, 500);
  };

  const handleClose = () => {
    onOpenChange(false);
    setConnectionName(connection?.name || "");
    setApiKey(connection?.apiKey || "");
    setSyncInterval(connection?.syncInterval || "monthly");
  };

  const isValuesChanged =
    connectionName !== connection?.name ||
    apiKey !== connection?.apiKey ||
    syncInterval !== connection?.syncInterval;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const updatedConnections = parentOrganization?.connections?.filter(
        (conn) => conn.name !== connection?.name
      );

      await updateOrganizationConnections(
        parentOrganization?.id || "",
        updatedConnections || []
      );

      refetchCurrentOrg();
      handleClose();

      toast({
        title: "Connection deleted",
        description: "Connection deleted successfully",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast({
        title: "Error deleting connection",
        description: errorMessage,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const updatedConnections = parentOrganization?.connections?.map((conn) =>
        conn.name === connection?.name
          ? {
              ...conn,
              name: connectionName,
              apiKey: apiKey,
              syncInterval: syncInterval,
            }
          : conn
      );

      await updateOrganizationConnections(parentOrganization?.id || "", [
        ...(updatedConnections || []),
      ]);

      refetchCurrentOrg();
      handleClose();

      toast({
        title: "Connection updated",
        description: "Connection updated successfully",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast({
        title: "Error updating connection",
        description: errorMessage,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px] p-6 bg-gray-800 text-white border-0">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-medium tracking-wide pr-3">
            Settings for {connection?.name}
          </DialogTitle>
        </DialogHeader>

        <Separator className="bg-gray-700" />

        <div className="flex flex-col gap-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base text-white font-normal">
              Connection name
            </Label>
            <CustomInput
              id="name"
              className="bg-gray-700 text-gray-300  py-5 !text-base tracking-wide"
              value={connectionName}
              onChange={(e) => setConnectionName(e.target.value)}
              tabIndex={-1}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="api-key"
              className="text-base text-white font-normal"
            >
              API key
            </Label>
            <div className="relative">
              <CustomInput
                id="api-key"
                type={showAPIKey ? "text" : "password"}
                className={cn(
                  "!bg-gray-700 text-gray-300 py-5 !text-base",
                  showAPIKey ? "tracking-wide" : "tracking-widest"
                )}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                tabIndex={-1}
              />
              <div className="absolute right-0 top-2 h-full flex">
                <Button
                  size="sm"
                  variant="ghost"
                  className="px-2 hover:bg-transparent"
                  onClick={() => setShowAPIKey(!showAPIKey)}
                >
                  {showAPIKey ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="px-3 hover:bg-transparent"
                  onClick={() => handleCopy(apiKey || "", "apiKey")}
                >
                  {copiedStates.apiKey ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-gray-700 mb-1" />

        <DialogFooter>
          <div className="flex flex-col gap-5 w-full">
            <div className="space-y-2">
              <Label
                htmlFor="sync-interval"
                className="text-base text-white font-normal"
              >
                Automatic sync interval
              </Label>
              <Select
                value={syncInterval}
                onValueChange={(value) =>
                  setSyncInterval(value as "daily" | "weekly" | "monthly")
                }
              >
                <SelectTrigger
                  className={cn(
                    "bg-gray-700 text-gray-300 border-gray-600 py-5 h-11 text-base",
                    "tracking-wide"
                  )}
                >
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 text-white border-gray-600">
                  <SelectItem
                    className="text-gray-300 text-base"
                    value="monthly"
                  >
                    Monthly
                  </SelectItem>
                  <SelectItem
                    className="text-gray-300 text-base"
                    value="weekly"
                  >
                    Weekly
                  </SelectItem>
                  <SelectItem className="text-gray-300 text-base" value="daily">
                    Daily
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 tracking-wide">
                Syncs will happen on the 1st of each month from 02:00 to 04:00
                CET.
              </p>
            </div>

            <Button
              variant="default"
              disabled={!isValuesChanged || isUpdating || isDeleting}
              className="w-full text-base py-5 bg-blue-700 hover:bg-blue-800"
              onClick={handleSave}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>

            <Button
              variant="destructive"
              className="w-full text-base py-5 bg-red-700 hover:bg-red-800"
              onClick={handleDelete}
              disabled={isDeleting || isUpdating}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
