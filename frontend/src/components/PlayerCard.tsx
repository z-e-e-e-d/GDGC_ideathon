import { User } from "lucide-react";

export interface Player {
  id: string;
  name: string;
  age: number;
  position: string;
  level: number;
  avatar?: string;
}

interface PlayerCardProps {
  player: Player;
  variant?: "default" | "gold" | "silver";
  animationDelay?: number;
  showAnimation?: boolean;
}

const positionColors: Record<string, string> = {
  GK: "from-yellow-500 to-yellow-700",
  CB: "from-blue-500 to-blue-700",
  LB: "from-blue-400 to-blue-600",
  RB: "from-blue-400 to-blue-600",
  CDM: "from-green-600 to-green-800",
  CM: "from-green-500 to-green-700",
  CAM: "from-green-400 to-green-600",
  LW: "from-red-400 to-red-600",
  RW: "from-red-400 to-red-600",
  ST: "from-red-500 to-red-700",
};

const PlayerCard = ({ player, variant = "default", animationDelay = 0, showAnimation = false }: PlayerCardProps) => {
  const cardClass = variant === "gold" ? "player-card-gold" : variant === "silver" ? "player-card-silver" : "player-card";
  const positionGradient = positionColors[player.position] || "from-gray-500 to-gray-700";

  return (
    <div
      className={`${cardClass} w-40 h-56 flex flex-col items-center justify-between p-4 relative overflow-hidden ${
        showAnimation ? "animate-lineup-reveal opacity-0" : ""
      }`}
      style={{ animationDelay: `${animationDelay}ms`, animationFillMode: "forwards" }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
        <div className="absolute inset-0 pitch-pattern" />
      </div>

      {/* Level Badge */}
      <div className="absolute top-2 left-2 flex flex-col items-center">
        <span className="text-2xl font-display text-foreground">{player.level}</span>
        <span className="text-[10px] uppercase text-muted-foreground tracking-wider">OVR</span>
      </div>

      {/* Position Badge */}
      <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-bold bg-gradient-to-r ${positionGradient} text-white`}>
        {player.position}
      </div>

      {/* Avatar */}
      <div className="w-20 h-20 rounded-full bg-secondary/50 border-2 border-primary/30 flex items-center justify-center overflow-hidden mt-6">
        {player.avatar ? (
          <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
        ) : (
          <User className="w-10 h-10 text-muted-foreground" />
        )}
      </div>

      {/* Player Info */}
      <div className="text-center relative z-10">
        <h4 className="font-display text-sm text-foreground uppercase tracking-wide truncate max-w-full px-2">
          {player.name}
        </h4>
        <p className="text-xs text-muted-foreground">{player.age} years</p>
      </div>

      {/* Bottom Stats Bar */}
      <div className="w-full h-1 bg-secondary/30 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${player.level * 10}%` }}
        />
      </div>
    </div>
  );
};

export default PlayerCard;
