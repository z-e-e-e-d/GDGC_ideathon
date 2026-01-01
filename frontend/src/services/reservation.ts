// services/ReservationService.ts
import axiosInstance from "../utils/axiosInstance";

export interface Stadium {
  _id: string;
  name: string;
  location?: {
    address?: string;
    lat?: number;
    lng?: number;
  };
}

export interface Team {
  _id: string;
  name: string;
  captain?: {
    _id: string;
    fullName: string;
    email: string;
  };
}

export interface Match {
  _id: string;
  stadium: string | Stadium;
  slot: string;
  teamA: string | Team;
  teamB: string | Team;
  status: string;
  createdBy: string;
}

export interface Reservation {
  _id: string;
  stadium: string | Stadium;
  session: string;
  weekday: number; // 0-6 (Sunday-Saturday)
  owner: string; // Owner ID
  status: "pending" | "approved" | "matched" | "rejected";
  notes?: string;
  requestingTeam: string | Team;
  opponentTeams: Array<string | Team>;
  selectedOpponent: string | Team | null;
  match: string | Match | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReservationRequest {
  stadiumId: string;
  session: string;
  weekday: number;
  notes?: string;
}

export interface UpdateReservationStatusRequest {
  status: "approved" | "rejected";
}

export interface AddOpponentTeamRequest {
  teamId: string;
}

export interface SelectOpponentTeamRequest {
  teamId: string;
}

export interface CreateReservationResponse {
  message: string;
  reservation: Reservation;
}

export interface GetReservationsResponse {
  reservations: Reservation[];
}

export interface UpdateReservationStatusResponse {
  message: string;
  reservation: Reservation;
  match?: Match;
}

export interface AddOpponentTeamResponse {
  message: string;
  reservation: Reservation;
}

export interface SelectOpponentTeamResponse {
  message: string;
  reservation: Reservation;
}

// Create a reservation (captain/admin only)
export const createReservation = async (
  data: CreateReservationRequest
): Promise<CreateReservationResponse> => {
  try {
    const response = await axiosInstance.post("/reservation", data);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to create reservation"
    );
  }
};

// Get reservations (owner/captain/admin)
export const getReservations = async (): Promise<GetReservationsResponse> => {
  try {
    const response = await axiosInstance.get("/reservation");
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch reservations"
    );
  }
};

// Get reservations by stadium ID
export const getStadiumReservations = async (
  stadiumId: string
): Promise<GetReservationsResponse> => {
  try {
    const response = await axiosInstance.get(`/reservation/stadium/${stadiumId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch stadium reservations"
    );
  }
};

// Get reservations by team ID
export const getTeamReservations = async (
  teamId: string
): Promise<GetReservationsResponse> => {
  try {
    const response = await axiosInstance.get(`/reservation/team/${teamId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch team reservations"
    );
  }
};

// Get my reservations (based on user role)
export const getMyReservations = async (): Promise<GetReservationsResponse> => {
  try {
    const response = await axiosInstance.get("/reservation/my");
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch your reservations"
    );
  }
};

// Update reservation status (owner only)
export const updateReservationStatus = async (
  reservationId: string,
  data: UpdateReservationStatusRequest
): Promise<UpdateReservationStatusResponse> => {
  try {
    const response = await axiosInstance.put(
      `/reservation/${reservationId}/status`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update reservation status"
    );
  }
};

// Add opponent team to reservation
export const addOpponentTeam = async (
  reservationId: string,
  data: AddOpponentTeamRequest
): Promise<AddOpponentTeamResponse> => {
  try {
    const response = await axiosInstance.put(
      `/reservation/${reservationId}/add-opponent`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to add opponent team"
    );
  }
};

// Select opponent team (lock reservation)
export const selectOpponentTeam = async (
  reservationId: string,
  data: SelectOpponentTeamRequest
): Promise<SelectOpponentTeamResponse> => {
  try {
    const response = await axiosInstance.put(
      `/reservation/${reservationId}/select-opponent`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to select opponent team"
    );
  }
};

