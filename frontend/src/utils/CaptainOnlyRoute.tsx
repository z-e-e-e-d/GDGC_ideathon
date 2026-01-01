// src/utils/CaptainOnlyRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface CaptainOnlyRouteProps {
  children: React.ReactNode;
}

const CaptainOnlyRoute = ({ children }: CaptainOnlyRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is a captain
  if (!user || user.playerType !== "captain") {
    console.log("User is not a captain. PlayerType:", user?.playerType);
    return <Navigate to="/player" replace />;
  }

  return <>{children}</>;
};

export default CaptainOnlyRoute;