"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Check, Copy, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { IntegrationCardProps } from "./lib";
import { CustomInput } from "@/components/custom";
import { toast } from "@/hooks/use-toast";
import { useAppContext } from "@/context";
import { updateOrganizationConnections } from "@/lib/supabase/actions";

interface CredentialsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integration: IntegrationCardProps | null;
}

export default function ConnectionModal({
  open,
  onOpenChange,
  integration,
}: CredentialsModalProps) {
  const { parentOrganization, refetchCurrentOrg } = useAppContext();

  const [connectionName, setConnectionName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({
    connectionName: "",
    apiKey: "",
  });
  const [copiedStates, setCopiedStates] = useState({
    connectionName: false,
    apiKey: false,
  });

  const handleCopy = async (text: string, field: keyof typeof copiedStates) => {
    await navigator.clipboard.writeText(text);
    setCopiedStates((prev) => ({ ...prev, [field]: true }));
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [field]: false }));
    }, 500);
  };

  const handleConnectionNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConnectionName(e.target.value);
    setError((prev) => ({ ...prev, connectionName: "" }));
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
    setError((prev) => ({ ...prev, apiKey: "" }));
  };

  const handleError = (field: keyof typeof error, message: string) => {
    setError((prev) => ({ ...prev, [field]: message }));
  };

  const handleConnect = async () => {
    if (connectionName.length < 4 || apiKey.length < 8) {
      if (connectionName.length < 4) {
        handleError(
          "connectionName",
          "Connection name must be at least 4 characters"
        );
      }
      if (apiKey.length < 8) {
        handleError("apiKey", "API key must be at least 8 characters");
      }
      return;
    }

    const isConnectionExists = parentOrganization?.connections?.some(
      (conn) => conn.name === connectionName
    );

    if (isConnectionExists) {
      handleError("connectionName", "Connection name already exists");
      return;
    }

    // TODO: move to using database checks and secure credentials
    const firstConnection = parentOrganization?.connections?.[0];
    const userData = {
      username: firstConnection?.username,
      password: firstConnection?.password,
    };

    setIsLoading(true);

    try {
      const response = await fetch("/dashboard/api/database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          connectionName,
          organizationId: parentOrganization?.id || "",
          userData,
        }),
      });

      const connectionData = await response.json();

      if (!response.ok) {
        const errorMessage =
          connectionData.details ||
          connectionData.error ||
          "Failed to create database";

        console.error(errorMessage);

        handleError("connectionName", errorMessage);
        return;
      }

      const newConnection = {
        type: integration?.name || "",
        name: connectionName,
        apiKey: apiKey,
        syncInterval: "monthly",
        dbName: connectionData.dbName,
        username: connectionData.username,
        password: connectionData.password,
        connectionUrl: connectionData.connectionUrl,
      };

      await updateOrganizationConnections(parentOrganization?.id || "", [
        ...(parentOrganization?.connections || []),
        newConnection,
      ]);

      refetchCurrentOrg();
      handleClose();

      toast({
        title: `Added ${integration?.name} connection`,
        description: "You can now start using the integration",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(error);
      toast({
        title: "Integration connection failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setConnectionName("");
    setApiKey("");
    setError({ connectionName: "", apiKey: "" });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[430px] p-6 bg-gray-800 text-white border-0">
        <DialogHeader className="mb-1">
          <DialogTitle className="text-xl font-medium tracking-wide pr-3">
            Connect to {integration?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="connection-name"
              className="text-base text-white font-normal"
            >
              Connection name
            </Label>
            <div className="relative">
              <CustomInput
                id="connection-name"
                value={connectionName}
                className="pr-10 text-gray-300 tracking-wide !text-base"
                onChange={handleConnectionNameChange}
                placeholder="Connection name"
                tabIndex={-1}
              />
              <Button
                size="sm"
                variant="ghost"
                className={cn(
                  "absolute right-0 top-0 h-full hover:bg-transparent",
                  "transition-all duration-200"
                )}
                onClick={() => handleCopy(connectionName, "connectionName")}
              >
                {copiedStates.connectionName ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            {error.connectionName && (
              <p className="text-red-500 text-sm">{error.connectionName}</p>
            )}
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
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                className="pr-20 text-gray-300 tracking-wide !text-base"
                onChange={handleApiKeyChange}
                placeholder="Your API key"
              />
              <div className="absolute right-0 top-1 h-full flex">
                <Button
                  size="sm"
                  variant="ghost"
                  className="px-2 hover:bg-transparent"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="px-3 hover:bg-transparent"
                  onClick={() => handleCopy(apiKey, "apiKey")}
                >
                  {copiedStates.apiKey ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
            {error.apiKey && (
              <p className="text-red-500 text-sm">{error.apiKey}</p>
            )}
          </div>
        </div>

        <Button
          variant="default"
          className="w-full text-base py-5 mt-2"
          onClick={handleConnect}
          disabled={
            isLoading ||
            !apiKey ||
            !connectionName ||
            ["intect", "planday"].includes(integration?.name || "")
          }
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
