export type UserRole = 'admin' | 'member' | 'guest';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_approved: boolean;
  running_pace: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export type PostCategory = 'regular' | 'flash' | 'log' | 'notice';

export interface Post {
  id: string;
  author_id: string;
  category: PostCategory;
  title: string;
  content: string;
  run_date: string | null;
  location: string | null;
  distance_km: number | null;
  target_pace: string | null;
  max_participants: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  author?: Profile;
  rsvps?: RSVP[];
  comments_count?: number;
}

export interface RSVP {
  id: string;
  post_id: string;
  user_id: string;
  status: 'attending' | 'cheering';
  created_at: string;
  user?: Profile;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: Profile;
}
