// services/TeamService.ts - Complete version
import axiosInstance from "../utils/axiosInstance";

export interface Team {
  _id: string;
  name: string;
  captain: {
    _id: string;
    fullName: string;
    email: string;
    position?: string;
  };
  players: Array<{
    _id: string;
    fullName: string;
    email: string;
    position?: string;
  }>;
  maxPlayers: number;
  skillLevel: "beginner" | "intermediate" | "advanced";
  positionsNeeded?: string;
  createdAt: string;
}

export interface Player {
  _id: string;
  fullName: string;
  email: string;
  position?: string;
  skillLevel?: string;
  age?: number;
}

export interface CreateTeamRequest {
  name: string;
  maxPlayers?: number;
  skillLevel: "beginner" | "intermediate" | "advanced";
  players?: string[];
}

export interface UpdateTeamRequest {
  name?: string;
  maxPlayers?: number;
  skillLevel?: "beginner" | "intermediate" | "advanced";
  players?: string[];
}

export interface TeamResponse {
  message: string;
  team: Team;
}

export interface TeamsResponse {
  teams: Team[];
}

export interface MyTeamResponse {
  team: Team;
  availablePlayers: number;
  positionsNeeded: string;
}

export interface SearchPlayerResponse {
  players: Player[];
}

export interface PlayerResponse {
  player: Player;
}

export interface AddPlayerByEmailResponse {
  message: string;
  team: Team;
  addedPlayer: {
    _id: string;
    fullName: string;
    email: string;
    position?: string;
  };
}

// Create a new team
export const createTeam = async (
  teamData: CreateTeamRequest
): Promise<TeamResponse> => {
  try {
    const response = await axiosInstance.post("/teams", teamData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create team");
  }
};

// Get all teams
export const getAllTeams = async (): Promise<TeamsResponse> => {
  try {
    const response = await axiosInstance.get("/teams");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch teams");
  }
};

// Get my team (for captains)
export const getMyTeam = async (): Promise<MyTeamResponse> => {
  try {
    const response = await axiosInstance.get("/teams/my-team");
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch your team"
    );
  }
};

// Update a team
export const updateTeam = async (
  teamId: string,
  teamData: UpdateTeamRequest
): Promise<TeamResponse> => {
  try {
    const response = await axiosInstance.put(`/teams/${teamId}`, teamData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update team");
  }
};

// Delete a team
export const deleteTeam = async (teamId: string): Promise<TeamResponse> => {
  try {
    const response = await axiosInstance.delete(`/teams/${teamId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete team");
  }
};

// Add a player to team by player ID
export const addPlayerToTeam = async (
  teamId: string,
  playerId: string
): Promise<TeamResponse> => {
  try {
    const response = await axiosInstance.put(`/teams/${teamId}/add-player`, {
      playerId,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to add player to team"
    );
  }
};

// Add a player to team by email
export const addPlayerByEmail = async (
  teamId: string,
  email: string
): Promise<AddPlayerByEmailResponse> => {
  try {
    const response = await axiosInstance.post(`/teams/${teamId}/add-by-email`, {
      email,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to add player to team"
    );
  }
};

// Search players by email
export const searchPlayersByEmail = async (
  email: string
): Promise<SearchPlayerResponse> => {
  try {
    const response = await axiosInstance.get(
      `/teams/search?email=${encodeURIComponent(email)}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to search players"
    );
  }
};

// Get player by email
export const getPlayerByEmail = async (email: string): Promise<Player> => {
  try {
    const response = await axiosInstance.get(
      `/teams/email/${encodeURIComponent(email)}`
    );
    return response.data.player;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Player not found");
  }
};