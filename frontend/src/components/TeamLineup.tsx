import { useState, useEffect } from "react";
import PlayerCard, { Player } from "./PlayerCard";

interface TeamLineupProps {
  players: Player[];
  teamName: string;
  formation?: string;
  showAnimation?: boolean;
}

const TeamLineup = ({ players, teamName, formation = "4-3-3", showAnimation = true }: TeamLineupProps) => {
  const [animationStarted, setAnimationStarted] = useState(false);

  useEffect(() => {
    if (showAnimation) {
      const timer = setTimeout(() => setAnimationStarted(true), 300);
      return () => clearTimeout(timer);
    }
  }, [showAnimation]);

  // Position players based on formation
  const getPositionStyle = (index: number, total: number): React.CSSProperties => {
    const formations: Record<string, number[][]> = {
      "4-3-3": [
        [50, 90], // GK
        [15, 70], [35, 70], [65, 70], [85, 70], // Defenders
        [25, 45], [50, 45], [75, 45], // Midfielders
        [25, 20], [50, 15], [75, 20], // Attackers
      ],
      "4-4-2": [
        [50, 90],
        [15, 70], [35, 70], [65, 70], [85, 70],
        [15, 45], [38, 45], [62, 45], [85, 45],
        [35, 20], [65, 20],
      ],
    };

    const positions = formations[formation] || formations["4-3-3"];
    const pos = positions[index] || [50, 50];

    return {
      position: "absolute",
      left: `${pos[0]}%`,
      top: `${pos[1]}%`,
      transform: "translate(-50%, -50%)",
    };
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Team Name */}
      <div className="text-center mb-6">
        <h3 className="font-display text-2xl text-foreground">{teamName}</h3>
        <p className="text-sm text-muted-foreground">Formation: {formation}</p>
      </div>

      {/* Pitch */}
      <div className="relative w-full aspect-[3/4] md:aspect-[4/3] bg-gradient-to-b from-green-800 to-green-900 rounded-2xl overflow-hidden border-4 border-green-700">
        {/* Pitch Markings */}
        <div className="absolute inset-4 border-2 border-white/30 rounded-lg">
          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-white/30" />
          
          {/* Center Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/30" />
          
          {/* Penalty Areas */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1/6 border-2 border-b-0 border-white/30" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/6 border-2 border-t-0 border-white/30" />
        </div>

        {/* Grass Pattern */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={`absolute left-0 right-0 h-[10%] ${i % 2 === 0 ? "bg-green-600" : "bg-green-700"}`}
              style={{ top: `${i * 10}%` }}
            />
          ))}
        </div>

        {/* Players */}
        <div className="absolute inset-8 md:inset-12">
          {players.slice(0, 11).map((player, index) => (
            <div key={player.id} style={getPositionStyle(index, players.length)} className="z-10">
              <div className="transform scale-[0.6] md:scale-75 lg:scale-90 origin-center">
                <PlayerCard
                  player={player}
                  variant={player.level >= 8 ? "gold" : player.level >= 6 ? "silver" : "default"}
                  animationDelay={index * 150}
                  showAnimation={animationStarted}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Stadium Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

export default TeamLineup;
