export enum UserRole {
    OWNER = "OWNER",
    TENANT = "TENANT",
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
}