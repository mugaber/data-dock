"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Copy, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ConnectionCardProps } from "./lib";
import { Separator } from "@/components/ui/separator";

interface DockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection: ConnectionCardProps | null;
}

export default function DockModal({
  open,
  onOpenChange,
  connection,
}: DockModalProps) {
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
      <DialogContent className="sm:max-w-[440px] p-6 bg-gray-800 text-white border-0">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-medium tracking-wide pr-3">
            Data Dock for {connection?.name}
          </DialogTitle>
        </DialogHeader>

        <Separator className="bg-gray-700" />

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
                className="bg-gray-800 text-gray-400 border-none py-5 pr-10 !text-base tracking-wide"
                value="name@example.com"
                tabIndex={-1}
                readOnly
              />
              <Button
                size="sm"
                variant="ghost"
                className={cn(
                  "absolute right-0 top-0 h-full px-2 hover:bg-transparent",
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
                className={cn(
                  "bg-gray-800 text-gray-400 border-0 py-5 pr-20 !text-base",
                  showUsername ? "tracking-wide" : "tracking-widest"
                )}
                value="username123"
                readOnly
              />
              <div className="absolute right-0 top-1 h-full flex">
                <Button
                  size="sm"
                  variant="ghost"
                  className="px-2 hover:bg-transparent"
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
                  className="px-2 hover:bg-transparent"
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
                className={cn(
                  "bg-gray-800 text-gray-400 border-0 py-5 pr-20 !text-base",
                  showPassword ? "tracking-wide" : "tracking-widest"
                )}
                value="password123"
                readOnly
              />
              <div className="absolute right-0 top-1 h-full flex">
                <Button
                  size="sm"
                  variant="ghost"
                  className="px-2 hover:bg-transparent"
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
                  className="px-2 hover:bg-transparent"
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

        <Separator className="bg-gray-700 mb-1" />

        <DialogFooter>
          <div className="flex flex-col gap-4 w-full">
            <Button
              variant="default"
              className="w-full text-base py-5 bg-green-800 hover:bg-green-900"
            >
              Connect to Google Sheets
            </Button>
            <Button
              variant="default"
              className="w-full text-base py-5 bg-blue-700 hover:bg-blue-800"
            >
              Export to CSV
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
