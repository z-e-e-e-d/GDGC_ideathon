import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Users, Calendar, Clock, ChevronRight, Sparkles, TrendingUp } from "lucide-react";
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
  { id: "1", opponent: "FC Eagles", date: "Today", time: "18:00", stadium: "El Harrach Stadium" },
  { id: "2", opponent: "Lions United", date: "Tomorrow", time: "20:00", stadium: "Bab Ezzouar Pitch" },
];

const PlayerDashboard = () => {
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
            Ready to find your next match?
          </p>
        </div>
        <Link to="/player/stadiums">
          <Button className="btn-primary gap-2">
            <MapPin className="w-4 h-4" />
            Find Stadiums
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Calendar, label: "Matches Played", value: "24", trend: "+3 this month" },
          { icon: Users, label: "Team Members", value: "8", trend: "Full squad" },
          { icon: Clock, label: "Hours Played", value: "48", trend: "+12 this month" },
          { icon: TrendingUp, label: "Win Rate", value: "67%", trend: "+5% improvement" },
        ].map((stat, index) => (
          <div key={index} className="card-stadium p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
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
            <p className="text-muted-foreground">No upcoming matches</p>
            <Link to="/player/stadiums">
              <Button variant="link" className="text-primary">Book a stadium now</Button>
            </Link>
          </div>
        )}
      </div>

      {/* AI Recommendations */}
      <div className="card-stadium p-6 border-primary/30">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-display text-xl text-foreground">Recommended for You</h2>
        </div>
        <p className="text-muted-foreground mb-4 text-sm">
          Based on your playing history and preferences
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
      <div className="grid md:grid-cols-3 gap-4">
        <Link to="/player/teams" className="card-stadium p-6 group cursor-pointer">
          <Users className="w-10 h-10 text-primary mb-4 transition-transform group-hover:scale-110" />
          <h3 className="font-display text-lg text-foreground mb-2">Manage Team</h3>
          <p className="text-sm text-muted-foreground">View and edit your team lineup</p>
        </Link>
        <Link to="/player/find-players" className="card-stadium p-6 group cursor-pointer">
          <Users className="w-10 h-10 text-primary mb-4 transition-transform group-hover:scale-110" />
          <h3 className="font-display text-lg text-foreground mb-2">Find Players</h3>
          <p className="text-sm text-muted-foreground">Discover players looking for teams</p>
        </Link>
        <Link to="/player/bookings" className="card-stadium p-6 group cursor-pointer">
          <Calendar className="w-10 h-10 text-primary mb-4 transition-transform group-hover:scale-110" />
          <h3 className="font-display text-lg text-foreground mb-2">Match History</h3>
          <p className="text-sm text-muted-foreground">View your past matches and stats</p>
        </Link>
      </div>
    </div>
  );
};

export default PlayerDashboard;
