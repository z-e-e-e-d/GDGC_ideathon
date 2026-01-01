// ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ProtectedRoute.tsx - Updated with admin redirect
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    console.log(`User role ${user.role} not in allowed roles: ${allowedRoles}`);

    // Redirect based on role
    if (user.role === "player") {
      return <Navigate to="/player" replace />;
    } else if (user.role === "owner") {
      return <Navigate to="/owner" replace />;
    } else if (user.role === "admin") {
      // Redirect admin to home or create admin dashboard
      return <Navigate to="/" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
