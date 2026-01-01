import { Clock, Lock, Check } from "lucide-react";

export type SlotStatus = "available" | "booked" | "locked";

export interface TimeSlot {
  id: string;
  time: string;
  status: SlotStatus;
  bookedBy?: string;
}

interface TimelineSlotProps {
  slot: TimeSlot;
  onSelect?: (slot: TimeSlot) => void;
  onStatusChange?: (slot: TimeSlot, status: SlotStatus) => void;
  isOwner?: boolean;
}

const TimelineSlot = ({ slot, onSelect, onStatusChange, isOwner = false }: TimelineSlotProps) => {
  const getSlotClass = () => {
    switch (slot.status) {
      case "available":
        return "time-slot-available";
      case "booked":
        return "time-slot-booked";
      case "locked":
        return "time-slot-locked";
    }
  };

  const getIcon = () => {
    switch (slot.status) {
      case "available":
        return <Clock className="w-4 h-4" />;
      case "booked":
        return <Check className="w-4 h-4" />;
      case "locked":
        return <Lock className="w-4 h-4" />;
    }
  };

  const handleClick = () => {
    if (isOwner) {
      // Cycle through statuses for owners
      const nextStatus: SlotStatus = 
        slot.status === "available" ? "locked" : 
        slot.status === "locked" ? "available" : 
        slot.status;
      onStatusChange?.(slot, nextStatus);
    } else if (slot.status === "available") {
      onSelect?.(slot);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isOwner && slot.status !== "available"}
      className={`time-slot p-3 flex items-center justify-between ${getSlotClass()} ${
        !isOwner && slot.status !== "available" ? "cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <div className="flex items-center gap-2">
        {getIcon()}
        <span className="font-medium text-sm">{slot.time}</span>
      </div>
      <span className="text-xs capitalize text-muted-foreground">
        {slot.status === "booked" && slot.bookedBy ? slot.bookedBy : slot.status}
      </span>
    </button>
  );
};

export default TimelineSlot;
