-- Create organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  owner UUID NOT NULL REFERENCES auth.users(id),
  members UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  avatar_url TEXT,
  parent_org UUID REFERENCES public.organizations(id),
  organizations UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- First, drop the existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    org_id UUID;
BEGIN
    -- Check if raw_user_meta_data exists and contains full_name
    IF NEW.raw_user_meta_data->>'full_name' IS NULL THEN
        -- Set a default name if none provided
        NEW.raw_user_meta_data = jsonb_build_object('full_name', NEW.email);
    END IF;

    -- Create organization
    INSERT INTO public.organizations (name, owner, members)
    VALUES (
        (NEW.raw_user_meta_data->>'full_name') || '''s Org',
        NEW.id,
        ARRAY[NEW.id]
    )
    RETURNING id INTO org_id;

    -- Create user
    INSERT INTO public.users (id, full_name, avatar_url, parent_org, organizations)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url',
        org_id,
        ARRAY[org_id]
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger after auth.users insert
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Users can view organizations they are members of" ON public.organizations
    FOR SELECT
    USING (auth.uid() = ANY (members));

CREATE POLICY "Only owners can update their organizations" ON public.organizations
    FOR UPDATE
    USING (auth.uid() = owner);

-- Users policies
CREATE POLICY "Users can view other users in their organizations" ON public.users
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.organizations
        WHERE auth.uid() = ANY (members)
        AND id = ANY (users.organizations)
    ));

CREATE POLICY "Users can update their own record" ON public.users
    FOR UPDATE
    USING (auth.uid() = id);

-- Grant necessary permissions
GRANT ALL ON public.organizations TO authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;