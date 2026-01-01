import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "player" | "owner";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
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

  const login = async (email: string, password: string) => {
    // Simulate API call - replace with actual backend integration
    setIsLoading(true);
    try {
      // Mock login - in production, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, check stored users or create mock
      const storedUsers = JSON.parse(localStorage.getItem("koralink_users") || "[]");
      const foundUser = storedUsers.find((u: any) => u.email === email);
      
      if (foundUser && foundUser.password === password) {
        const userData: User = {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          role: foundUser.role,
        };
        
        const token = btoa(JSON.stringify({ id: userData.id, exp: Date.now() + 86400000 }));
        localStorage.setItem("koralink_token", token);
        localStorage.setItem("koralink_user", JSON.stringify(userData));
        setUser(userData);
      } else {
        throw new Error("Invalid credentials");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const storedUsers = JSON.parse(localStorage.getItem("koralink_users") || "[]");
      
      if (storedUsers.some((u: any) => u.email === email)) {
        throw new Error("Email already exists");
      }
      
      const newUser = {
        id: crypto.randomUUID(),
        email,
        password,
        name,
        role,
      };
      
      storedUsers.push(newUser);
      localStorage.setItem("koralink_users", JSON.stringify(storedUsers));
      
      const userData: User = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      };
      
      const token = btoa(JSON.stringify({ id: userData.id, exp: Date.now() + 86400000 }));
      localStorage.setItem("koralink_token", token);
      localStorage.setItem("koralink_user", JSON.stringify(userData));
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("koralink_token");
    localStorage.removeItem("koralink_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
