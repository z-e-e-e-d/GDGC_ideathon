import { useState } from "react";
import { CheckCircle, XCircle, Hourglass, Calendar, Clock, Users, MapPin, Eye, MessageSquare } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Textarea } from "../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import TeamLineup from "../../components/TeamLineup";
import { Player } from "../../components/PlayerCard";

interface BookingRequest {
  id: string;
  team: string;
  stadium: string;
  date: string;
  time: string;
  status: "pending" | "accepted" | "rejected";
  players: Player[];
  message?: string;
}

const mockPlayers: Player[] = [
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

const mockRequests: BookingRequest[] = [
  {
    id: "1",
    team: "FC Lions",
    stadium: "El Harrach Stadium",
    date: "Today",
    time: "18:00 - 19:00",
    status: "pending",
    players: mockPlayers,
    message: "We're excited to play at your stadium!",
  },
  {
    id: "2",
    team: "Eagles United",
    stadium: "El Harrach Stadium",
    date: "Tomorrow",
    time: "16:00 - 17:00",
    status: "pending",
    players: mockPlayers.slice(0, 8),
  },
  {
    id: "3",
    team: "Thunder FC",
    stadium: "Bab Ezzouar Pitch",
    date: "Jan 15, 2024",
    time: "20:00 - 21:00",
    status: "accepted",
    players: mockPlayers,
  },
  {
    id: "4",
    team: "Storm FC",
    stadium: "Hussein Dey Arena",
    date: "Jan 10, 2024",
    time: "14:00 - 15:00",
    status: "rejected",
    players: mockPlayers.slice(0, 6),
  },
];

const Requests = () => {
  const [requests, setRequests] = useState<BookingRequest[]>(mockRequests);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);
  const [responseMessage, setResponseMessage] = useState("");

  const handleAction = (id: string, action: "accept" | "reject") => {
    setRequests(requests.map(r => 
      r.id === id ? { ...r, status: action === "accept" ? "accepted" : "rejected" } : r
    ));
    setSelectedRequest(null);
    setResponseMessage("");
  };

  const getStatusIcon = (status: BookingRequest["status"]) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Hourglass className="w-5 h-5 text-yellow-500" />;
    }
  };

  const pendingRequests = requests.filter(r => r.status === "pending");
  const processedRequests = requests.filter(r => r.status !== "pending");

  const RequestCard = ({ request }: { request: BookingRequest }) => (
    <div className="card-stadium p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {getStatusIcon(request.status)}
          <div>
            <h3 className="font-display text-lg text-foreground">{request.team}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {request.stadium}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          request.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
          request.status === "accepted" ? "bg-green-500/20 text-green-400" :
          "bg-destructive/20 text-destructive"
        }`}>
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">{request.date}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="text-sm">{request.time}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-muted-foreground mb-4">
        <Users className="w-4 h-4" />
        <span className="text-sm">{request.players.length} players</span>
      </div>

      {request.message && (
        <div className="p-3 rounded-lg bg-secondary/50 mb-4">
          <p className="text-sm text-muted-foreground italic">"{request.message}"</p>
        </div>
      )}

      <div className="flex items-center gap-2 pt-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 border-border gap-2"
          onClick={() => setSelectedRequest(request)}
        >
          <Eye className="w-4 h-4" />
          View Lineup
        </Button>
        {request.status === "pending" && (
          <>
            <Button
              size="sm"
              variant="outline"
              className="border-destructive text-destructive"
              onClick={() => handleAction(request.id, "reject")}
            >
              Reject
            </Button>
            <Button
              size="sm"
              className="btn-primary"
              onClick={() => handleAction(request.id, "accept")}
            >
              Accept
            </Button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl text-foreground">Booking Requests</h1>
        <p className="text-muted-foreground mt-1">
          Review and manage incoming booking requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card-stadium p-4 text-center border-yellow-500/30">
          <p className="font-display text-2xl text-yellow-400">{pendingRequests.length}</p>
          <p className="text-sm text-muted-foreground">Pending</p>
        </div>
        <div className="card-stadium p-4 text-center">
          <p className="font-display text-2xl text-green-400">
            {requests.filter(r => r.status === "accepted").length}
          </p>
          <p className="text-sm text-muted-foreground">Accepted</p>
        </div>
        <div className="card-stadium p-4 text-center">
          <p className="font-display text-2xl text-destructive">
            {requests.filter(r => r.status === "rejected").length}
          </p>
          <p className="text-sm text-muted-foreground">Rejected</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-secondary">
          <TabsTrigger value="pending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="processed" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Processed ({processedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingRequests.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {pendingRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No pending requests</p>
              <p className="text-sm text-muted-foreground">All requests have been processed</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="processed" className="mt-6">
          {processedRequests.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {processedRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No processed requests yet</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Lineup Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="bg-card border-border max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRequest?.team} - Team Lineup</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="mt-4 space-y-6">
              <TeamLineup
                players={selectedRequest.players}
                teamName={selectedRequest.team}
                formation="4-3-3"
              />
              
              {selectedRequest.status === "pending" && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      <MessageSquare className="w-4 h-4 inline mr-2" />
                      Response Message (optional)
                    </label>
                    <Textarea
                      className="bg-input border-border"
                      placeholder="Add a message for the team..."
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 border-destructive text-destructive"
                      onClick={() => handleAction(selectedRequest.id, "reject")}
                    >
                      Reject Request
                    </Button>
                    <Button
                      className="flex-1 btn-primary"
                      onClick={() => handleAction(selectedRequest.id, "accept")}
                    >
                      Accept Request
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Requests;
