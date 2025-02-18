export type CurrentUser = {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  organizations?: string[];
};

export type Organization = {
  id?: string;
  name?: string;
  owner?: string;
  members?: string[];
  created_at?: string;
  updated_at?: string;
  connections?: Connection[];
  invitations?: Invitation[];
};

export type Member = {
  email: string;
  role: string;
};

export type Connection = {
  type: string;
  name: string;
  apiKey: string;
  syncInterval?: string;
  username?: string;
  password?: string;
  connectionUrl?: string;
};

export type Invitation = {
  email: string;
};

export type ForecastData = {
  name: string;
  data: Record<string, string>[];
};
