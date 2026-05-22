export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfileResponse {
  id: string;
  nickname: string;
  nameTag: string;
  preferredThemeColor: string;
  characterCode: string;
  level: number;
  experience: number;
}

export interface GroupDetailResponse {
  id: string;
  name: string;
  description: string;
  iconCode: string;
  ownerId: string;
  maxMembers: number;
  isPublic: boolean;
  members: Array<{
    id: string;
    userId: string;
    nickname: string;
    role: string;
  }>;
}

export interface GroupListResponse {
  items: Array<{ id: string; name: string }>;
}

export interface InviteCodeResponse {
  code: string;
  expiresAt: string;
}

export interface EventDetailResponse {
  id: string;
  title: string;
  description: string;
  status: string;
  participants: Array<{ userId: string; status: string }>;
}

export interface EventListResponse {
  items: Array<{ id: string; title: string }>;
}
