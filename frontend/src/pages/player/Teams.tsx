import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  UserPlus,
  Eye,
  Mail,
  UserCheck,
  Loader2,
  Trophy,
  Users as UsersIcon,
  Target,
  Award,
} from "lucide-react";
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
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { useToast } from "../../hooks/use-toast";
import { useAuth } from "../../contexts/AuthContext";
import * as TeamService from "../../services/team";

const Teams = () => {
  const [hasTeam, setHasTeam] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamId, setTeamId] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [showLineup, setShowLineup] = useState(false);
  const [newPlayerEmail, setNewPlayerEmail] = useState("");
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false);
  const [newTeamData, setNewTeamData] = useState({
    name: "",
    maxPlayers: 7,
    skillLevel: "intermediate" as "beginner" | "intermediate" | "advanced",
    positionsNeeded: "",
  });
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [availableTeams, setAvailableTeams] = useState<any[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();

  const positions = [
    "GK",
    "CB",
    "LB",
    "RB",
    "CDM",
    "CM",
    "CAM",
    "LW",
    "RW",
    "ST",
    "ALL",
  ];

  useEffect(() => {
    if (user) {
      if (user.playerType === "captain") {
        fetchMyTeam();
      } else {
        fetchAvailableTeams();
        setIsLoading(false);
      }
    }
  }, [user]);

  const fetchMyTeam = async () => {
    if (user?.playerType !== "captain") return;

    try {
      setIsLoading(true);
      const result = await TeamService.getMyTeam();
      setTeamName(result.team.name);
      setTeamId(result.team._id);
      setPlayers(
        result.team.players.map((player) => ({
          id: player._id,
          name: player.fullName,
          email: player.email,
          position: player.position || "CM",
          level: 7, // Default level, can be enhanced based on skillLevel
        }))
      );
      setHasTeam(true);
    } catch (error: any) {
      console.log("No team found:", error.message);
      setHasTeam(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableTeams = async () => {
    try {
      setIsLoadingTeams(true);
      const result = await TeamService.getAllTeams();
      setAvailableTeams(
        result.teams.map((team) => ({
          id: team._id,
          name: team.name,
          skillLevel: team.skillLevel,
          players: team.players.length,
          maxPlayers: team.maxPlayers,
          captainName: team.captain.fullName,
          positionsNeeded: team.positionsNeeded || "All positions",
        }))
      );
    } catch (error: any) {
      console.error("Error fetching teams:", error.message);
      toast({
        title: "Failed to load teams",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingTeams(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamData.name.trim()) {
      toast({
        title: "Team name required",
        description: "Please enter a team name",
        variant: "destructive",
      });
      return;
    }

    if (newTeamData.maxPlayers < 5 || newTeamData.maxPlayers > 22) {
      toast({
        title: "Invalid team size",
        description: "Team size must be between 5 and 22 players",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreatingTeam(true);
      const result = await TeamService.createTeam({
        name: newTeamData.name,
        maxPlayers: newTeamData.maxPlayers,
        skillLevel: newTeamData.skillLevel,
        players: [], // Empty array, captain will be added automatically
      });

      toast({
        title: "Team created!",
        description: `Successfully created team "${result.team.name}"`,
      });

      setTeamName(result.team.name);
      setTeamId(result.team._id);
      setHasTeam(true);
      setShowCreateTeamDialog(false);
      setNewTeamData({
        name: "",
        maxPlayers: 7,
        skillLevel: "intermediate",
        positionsNeeded: "",
      });

      // Refresh team data
      fetchMyTeam();
    } catch (error: any) {
      toast({
        title: "Failed to create team",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const handleAddPlayerByEmail = async () => {
    if (!newPlayerEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter the player's email",
        variant: "destructive",
      });
      return;
    }

    if (!teamId) {
      toast({
        title: "No team selected",
        description: "Please create or select a team first",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAddingPlayer(true);
      const result = await TeamService.addPlayerByEmail(teamId, newPlayerEmail);

      toast({
        title: "Player added!",
        description: `Successfully added ${result.addedPlayer.fullName} to your team`,
      });

      // Refresh team data
      fetchMyTeam();
      setNewPlayerEmail("");
    } catch (error: any) {
      toast({
        title: "Failed to add player",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAddingPlayer(false);
    }
  };

  const handleRequestToJoin = async (teamId: string) => {
    try {
      const result = await TeamService.requestToJoinTeam(
        teamId,
        "I would like to join your team!"
      );
      toast({
        title: "Request sent!",
        description: result.message,
      });
    } catch (error: any) {
      toast({
        title: "Failed to send request",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateNewTeamData = (field: string, value: any) => {
    setNewTeamData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasTeam && user?.playerType === "captain") {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-foreground">
            Teams
          </h1>
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
            <h2 className="font-display text-xl text-foreground mb-2">
              Create a Team
            </h2>
            <p className="text-muted-foreground mb-6">
              Start your own team as a captain and invite players to join
            </p>
            <Dialog
              open={showCreateTeamDialog}
              onOpenChange={setShowCreateTeamDialog}
            >
              <DialogTrigger asChild>
                <Button className="btn-primary">Create Team</Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Your Team</DialogTitle>
                  <DialogDescription>
                    Fill in your team details. You can adjust these settings
                    later.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {/* Team Name */}
                  <div className="space-y-2">
                    <Label htmlFor="teamName">Team Name *</Label>
                    <Input
                      id="teamName"
                      className="bg-input border-border"
                      placeholder="Enter team name"
                      value={newTeamData.name}
                      onChange={(e) =>
                        updateNewTeamData("name", e.target.value)
                      }
                    />
                  </div>

                  {/* Max Players */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <UsersIcon className="w-4 h-4" />
                      <Label htmlFor="maxPlayers">Team Size</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        id="maxPlayers"
                        type="number"
                        min="5"
                        max="22"
                        className="bg-input border-border"
                        value={newTeamData.maxPlayers}
                        onChange={(e) =>
                          updateNewTeamData(
                            "maxPlayers",
                            parseInt(e.target.value)
                          )
                        }
                      />
                      <span className="text-sm text-muted-foreground">
                        players max
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recommended: 7v7 (7-9 players), 11v11 (11-16 players)
                    </p>
                  </div>

                  {/* Skill Level */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      <Label htmlFor="skillLevel">Team Skill Level</Label>
                    </div>
                    <Select
                      value={newTeamData.skillLevel}
                      onValueChange={(
                        value: "beginner" | "intermediate" | "advanced"
                      ) => updateNewTeamData("skillLevel", value)}
                    >
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">
                          Intermediate
                        </SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Helps match your team with similar level opponents
                    </p>
                  </div>

                  {/* Positions Needed */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      <Label htmlFor="positionsNeeded">
                        Positions Needed (Optional)
                      </Label>
                    </div>
                    <Textarea
                      id="positionsNeeded"
                      className="bg-input border-border min-h-[60px]"
                      placeholder="e.g., GK, CB, ST"
                      value={newTeamData.positionsNeeded}
                      onChange={(e) =>
                        updateNewTeamData("positionsNeeded", e.target.value)
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Which positions are you looking to fill? Leave empty for
                      all positions.
                    </p>
                  </div>

                  <DialogFooter className="pt-4">
                    <Button
                      onClick={handleCreateTeam}
                      disabled={isCreatingTeam || !newTeamData.name.trim()}
                      className="w-full btn-primary"
                    >
                      {isCreatingTeam ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Team...
                        </>
                      ) : (
                        "Create Team"
                      )}
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Browse Teams */}
          <div className="card-stadium p-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <UserPlus className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-display text-xl text-foreground mb-2">
              Browse Teams
            </h2>
            <p className="text-muted-foreground mb-6">
              Find existing teams looking for players
            </p>
            <Button
              variant="outline"
              className="border-primary text-primary"
              onClick={fetchAvailableTeams}
            >
              Browse Teams
            </Button>
          </div>
        </div>

        {/* Available Teams */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-foreground">
              Available Teams
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchAvailableTeams}
              disabled={isLoadingTeams}
            >
              {isLoadingTeams ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
          {isLoadingTeams ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground mt-2">Loading teams...</p>
            </div>
          ) : availableTeams.length > 0 ? (
            <div className="grid gap-4">
              {availableTeams.map((team) => (
                <div
                  key={team.id}
                  className="card-stadium p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Users className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">
                        {team.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Captain: {team.captainName}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            team.skillLevel === "advanced"
                              ? "bg-red-100 text-red-800"
                              : team.skillLevel === "intermediate"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {team.skillLevel}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {team.players}/{team.maxPlayers} players
                        </span>
                      </div>
                      <p className="text-xs text-primary mt-1">
                        Positions needed: {team.positionsNeeded}
                      </p>
                    </div>
                  </div>
                  <Button
                    className="btn-primary"
                    onClick={() => handleRequestToJoin(team.id)}
                  >
                    Request to Join
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 card-stadium">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                No teams available at the moment
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Create the first team or check back later
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Regular player view (no team)
  if (!hasTeam) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-foreground">
            Teams
          </h1>
          <p className="text-muted-foreground mt-1">
            Join a team to start playing matches
          </p>
        </div>

        {/* Browse Teams */}
        <div className="card-stadium p-8 text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <UserPlus className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-display text-xl text-foreground mb-2">
            Find a Team
          </h2>
          <p className="text-muted-foreground mb-6">
            Browse teams looking for players and send join requests
          </p>
          <Button
            variant="outline"
            className="border-primary text-primary"
            onClick={fetchAvailableTeams}
          >
            Browse Teams
          </Button>
        </div>

        {/* Available Teams */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-foreground">
              Teams Looking for Players
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchAvailableTeams}
              disabled={isLoadingTeams}
            >
              {isLoadingTeams ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
          {isLoadingTeams ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground mt-2">Loading teams...</p>
            </div>
          ) : availableTeams.length > 0 ? (
            <div className="grid gap-4">
              {availableTeams.map((team) => (
                <div
                  key={team.id}
                  className="card-stadium p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Users className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">
                        {team.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Captain: {team.captainName}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            team.skillLevel === "advanced"
                              ? "bg-red-100 text-red-800"
                              : team.skillLevel === "intermediate"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {team.skillLevel}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {team.players}/{team.maxPlayers} players
                        </span>
                      </div>
                      <p className="text-xs text-primary mt-1">
                        Positions needed: {team.positionsNeeded}
                      </p>
                    </div>
                  </div>
                  <Button
                    className="btn-primary"
                    onClick={() => handleRequestToJoin(team.id)}
                  >
                    Request to Join
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 card-stadium">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                No teams available at the moment
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Check back later or create your own team as a captain
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Captain with team view
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-foreground">
            {teamName}
          </h1>
          <p className="text-muted-foreground mt-1">
            {players.length} players • Captain
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
                <DialogTitle>Add Player to Team</DialogTitle>
                <DialogDescription>
                  Enter the player's email address to invite them to your team
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Player Email</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      className="pl-10 bg-input border-border"
                      placeholder="player@example.com"
                      value={newPlayerEmail}
                      onChange={(e) => setNewPlayerEmail(e.target.value)}
                      type="email"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    The player must already have a KoraLink account
                  </p>
                </div>
                <DialogFooter>
                  <Button
                    className="w-full btn-primary"
                    onClick={handleAddPlayerByEmail}
                    disabled={isAddingPlayer || !newPlayerEmail.trim()}
                  >
                    {isAddingPlayer ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4 mr-2" />
                        Add Player
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lineup View */}
      {showLineup && players.length > 0 && (
        <div className="animate-scale-in">
          <TeamLineup players={players} teamName={teamName} formation="4-3-3" />
        </div>
      )}

      {/* Players Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-foreground">Team Squad</h2>
          <span className="text-sm text-muted-foreground">
            {players.length} players
          </span>
        </div>
        {players.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {players.map((player) => (
              <div key={player.id} className="relative">
                <PlayerCard player={player} variant="default" />
                {player.email && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {player.email}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 card-stadium">
            <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No players in your team yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add players by their email address to build your squad
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Teams;
