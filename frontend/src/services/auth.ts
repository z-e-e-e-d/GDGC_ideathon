// services/AuthService.ts
import axiosInstance from "../utils/axiosInstance";
import { User, UserRole } from "../contexts/AuthContextTypes";

interface LoginResponse {
  token: string;
  user: {
    id: string;
    role: UserRole;
    type: string; // "player", "owner", or "admin"
    fullName: string;
    age?: number;
  };
}

interface SignupPlayerResponse {
  token: string;
  user: {
    id: string;
    role: UserRole;
    fullName: string;
    age?: number;
  };
}

interface SignupOwnerResponse {
  message: string;
  ownerId: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await axiosInstance.post("/auth/login", { email, password });
  return response.data;
};

export const playerSignup = async (
  email: string,
  password: string,
  fullName: string,
  role: UserRole,
  position: string,
  skillLevel: string,
  age: number
): Promise<SignupPlayerResponse> => {
  const response = await axiosInstance.post("/auth/signup/player", {
    email,
    password,
    fullName,
    role,
    position,
    skillLevel,
    age,
  });
  return response.data;
};

export const ownerSignup = async (formData: FormData): Promise<SignupOwnerResponse> => {
  // formData should contain: email, password, fullName, and file if exists
  const response = await axiosInstance.post("/auth/signup/owner", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const logout = async (): Promise<void> => {
  await axiosInstance.post("/auth/logout");
  localStorage.removeItem("koralink_token");
  localStorage.removeItem("koralink_user");
};
