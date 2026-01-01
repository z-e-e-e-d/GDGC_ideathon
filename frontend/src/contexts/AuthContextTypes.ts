// Types for user and role
export type UserRole = "player" | "owner" | "admin";
export type PlayerSubType = "captain" | "regularPlayer";
export interface User {
  id: string;
  email?: string;
  name: string;
  role: UserRole;
  avatar?: string;
  age?: number; // optional for players
  playerType?: PlayerSubType; // Add this for players
}
