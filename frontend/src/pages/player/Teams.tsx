import { useState } from "react";
import { Users, Plus, UserPlus, Edit, Eye } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import TeamLineup from "../../components/TeamLineup";
import PlayerCard, { Player } from "../../components/PlayerCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const positions = ["GK", "CB", "LB", "RB", "CDM", "CM", "CAM", "LW", "RW", "ST"];

const mockTeamPlayers: Player[] = [
  { id: "1", name: "Ahmed B.", age: 24, position: "GK", level: 7 },
  { id: "2", name: "Youssef M.", age: 22, position: "CB", level: 8 },
  { id: "3", name: "Karim A.", age: 25, position: "CB", level: 7 },
  { id: "4", name: "Sofiane R.", age: 23, position: "LB", level: 6 },
  { id: "5", name: "Amine T.", age: 21, position: "RB", level: 7 },
  { id: "6", name: "Mohamed S.", age: 26, position: "CDM", level: 8 },
  { id: "7", name: "Bilal K.", age: 24, position: "CM", level: 9 },
  { id: "8", name: "Rayan H.", age: 22, position: "CAM", level: 8 },
  { id: "9", name: "Nabil F.", age: 23, position: "LW", level: 7 },
  { id: "10", name: "Walid B.", age: 25, position: "RW", level: 8 },
  { id: "11", name: "Ismail L.", age: 24, position: "ST", level: 9 },
];

const availableTeams = [
  { id: "1", name: "FC Eagles", level: "Intermediate", playersNeeded: 3, positions: ["CB", "CM", "ST"] },
  { id: "2", name: "Lions United", level: "Advanced", playersNeeded: 1, positions: ["GK"] },
  { id: "3", name: "Thunder FC", level: "Beginner", playersNeeded: 5, positions: ["CB", "LB", "RB", "LW", "RW"] },
];

const Teams = () => {
  const [hasTeam] = useState(true);
  const [teamName] = useState("FC Lions");
  const [players, setPlayers] = useState<Player[]>(mockTeamPlayers);
  const [showLineup, setShowLineup] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ name: "", age: "", position: "CM", level: "5" });

  const handleAddPlayer = () => {
    if (newPlayer.name && newPlayer.age) {
      const player: Player = {
        id: Date.now().toString(),
        name: newPlayer.name,
        age: parseInt(newPlayer.age),
        position: newPlayer.position,
        level: parseInt(newPlayer.level),
      };
      setPlayers([...players, player]);
      setNewPlayer({ name: "", age: "", position: "CM", level: "5" });
    }
  };

  if (!hasTeam) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-foreground">Teams</h1>
          <p className="text-muted-foreground mt-1">
            Create your own team or join an existing one
          </p>
        </div>

        {/* Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Create Team */}
          <div className="card-stadium p-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Plus className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-display text-xl text-foreground mb-2">Create a Team</h2>
            <p className="text-muted-foreground mb-6">
              Start your own team and invite players to join
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="btn-primary">Create Team</Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Create Your Team</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Team Name</Label>
                    <Input className="mt-2 bg-input border-border" placeholder="Enter team name" />
                  </div>
                  <Button className="w-full btn-primary">Create Team</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Join Team */}
          <div className="card-stadium p-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <UserPlus className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-display text-xl text-foreground mb-2">Join a Team</h2>
            <p className="text-muted-foreground mb-6">
              Find teams looking for players like you
            </p>
            <Button variant="outline" className="border-primary text-primary">
              Browse Teams
            </Button>
          </div>
        </div>

        {/* Available Teams */}
        <div>
          <h2 className="font-display text-xl text-foreground mb-4">Teams Looking for Players</h2>
          <div className="grid gap-4">
            {availableTeams.map((team) => (
              <div key={team.id} className="card-stadium p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Users className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{team.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {team.level} • Looking for {team.playersNeeded} players
                    </p>
                    <p className="text-xs text-primary mt-1">
                      Positions: {team.positions.join(", ")}
                    </p>
                  </div>
                </div>
                <Button className="btn-primary">Request to Join</Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-foreground">{teamName}</h1>
          <p className="text-muted-foreground mt-1">
            {players.length} players • Formation: 4-3-3
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-border gap-2"
            onClick={() => setShowLineup(!showLineup)}
          >
            <Eye className="w-4 h-4" />
            {showLineup ? "Hide Lineup" : "View Lineup"}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="btn-primary gap-2">
                <Plus className="w-4 h-4" />
                Add Player
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Add New Player</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Player Name</Label>
                  <Input
                    className="mt-2 bg-input border-border"
                    placeholder="Enter player name"
                    value={newPlayer.name}
                    onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Age</Label>
                    <Input
                      type="number"
                      className="mt-2 bg-input border-border"
                      placeholder="Age"
                      value={newPlayer.age}
                      onChange={(e) => setNewPlayer({ ...newPlayer, age: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Level (1-10)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      className="mt-2 bg-input border-border"
                      placeholder="Level"
                      value={newPlayer.level}
                      onChange={(e) => setNewPlayer({ ...newPlayer, level: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Position</Label>
                  <Select
                    value={newPlayer.position}
                    onValueChange={(val) => setNewPlayer({ ...newPlayer, position: val })}
                  >
                    <SelectTrigger className="mt-2 bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {positions.map((pos) => (
                        <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full btn-primary" onClick={handleAddPlayer}>
                  Add Player
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lineup View */}
      {showLineup && (
        <div className="animate-scale-in">
          <TeamLineup players={players} teamName={teamName} formation="4-3-3" />
        </div>
      )}

      {/* Players Grid */}
      <div>
        <h2 className="font-display text-xl text-foreground mb-4">Squad</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {players.map((player, index) => (
            <div key={player.id} className="relative group">
              <PlayerCard
                player={player}
                variant={player.level >= 8 ? "gold" : player.level >= 6 ? "silver" : "default"}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                <Button size="icon" variant="ghost" className="text-white">
                  <Edit className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Teams;
