"use client";

import { useState } from "react";
import {
  CustomCheckbox,
  CustomInput,
  CustomLabel,
  CustomLink,
  PrimaryButton,
} from "@/components/custom";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold text-white mb-6">Welcome back</h1>

      <form className="space-y-6">
        <div className="space-y-2">
          <CustomLabel htmlFor="email">Email</CustomLabel>
          <CustomInput
            id="email"
            type="email"
            value={email}
            required
            placeholder="name@example.com"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
          />
        </div>

        <div className="space-y-2">
          <CustomLabel htmlFor="password">Password</CustomLabel>
          <CustomInput
            id="password"
            type="password"
            value={password}
            required
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            placeholder="••••••••••"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CustomCheckbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked: boolean) => setRememberMe(checked)}
            />
            <CustomLabel htmlFor="remember">Remember me</CustomLabel>
          </div>

          <CustomLink>Forgot password?</CustomLink>
        </div>

        <PrimaryButton type="submit" className="w-full">
          Sign In
        </PrimaryButton>

        <p className="text-lg text-white">
          Don&apos;t have an account yet? <CustomLink>Sign up</CustomLink>
        </p>
      </form>
    </div>
  );
}
