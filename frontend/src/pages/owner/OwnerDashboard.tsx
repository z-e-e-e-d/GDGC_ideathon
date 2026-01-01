import { Link } from "react-router-dom";
import {
  Building2,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  ChevronRight,
  CheckCircle,
  XCircle,
  Hourglass,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../../components/ui/button";

const recentRequests = [
  { id: "1", team: "FC Lions", stadium: "El Harrach Stadium", date: "Today", time: "18:00", status: "pending" },
  { id: "2", team: "Eagles United", stadium: "El Harrach Stadium", date: "Tomorrow", time: "16:00", status: "pending" },
  { id: "3", team: "Thunder FC", stadium: "Bab Ezzouar Pitch", date: "Jan 15", time: "20:00", status: "accepted" },
];

const OwnerDashboard = () => {
  const { user } = useAuth();

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Hourglass className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-foreground">
            {greeting}, {user?.name?.split(" ")[0]}! 🏟️
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your stadiums
          </p>
        </div>
        <Link to="/owner/stadiums">
          <Button className="btn-primary gap-2">
            <Building2 className="w-4 h-4" />
            Manage Stadiums
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Building2, label: "Active Stadiums", value: "3", trend: "+1 this month" },
          { icon: Calendar, label: "Bookings Today", value: "8", trend: "2 pending" },
          { icon: DollarSign, label: "Revenue (Week)", value: "45,000", suffix: "DZD" },
          { icon: TrendingUp, label: "Occupancy Rate", value: "78%", trend: "+5% vs last week" },
        ].map((stat, index) => (
          <div key={index} className="card-stadium p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="font-display text-2xl text-foreground">
              {stat.value}
              {stat.suffix && <span className="text-sm text-muted-foreground ml-1">{stat.suffix}</span>}
            </p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            {stat.trend && <p className="text-xs text-primary mt-1">{stat.trend}</p>}
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <div className="card-stadium p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-foreground">Recent Requests</h2>
            <Link to="/owner/requests" className="text-primary text-sm hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(request.status)}
                  <div>
                    <p className="font-medium text-foreground">{request.team}</p>
                    <p className="text-sm text-muted-foreground">
                      {request.stadium} • {request.date}, {request.time}
                    </p>
                  </div>
                </div>
                {request.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-destructive text-destructive h-8">
                      Reject
                    </Button>
                    <Button size="sm" className="btn-primary h-8">
                      Accept
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="card-stadium p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-foreground">Today's Schedule</h2>
            <Link to="/owner/timeline" className="text-primary text-sm hover:underline flex items-center gap-1">
              Full timeline <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {[
              { time: "09:00 - 10:00", team: "FC Eagles", stadium: "El Harrach Stadium" },
              { time: "10:00 - 11:00", team: "Available", stadium: "El Harrach Stadium", available: true },
              { time: "11:00 - 12:00", team: "Thunder FC", stadium: "El Harrach Stadium" },
              { time: "14:00 - 15:00", team: "Lions United", stadium: "Bab Ezzouar Pitch" },
              { time: "16:00 - 17:00", team: "Available", stadium: "Bab Ezzouar Pitch", available: true },
            ].map((slot, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl flex items-center justify-between ${
                  slot.available ? "bg-primary/10 border border-primary/30" : "bg-secondary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Clock className={`w-5 h-5 ${slot.available ? "text-primary" : "text-muted-foreground"}`} />
                  <div>
                    <p className={`font-medium ${slot.available ? "text-primary" : "text-foreground"}`}>
                      {slot.team}
                    </p>
                    <p className="text-sm text-muted-foreground">{slot.stadium}</p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{slot.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link to="/owner/stadiums" className="card-stadium p-6 group cursor-pointer">
          <Building2 className="w-10 h-10 text-primary mb-4 transition-transform group-hover:scale-110" />
          <h3 className="font-display text-lg text-foreground mb-2">Add Stadium</h3>
          <p className="text-sm text-muted-foreground">Register a new stadium to the platform</p>
        </Link>
        <Link to="/owner/timeline" className="card-stadium p-6 group cursor-pointer">
          <Calendar className="w-10 h-10 text-primary mb-4 transition-transform group-hover:scale-110" />
          <h3 className="font-display text-lg text-foreground mb-2">Manage Schedule</h3>
          <p className="text-sm text-muted-foreground">Update availability and time slots</p>
        </Link>
        <Link to="/owner/analytics" className="card-stadium p-6 group cursor-pointer">
          <TrendingUp className="w-10 h-10 text-primary mb-4 transition-transform group-hover:scale-110" />
          <h3 className="font-display text-lg text-foreground mb-2">View Analytics</h3>
          <p className="text-sm text-muted-foreground">Track performance and revenue</p>
        </Link>
      </div>
    </div>
  );
};

export default OwnerDashboard;
