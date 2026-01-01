import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import * as AuthService from "../services/auth";
import { User, UserRole, PlayerSubType } from "./AuthContextTypes";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerPlayer: (
    email: string,
    password: string,
    fullName: string,
    playerType: PlayerSubType,
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

    console.log("AuthProvider useEffect - token:", token);
    console.log("AuthProvider useEffect - savedUser:", savedUser);

    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log("Parsed user from localStorage:", parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
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
      console.log("Login attempt for:", email);
      const data = await AuthService.login(email, password);

      // Debug: log the response
      console.log("Login response data:", data);

      // Extract playerType from the response
      // The backend might send role as "captain" or "regularPlayer"
      // We need to map it to playerType
      let playerType: PlayerSubType = "regularPlayer";
      
      if (data.user.role === "captain") {
        playerType = "captain";
      } else if (data.user.playerType) {
        // If backend sends playerType directly
        playerType = data.user.playerType;
      }

      const loggedInUser: User = {
        id: data.user.id,
        name: data.user.fullName,
        role: "player", // Frontend role is always "player"
        playerType: playerType,
        age: data.user.age,
      };

      console.log("Setting user with:", loggedInUser);

      localStorage.setItem("koralink_token", data.token);
      localStorage.setItem("koralink_user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register player
  const registerPlayer = async (
    email: string,
    password: string,
    fullName: string,
    playerType: PlayerSubType,
    position: string,
    skillLevel: string,
    age: number
  ) => {
    setIsLoading(true);
    try {
      console.log("Registering player:", { email, playerType });
      const data = await AuthService.playerSignup(
        email,
        password,
        fullName,
        playerType, // Send as role to backend
        position,
        skillLevel,
        age
      );

      console.log("Registration response:", data);

      const loggedInUser: User = {
        id: data.user.id,
        name: data.user.fullName,
        role: "player", // Frontend role is always "player"
        playerType: playerType,
        age: data.user.age,
      };

      console.log("Setting registered user:", loggedInUser);

      localStorage.setItem("koralink_token", data.token);
      localStorage.setItem("koralink_user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register owner
  const registerOwner = async (formData: FormData) => {
    setIsLoading(true);
    try {
      console.log("Registering owner");
      const data = await AuthService.ownerSignup(formData);
      console.log("Owner registration response:", data.message);
    } catch (error) {
      console.error("Owner registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setIsLoading(true);
    try {
      console.log("Logging out");
      await AuthService.logout();
      setUser(null);
      localStorage.removeItem("koralink_token");
      localStorage.removeItem("koralink_user");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        registerPlayer,
        registerOwner,
        logout,
      }}
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