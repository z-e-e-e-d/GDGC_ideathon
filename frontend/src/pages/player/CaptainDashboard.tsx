// src/pages/player/CaptainDashboard.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Users, Calendar, Clock, ChevronRight, Sparkles, Crown, Trophy, Settings } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../../components/ui/button";
import StadiumCard, { Stadium } from "../../components/StadiumCard";

const mockStadiums: Stadium[] = [
  {
    id: "1",
    name: "El Harrach Stadium",
    location: "El Harrach, Algiers",
    pricePerHour: 5000,
    rating: 4.8,
    size: 5,
    distance: "1.2 km",
    availableSlots: 3,
  },
];

const teamMembers = [
  { id: "1", name: "Ali Ben", position: "Forward", status: "Active" },
  { id: "2", name: "Mohammed Said", position: "Midfielder", status: "Active" },
  { id: "3", name: "Karim Z.", position: "Defender", status: "Injured" },
  { id: "4", name: "Youssef M.", position: "Goalkeeper", status: "Active" },
];

const upcomingMatches = [
  { id: "1", opponent: "FC Eagles", date: "Today", time: "18:00", stadium: "El Harrach Stadium" },
  { id: "2", opponent: "Lions United", date: "Tomorrow", time: "20:00", stadium: "Bab Ezzouar Pitch" },
];

const CaptainDashboard = () => {
  const { user } = useAuth();
  const [_, setSelectedStadium] = useState<Stadium | null>(null);

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-amber-500" />
            <h1 className="font-display text-2xl md:text-3xl text-foreground">
              {greeting}, Captain {user?.name?.split(" ")[0]}! ⚽
            </h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Manage your team and schedule matches
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/captain/create-match">
            <Button className="btn-primary gap-2">
              <Calendar className="w-4 h-4" />
              Schedule Match
            </Button>
          </Link>
          <Link to="/captain/manage-team">
            <Button variant="outline" className="gap-2">
              <Users className="w-4 h-4" />
              Manage Team
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Trophy, label: "Team Wins", value: "12", color: "amber", trend: "3 win streak" },
          { icon: Users, label: "Team Size", value: "8/11", color: "blue", trend: "3 spots open" },
          { icon: Calendar, label: "Upcoming Matches", value: "4", color: "green", trend: "Next: Today" },
          { icon: Clock, label: "Training Hours", value: "24", color: "purple", trend: "Weekly: 6h" },
        ].map((stat, index) => (
          <div key={index} className="card-stadium p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-lg bg-${stat.color}-500/10 flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
              </div>
            </div>
            <p className="font-display text-2xl text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xs text-primary mt-1">{stat.trend}</p>
          </div>
        ))}
      </div>

      {/* Team Members */}
      <div className="card-stadium p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-xl text-foreground">Team Members</h2>
            <p className="text-sm text-muted-foreground">Manage your squad</p>
          </div>
          <Link to="/captain/manage-team" className="text-primary text-sm hover:underline flex items-center gap-1">
            Manage Team <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {teamMembers.map((player) => (
            <div key={player.id} className="border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="font-medium text-primary">
                    {player.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{player.name}</p>
                  <p className="text-sm text-muted-foreground">{player.position}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm px-2 py-1 rounded ${
                  player.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {player.status}
                </span>
                <Button size="sm" variant="ghost">
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Matches */}
      <div className="card-stadium p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-foreground">Upcoming Matches</h2>
          <Link to="/captain/schedule" className="text-primary text-sm hover:underline flex items-center gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {upcomingMatches.length > 0 ? (
          <div className="space-y-3">
            {upcomingMatches.map((match) => (
              <div
                key={match.id}
                className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">vs {match.opponent}</p>
                    <p className="text-sm text-muted-foreground">{match.stadium}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">{match.time}</p>
                  <p className="text-sm text-muted-foreground">{match.date}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No upcoming matches scheduled</p>
            <Link to="/captain/create-match">
              <Button variant="link" className="text-primary">Schedule a match now</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Stadium Recommendations */}
      <div className="card-stadium p-6 border-primary/30">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-display text-xl text-foreground">Available Stadiums</h2>
        </div>
        <p className="text-muted-foreground mb-4 text-sm">
          Perfect for your next team match
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {mockStadiums.map((stadium) => (
            <StadiumCard
              key={stadium.id}
              stadium={stadium}
              onViewDetails={setSelectedStadium}
              onBook={setSelectedStadium}
            />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4">
        <Link to="/captain/create-match" className="card-stadium p-6 group cursor-pointer">
          <Calendar className="w-10 h-10 text-primary mb-4 transition-transform group-hover:scale-110" />
          <h3 className="font-display text-lg text-foreground mb-2">Schedule Match</h3>
          <p className="text-sm text-muted-foreground">Book stadium for team match</p>
        </Link>
        <Link to="/captain/manage-team" className="card-stadium p-6 group cursor-pointer">
          <Users className="w-10 h-10 text-primary mb-4 transition-transform group-hover:scale-110" />
          <h3 className="font-display text-lg text-foreground mb-2">Manage Team</h3>
          <p className="text-sm text-muted-foreground">Edit lineup and invites</p>
        </Link>
        <Link to="/captain/recruit" className="card-stadium p-6 group cursor-pointer">
          <Users className="w-10 h-10 text-primary mb-4 transition-transform group-hover:scale-110" />
          <h3 className="font-display text-lg text-foreground mb-2">Recruit Players</h3>
          <p className="text-sm text-muted-foreground">Find new team members</p>
        </Link>
        <Link to="/captain/settings" className="card-stadium p-6 group cursor-pointer">
          <Settings className="w-10 h-10 text-primary mb-4 transition-transform group-hover:scale-110" />
          <h3 className="font-display text-lg text-foreground mb-2">Team Settings</h3>
          <p className="text-sm text-muted-foreground">Configure team preferences</p>
        </Link>
      </div>
    </div>
  );
};

export default CaptainDashboard;