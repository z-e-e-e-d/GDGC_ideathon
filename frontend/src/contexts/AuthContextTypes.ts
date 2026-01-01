// Types for user and role
export type UserRole = "player" | "owner" | "admin";

export interface User {
  id: string;
  email?: string;
  name: string;
  role: UserRole;
  avatar?: string;
  age?: number; // optional for players
}
