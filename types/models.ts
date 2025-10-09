type ImageURL = string;

export interface VerificationStatus {
  email_verified: boolean;
  phone_verified: boolean;
}

import { Profile } from "./profile";

export interface RawUserMetaData extends VerificationStatus {
  avatar_url: ImageURL;
  cover_photo: ImageURL;
  email: string;
  first_name: string;
  full_name: string;
  last_name: string;
  status: "undergraduate" | "alumnus";
  sub: string;
  username: string;
  profile?: Profile;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  username: string;
  status: "undergraduate" | "alumnus";
  avatar_url: ImageURL;
  cover_photo: ImageURL;
  created_at: string;
  raw_user_meta_data: RawUserMetaData;
}

interface UserMetadata {
  email: string;
  email_verified: boolean;
  first_name: string;
  full_name: string;
  last_name: string;
  username?: string;
  avatar_url?: string;
  cover_photo?: string;
  status?: string;
  phone_verified?: boolean;
  [key: string]: any;
}

export interface AuthUserProfile {
  aud: string;
  confirmation_sent_at: string;
  confirmed_at: string | null;
  created_at: string;
  email: string;
  email_confirmed_at: string | null;
  id: string;
  is_anonymous: boolean;
  last_sign_in_at: string;
  phone: string;
  role: string;
  updated_at: string;
  user_metadata: UserMetadata;
}
