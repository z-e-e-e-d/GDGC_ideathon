import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "../../components/ui/button";
import TimelineSlot, { TimeSlot, SlotStatus } from "../../components/TimelineSlot";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 8; hour < 23; hour++) {
    const status: SlotStatus = 
      Math.random() > 0.7 ? "booked" : 
      Math.random() > 0.9 ? "locked" : "available";
    slots.push({
      id: `slot-${hour}`,
      time: `${hour.toString().padStart(2, "0")}:00 - ${(hour + 1).toString().padStart(2, "0")}:00`,
      status,
      bookedBy: status === "booked" ? ["FC Lions", "Eagles United", "Thunder FC"][Math.floor(Math.random() * 3)] : undefined,
    });
  }
  return slots;
};

const stadiums = [
  { id: "1", name: "El Harrach Stadium" },
  { id: "2", name: "Bab Ezzouar Pitch" },
  { id: "3", name: "Hussein Dey Arena" },
];

const Timeline = () => {
  const [selectedStadium, setSelectedStadium] = useState(stadiums[0].id);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState<TimeSlot[]>(generateTimeSlots());

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    setSelectedDate(newDate);
    setSlots(generateTimeSlots()); // In real app, fetch slots for this date
  };

  const handleStatusChange = (slot: TimeSlot, newStatus: SlotStatus) => {
    setSlots(slots.map(s => 
      s.id === slot.id ? { ...s, status: newStatus } : s
    ));
  };

  const availableCount = slots.filter(s => s.status === "available").length;
  const bookedCount = slots.filter(s => s.status === "booked").length;
  const lockedCount = slots.filter(s => s.status === "locked").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-foreground">Timeline</h1>
          <p className="text-muted-foreground mt-1">
            Manage your stadium availability
          </p>
        </div>
        <Select value={selectedStadium} onValueChange={setSelectedStadium}>
          <SelectTrigger className="w-full md:w-64 bg-input border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {stadiums.map((stadium) => (
              <SelectItem key={stadium.id} value={stadium.id}>
                {stadium.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date Navigation */}
      <div className="card-stadium p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateDate("prev")}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <p className="font-display text-lg text-foreground">{formatDate(selectedDate)}</p>
          <p className="text-sm text-muted-foreground">
            {selectedDate.toDateString() === new Date().toDateString() ? "Today" : ""}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateDate("next")}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card-stadium p-4 text-center border-primary/30">
          <p className="font-display text-2xl text-primary">{availableCount}</p>
          <p className="text-sm text-muted-foreground">Available</p>
        </div>
        <div className="card-stadium p-4 text-center">
          <p className="font-display text-2xl text-green-400">{bookedCount}</p>
          <p className="text-sm text-muted-foreground">Booked</p>
        </div>
        <div className="card-stadium p-4 text-center">
          <p className="font-display text-2xl text-muted-foreground">{lockedCount}</p>
          <p className="text-sm text-muted-foreground">Locked</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary/20 border border-primary/30" />
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-destructive/20 border border-destructive/30" />
          <span className="text-muted-foreground">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted border border-border opacity-50" />
          <span className="text-muted-foreground">Locked</span>
        </div>
        <p className="text-muted-foreground ml-auto">
          <Clock className="w-4 h-4 inline mr-1" />
          Click to toggle lock/unlock
        </p>
      </div>

      {/* Timeline Grid */}
      <div className="card-stadium p-4">
        <div className="grid gap-2">
          {slots.map((slot) => (
            <TimelineSlot
              key={slot.id}
              slot={slot}
              isOwner={true}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
