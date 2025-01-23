export type CurrentUser = {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
};

export type Organization = {
  id: string;
  name?: string;
  owner?: string;
  members?: string[];
  created_at?: string;
  updated_at?: string;
};

export type Member = {
  email: string;
  role: string;
};
