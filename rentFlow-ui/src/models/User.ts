export enum UserRole {
    OWNER = "OWNER",
    TENANT = "TENANT",
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
}