// Cancel reservation (captain/owner/admin)
export const cancelReservation = async (
  reservationId: string
): Promise<{ message: string }> => {
  try {
    const response = await axiosInstance.delete(`/reservation/${reservationId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to cancel reservation"
    );
  }
};

// Get reservation by ID
export const getReservationById = async (
  reservationId: string
): Promise<{ reservation: Reservation }> => {
  try {
    const response = await axiosInstance.get(`/reservation/${reservationId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch reservation"
    );
  }
};

// Check stadium availability
export const checkStadiumAvailability = async (
  stadiumId: string,
  weekday: number,
  session: string
): Promise<{ available: boolean; message?: string }> => {
  try {
    const response = await axiosInstance.get(
      `/reservation/availability/${stadiumId}`,
      {
        params: { weekday, session }
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to check stadium availability"
    );
  }
};

// Utility: Format weekday number to string
export const formatWeekday = (weekday: number): string => {
  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];
  return weekdays[weekday] || "Unknown";
};

// Utility: Format time slot
export const formatSession = (session: string): string => {
  const sessions: Record<string, string> = {
    "morning": "Morning (8:00-12:00)",
    "afternoon": "Afternoon (12:00-16:00)",
    "evening": "Evening (16:00-20:00)",
    "night": "Night (20:00-24:00)"
  };
  return sessions[session] || session;
};

// Utility: Get reservation status color
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    "pending": "bg-yellow-100 text-yellow-800",
    "approved": "bg-green-100 text-green-800",
    "matched": "bg-blue-100 text-blue-800",
    "rejected": "bg-red-100 text-red-800"
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

// Utility: Check if reservation can be edited
export const canEditReservation = (reservation: Reservation, userId: string, userRole: string): boolean => {
  // If reservation is already matched or approved, can't edit
  if (reservation.status === "matched" || reservation.status === "approved") {
    return false;
  }
  
  // Captains can edit their own pending reservations
  if (userRole === "captain" && reservation.status === "pending") {
    // Check if this is the requesting team's captain
    const team = reservation.requestingTeam as Team;
    return team.captain?._id === userId;
  }
  
  // Owners can edit their stadium's pending reservations
  if (userRole === "owner" && reservation.owner === userId) {
    return true;
  }
  
  // Admins can edit any pending reservation
  if (userRole === "admin") {
    return true;
  }
  
  return false;
};

// Utility: Check if opponent can be selected
export const canSelectOpponent = (reservation: Reservation): boolean => {
  return reservation.status === "approved" && 
         reservation.opponentTeams.length > 0 && 
         !reservation.selectedOpponent;
};

// Utility: Check if user can approve/reject reservation
export const canManageReservation = (reservation: Reservation, userId: string, userRole: string): boolean => {
  // Owners can manage reservations for their stadiums
  if (userRole === "owner" && reservation.owner === userId) {
    return reservation.status === "pending";
  }
  
  // Admins can manage any reservation
  if (userRole === "admin") {
    return true;
  }
  
  return false;
};

// Get available time slots for a stadium
export const getAvailableSessions = async (
  stadiumId: string,
  weekday: number
): Promise<{ sessions: string[] }> => {
  try {
    const response = await axiosInstance.get(
      `/reservation/${stadiumId}/sessions`,
      { params: { weekday } }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch available sessions"
    );
  }
};

// Get upcoming reservations (for dashboard)
export const getUpcomingReservations = async (
  limit: number = 5
): Promise<GetReservationsResponse> => {
  try {
    const response = await axiosInstance.get("/reservation/upcoming", {
      params: { limit }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch upcoming reservations"
    );
  }
};

// Get reservation statistics
export const getReservationStats = async (): Promise<{
  total: number;
  pending: number;
  approved: number;
  matched: number;
  rejected: number;
}> => {
  try {
    const response = await axiosInstance.get("/reservation/stats");
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch reservation statistics"
    );
  }
};

// Search reservations
export const searchReservations = async (
  query: string,
  filters?: {
    status?: string;
    stadium?: string;
    team?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<GetReservationsResponse> => {
  try {
    const response = await axiosInstance.get("/reservation/search", {
      params: { query, ...filters }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to search reservations"
    );
  }
};