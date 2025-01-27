"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Copy, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ConnectionCardProps } from "./lib";

interface CredentialsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection: ConnectionCardProps | null;
}

export function CredentialsModal({
  open,
  onOpenChange,
  connection,
}: CredentialsModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showUsername, setShowUsername] = useState(false);
  const [copiedStates, setCopiedStates] = useState({
    server: false,
    username: false,
    password: false,
  });

  const handleCopy = async (text: string, field: keyof typeof copiedStates) => {
    await navigator.clipboard.writeText(text);
    setCopiedStates((prev) => ({ ...prev, [field]: true }));
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [field]: false }));
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[430px] p-6 bg-navy text-white border-0">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-medium tracking-wide capitalize">
            {connection?.displayName} data credentials
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          <div className="space-y-2">
            <Label
              htmlFor="server"
              className="text-base text-white font-normal"
            >
              Server URL
            </Label>
            <div className="relative">
              <Input
                id="server"
                className="bg-navy text-gray-400 border-none py-5 pr-10"
                value="name@example.com"
                tabIndex={-1}
                readOnly
              />
              <Button
                size="sm"
                variant="ghost"
                className={cn(
                  "absolute right-0 top-0 h-full px-3 hover:bg-transparent",
                  "transition-all duration-200"
                )}
                onClick={() => handleCopy("name@example.com", "server")}
              >
                {copiedStates.server ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="username"
              className="text-base text-white font-normal"
            >
              User name
            </Label>
            <div className="relative">
              <Input
                id="username"
                type={showUsername ? "text" : "password"}
                className="bg-navy text-gray-400 border-0 py-5 pr-20"
                value="username123"
                readOnly
              />
              <div className="absolute right-0 top-0 h-full flex">
                <Button
                  size="sm"
                  variant="ghost"
                  className="px-3 hover:bg-transparent"
                  onClick={() => setShowUsername(!showUsername)}
                >
                  {showUsername ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="px-3 hover:bg-transparent"
                  onClick={() => handleCopy("username123", "username")}
                >
                  {copiedStates.username ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-base text-white font-normal"
            >
              Your password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className="bg-navy text-gray-400 border-0 py-5 pr-20"
                value="password123"
                readOnly
              />
              <div className="absolute right-0 top-0 h-full flex">
                <Button
                  size="sm"
                  variant="ghost"
                  className="px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="px-3 hover:bg-transparent"
                  onClick={() => handleCopy("password123", "password")}
                >
                  {copiedStates.password ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
