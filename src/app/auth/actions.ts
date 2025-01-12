"use client";

import { createClient } from "@/lib/supabase/client";

interface SignInProps {
  email: string;
  password: string;
}

export async function signin({ email, password }: SignInProps) {
  const supabase = createClient();
  const data = {
    email,
    password,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    throw error;
  }
}

interface SignUpProps {
  email: string;
  password: string;
  options: {
    data: {
      full_name: string;
      avatar_url: string;
    };
  };
}

export async function signup({ email, password, options }: SignUpProps) {
  const supabase = createClient();

  const data = {
    email,
    password,
    options,
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    throw error;
  }
}
