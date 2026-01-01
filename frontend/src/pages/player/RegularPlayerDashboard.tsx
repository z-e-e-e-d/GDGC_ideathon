// src/pages/player/RegularPlayerDashboard.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Users, Calendar, Clock, ChevronRight, Sparkles, Star, Search } from "lucide-react";
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
  {
    id: "2",
    name: "Bab Ezzouar Pitch",
    location: "Bab Ezzouar, Algiers",
    pricePerHour: 4500,
    rating: 4.5,
    size: 7,
    distance: "2.5 km",
    availableSlots: 5,
  },
  {
    id: "3",
    name: "Hussein Dey Arena",
    location: "Hussein Dey, Algiers",
    pricePerHour: 6000,
    rating: 4.9,
    size: 11,
    distance: "3.8 km",
    availableSlots: 2,
  },
];

const upcomingMatches = [
  { id: "1", team: "FC Eagles", date: "Today", time: "18:00", stadium: "El Harrach Stadium" },
  { id: "2", team: "Lions United", date: "Tomorrow", time: "20:00", stadium: "Bab Ezzouar Pitch" },
];

const RegularPlayerDashboard = () => {
  const { user } = useAuth();
  const [_, setSelectedStadium] = useState<Stadium | null>(null);

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-foreground">
            {greeting}, {user?.name?.split(" ")[0]}! ⚽
          </h1>
          <p className="text-muted-foreground mt-1">
            Ready to find your next match or team?
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/player/stadiums">
            <Button className="btn-primary gap-2">
              <MapPin className="w-4 h-4" />
              Find Stadiums
            </Button>
          </Link>
          <Link to="/player/find-teams">
            <Button variant="outline" className="gap-2">
              <Users className="w-4 h-4" />
              Find Teams
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Calendar, label: "Matches Played", value: "24", color: "blue", trend: "+3 this month" },
          { icon: Star, label: "Teams Joined", value: "3", color: "amber", trend: "Active in 2" },
          { icon: Clock, label: "Hours Played", value: "48", color: "green", trend: "+12 this month" },
          { icon: Users, label: "Team Invites", value: "5", color: "purple", trend: "2 pending" },
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

      {/* Upcoming Matches */}
      <div className="card-stadium p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-foreground">Upcoming Matches</h2>
          <Link to="/player/bookings" className="text-primary text-sm hover:underline flex items-center gap-1">
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
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{match.team}</p>
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
            <p className="text-muted-foreground">No upcoming matches</p>
            <Link to="/player/find-teams">
              <Button variant="link" className="text-primary">Join a team to play matches</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Recommended Teams */}
      <div className="card-stadium p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-display text-xl text-foreground">Teams Looking for Players</h2>
        </div>
        <p className="text-muted-foreground mb-4 text-sm">
          Teams in your area that match your skill level
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: "FC Eagles", location: "El Harrach", players: "8/11", skill: "Intermediate" },
            { name: "Lions United", location: "Bab Ezzouar", players: "9/11", skill: "Advanced" },
            { name: "Young Stars", location: "Hussein Dey", players: "7/11", skill: "Beginner" },
          ].map((team, index) => (
            <div key={index} className="border rounded-xl p-4 hover:border-primary transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-medium text-foreground">{team.name}</h3>
                  <p className="text-sm text-muted-foreground">{team.location}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">{team.players}</p>
                  <p className="text-xs text-muted-foreground">players</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {team.skill}
                </span>
                <Button size="sm" variant="outline">
                  Request to Join
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4">
        <Link to="/player/stadiums" className="card-stadium p-6 group cursor-pointer">
          <Search className="w-10 h-10 text-primary mb-4 transition-transform group-hover:scale-110" />
          <h3 className="font-display text-lg text-foreground mb-2">Find Stadiums</h3>
          <p className="text-sm text-muted-foreground">Book pitches for casual games</p>
        </Link>
        <Link to="/player/find-teams" className="card-stadium p-6 group cursor-pointer">
          <Users className="w-10 h-10 text-primary mb-4 transition-transform group-hover:scale-110" />
          <h3 className="font-display text-lg text-foreground mb-2">Join a Team</h3>
          <p className="text-sm text-muted-foreground">Find teams looking for players</p>
        </Link>
        <Link to="/player/bookings" className="card-stadium p-6 group cursor-pointer">
          <Calendar className="w-10 h-10 text-primary mb-4 transition-transform group-hover:scale-110" />
          <h3 className="font-display text-lg text-foreground mb-2">My Bookings</h3>
          <p className="text-sm text-muted-foreground">View upcoming matches</p>
        </Link>
        <Link to="/player/stats" className="card-stadium p-6 group cursor-pointer">
          <Star className="w-10 h-10 text-primary mb-4 transition-transform group-hover:scale-110" />
          <h3 className="font-display text-lg text-foreground mb-2">My Stats</h3>
          <p className="text-sm text-muted-foreground">Track your performance</p>
        </Link>
      </div>
    </div>
  );
};

export default RegularPlayerDashboard;