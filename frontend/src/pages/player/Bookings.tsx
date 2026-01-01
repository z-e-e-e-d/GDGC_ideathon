import { useState } from "react";
import { Calendar, Clock, MapPin, Users, CheckCircle, XCircle, Hourglass } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";

interface Booking {
  id: string;
  stadium: string;
  location: string;
  date: string;
  time: string;
  opponent?: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  price: number;
}

const mockBookings: Booking[] = [
  {
    id: "1",
    stadium: "El Harrach Stadium",
    location: "El Harrach, Algiers",
    date: "Today",
    time: "18:00 - 19:00",
    opponent: "FC Eagles",
    status: "accepted",
    price: 5000,
  },
  {
    id: "2",
    stadium: "Bab Ezzouar Pitch",
    location: "Bab Ezzouar, Algiers",
    date: "Tomorrow",
    time: "20:00 - 21:00",
    status: "pending",
    price: 4500,
  },
  {
    id: "3",
    stadium: "Hussein Dey Arena",
    location: "Hussein Dey, Algiers",
    date: "Jan 15, 2024",
    time: "16:00 - 17:00",
    opponent: "Lions United",
    status: "completed",
    price: 6000,
  },
  {
    id: "4",
    stadium: "Kouba Sports Center",
    location: "Kouba, Algiers",
    date: "Jan 10, 2024",
    time: "19:00 - 20:00",
    status: "rejected",
    price: 3500,
  },
];

const Bookings = () => {
  const [activeTab, setActiveTab] = useState("upcoming");

  const getStatusIcon = (status: Booking["status"]) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-destructive" />;
      case "pending":
        return <Hourglass className="w-5 h-5 text-yellow-500" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: Booking["status"]) => {
    const styles = {
      accepted: "bg-green-500/20 text-green-400 border-green-500/30",
      rejected: "bg-destructive/20 text-destructive border-destructive/30",
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      completed: "bg-muted text-muted-foreground border-border",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const upcomingBookings = mockBookings.filter(
    (b) => b.status === "accepted" || b.status === "pending"
  );
  const pastBookings = mockBookings.filter(
    (b) => b.status === "completed" || b.status === "rejected"
  );

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <div className="card-stadium p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {getStatusIcon(booking.status)}
          <div>
            <h3 className="font-display text-lg text-foreground">{booking.stadium}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {booking.location}
            </p>
          </div>
        </div>
        {getStatusBadge(booking.status)}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">{booking.date}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="text-sm">{booking.time}</span>
        </div>
      </div>

      {booking.opponent && (
        <div className="flex items-center gap-2 text-muted-foreground mb-4">
          <Users className="w-4 h-4" />
          <span className="text-sm">vs {booking.opponent}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div>
          <span className="text-xl font-display text-primary">{booking.price}</span>
          <span className="text-sm text-muted-foreground"> DZD</span>
        </div>
        {booking.status === "pending" && (
          <Button variant="outline" size="sm" className="border-destructive text-destructive">
            Cancel
          </Button>
        )}
        {booking.status === "accepted" && (
          <Button size="sm" className="btn-primary">
            View Details
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl text-foreground">My Bookings</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your stadium bookings
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Bookings", value: mockBookings.length, color: "text-foreground" },
          { label: "Confirmed", value: upcomingBookings.filter(b => b.status === "accepted").length, color: "text-green-400" },
          { label: "Pending", value: upcomingBookings.filter(b => b.status === "pending").length, color: "text-yellow-400" },
          { label: "Completed", value: pastBookings.filter(b => b.status === "completed").length, color: "text-muted-foreground" },
        ].map((stat, i) => (
          <div key={i} className="card-stadium p-4 text-center">
            <p className={`font-display text-2xl ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-secondary">
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Past ({pastBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {upcomingBookings.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {upcomingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No upcoming bookings</p>
              <Button variant="link" className="text-primary">
                Find a stadium to book
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {pastBookings.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {pastBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No past bookings</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Bookings;
