import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as AuthService from "../services/auth";
import { User, UserRole } from "./AuthContextTypes";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerPlayer: (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    position: string,
    skillLevel: string,
    age: number
  ) => Promise<void>;
  registerOwner: (formData: FormData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("koralink_token");
    const savedUser = localStorage.getItem("koralink_user");

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("koralink_token");
        localStorage.removeItem("koralink_user");
      }
    }
    setIsLoading(false);
  }, []);

  // Login
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await AuthService.login(email, password);

      const loggedInUser: User = {
        id: data.user.id,
        name: data.user.fullName,
        role: data.user.role,
        age: data.user.age,
      };

      localStorage.setItem("koralink_token", data.token);
      localStorage.setItem("koralink_user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);
    } finally {
      setIsLoading(false);
    }
  };

  // Register player
  const registerPlayer = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    position: string,
    skillLevel: string,
    age: number
  ) => {
    setIsLoading(true);
    try {
      const data = await AuthService.playerSignup(email, password, fullName, role, position, skillLevel, age);

      const loggedInUser: User = {
        id: data.user.id,
        name: data.user.fullName,
        role: data.user.role,
        age: data.user.age,
      };

      localStorage.setItem("koralink_token", data.token);
      localStorage.setItem("koralink_user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);
    } finally {
      setIsLoading(false);
    }
  };

  // Register owner
  const registerOwner = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const data = await AuthService.ownerSignup(formData);
      console.log(data.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
      localStorage.removeItem("koralink_token");
      localStorage.removeItem("koralink_user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, registerPlayer, registerOwner, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export default AuthProvider;
