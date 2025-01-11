"use client";

import { useState } from "react";
import {
  CustomCheckbox,
  CustomLabel,
  CustomLink,
  CustomInput,
  PrimaryButton,
} from "@/components/custom";

interface SignUpProps {
  setIsSignIn: (isSignIn: boolean) => void;
}

export default function SignUp({ setIsSignIn }: SignUpProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);

  const handleSignin = () => {
    setIsSignIn(true);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-8 bg-gray-800 rounded-lg shadow-lg">
      <form className="space-y-6">
        <div className="space-y-2">
          <CustomLabel htmlFor="name">What should we call you?</CustomLabel>
          <CustomInput
            id="name"
            type="text"
            value={name}
            required
            placeholder="e.g. Bonnie Green"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setName(e.target.value)
            }
          />
        </div>

        <div className="space-y-2">
          <CustomLabel htmlFor="email">Email</CustomLabel>
          <CustomInput
            id="email"
            type="email"
            value={email}
            required
            placeholder="name@example.com"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <CustomLabel htmlFor="password">Password</CustomLabel>
          <CustomInput
            id="password"
            type="password"
            value={password}
            required
            placeholder="••••••••••"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-2">
            <CustomCheckbox
              id="terms"
              checked={acceptTerms}
              className="mt-1"
              onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
            />
            <CustomLabel htmlFor="terms">
              By signing up, you are creating a DataDock account, and you agree
              to DataDock&apos;s <CustomLink>Terms of Use</CustomLink> and{" "}
              <CustomLink>Privacy Policy</CustomLink>.
            </CustomLabel>
          </div>

          <div className="flex items-center space-x-2">
            <CustomCheckbox
              id="newsletter"
              checked={subscribeNewsletter}
              onCheckedChange={(checked) =>
                setSubscribeNewsletter(checked as boolean)
              }
              className="border-gray-600 bg-gray-700 size-5 data-[state=checked]:bg-blue-500"
            />
            <CustomLabel htmlFor="newsletter">
              Email me about product updates and resources.
            </CustomLabel>
          </div>
        </div>

        <PrimaryButton
          type="submit"
          className="w-full"
          disabled={!acceptTerms || !name || !email || !password}
        >
          Sign Up
        </PrimaryButton>

        <p className="text-lg text-white">
          Already have an account?{" "}
          <CustomLink onClick={handleSignin}>Login here</CustomLink>
        </p>
      </form>
    </div>
  );
}
