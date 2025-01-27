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
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { IntegrationCardProps } from "./lib";
import { CustomInput } from "@/components/custom";
import { toast } from "@/hooks/use-toast";
import { connectionStorage } from "../utils/connections";
import { useAppContext } from "@/context";

interface CredentialsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integration: IntegrationCardProps | null;
  updatedIntegrations: string[];
  setUpdatedIntegrations: (updatedIntegrations: string[]) => void;
}

export default function ConnectionModal({
  open,
  onOpenChange,
  integration,
  updatedIntegrations,
  setUpdatedIntegrations,
}: CredentialsModalProps) {
  const { parentOrganization } = useAppContext();
  const [connectionName, setConnectionName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState({
    connectionName: "",
    apiKey: "",
  });
  const [copiedStates, setCopiedStates] = useState({
    connectionName: false,
    apiKey: false,
  });

  useEffect(() => {
    const connection = connectionStorage(
      integration?.name,
      parentOrganization?.id
    );
    if (!connection) return;
    setConnectionName(connection.connectionName || "");
    setApiKey(connection.apiKey || "");
    setIsConnected(!!connection.connectionName);
  }, [integration, updatedIntegrations?.length, parentOrganization?.id]);

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
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    connectionStorage(
      integration?.name,
      parentOrganization?.id
    )?.setConnection?.(connectionName, apiKey);
    onOpenChange(false);
    setIsLoading(false);
    setUpdatedIntegrations([...updatedIntegrations, integration?.name || ""]);

    toast({
      title: "Connected to " + integration?.name,
      description: "You can now start using the integration",
    });
  };

  const handleDisconnect = () => {
    connectionStorage(
      integration?.name,
      parentOrganization?.id
    )?.disconnect?.();
    setIsConnected(false);
    onOpenChange(false);
    setUpdatedIntegrations(
      updatedIntegrations.filter((item) => item !== integration?.name)
    );
    toast({
      title: "Disconnected from " + integration?.name,
      description: `You are now not connected to ${integration?.name}`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[430px] p-6 bg-navy text-white border-0">
        <DialogHeader className="mb-1">
          <DialogTitle className="text-xl font-medium tracking-wide capitalize">
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
                className="pr-10"
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
                className="pr-20"
                onChange={handleApiKeyChange}
                placeholder="API key"
              />
              <div className="absolute right-0 top-2 h-full flex">
                <Button
                  size="sm"
                  variant="ghost"
                  className="px-3 hover:bg-transparent"
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
          className="w-full text-base py-5 mt-3"
          onClick={handleConnect}
          disabled={
            isLoading || ["intect", "planday"].includes(integration?.name || "")
          }
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isConnected ? (
            "Update connection"
          ) : (
            "Connect"
          )}
        </Button>

        {isConnected && (
          <Button
            variant="destructive"
            className="w-full text-base py-5"
            onClick={handleDisconnect}
          >
            Disconnect
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
