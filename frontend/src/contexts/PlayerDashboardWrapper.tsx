// src/pages/player/PlayerDashboard.tsx
import { useAuth } from "../contexts/AuthContext";
import RegularPlayerDashboard from "../pages/player/RegularPlayerDashboard";
import CaptainDashboard from "../pages/player/CaptainDashboard";

const PlayerDashboard = () => {
  const { user } = useAuth();

  // Check if user is a captain
  if (user?.playerType === "captain") {
    return <CaptainDashboard />;
  }

  // Default to regular player dashboard
  return <RegularPlayerDashboard />;
};

export default PlayerDashboard;