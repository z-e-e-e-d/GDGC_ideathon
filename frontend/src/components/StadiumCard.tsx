import { MapPin, Star, Users, Clock } from "lucide-react";
import { Button } from "./ui/button";

export interface Stadium {
  id: string;
  name: string;
  location: string;
  pricePerHour: number;
  rating: number;
  size: number; // number of players
  image?: string;
  distance?: string;
  availableSlots?: number;
}

interface StadiumCardProps {
  stadium: Stadium;
  onBook?: (stadium: Stadium) => void;
  onViewDetails?: (stadium: Stadium) => void;
}

const StadiumCard = ({ stadium, onBook, onViewDetails }: StadiumCardProps) => {
  return (
    <div className="card-stadium group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
          style={{
            backgroundImage: stadium.image
              ? `url(${stadium.image})`
              : "linear-gradient(135deg, hsl(142 40% 20%) 0%, hsl(120 5% 15%) 100%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
        
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full glass">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-medium text-foreground">{stadium.rating.toFixed(1)}</span>
        </div>

        {/* Available Slots */}
        {stadium.availableSlots !== undefined && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-primary/90">
            <span className="text-xs font-medium text-primary-foreground">
              {stadium.availableSlots} slots available
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display text-lg text-foreground mb-2 truncate">{stadium.name}</h3>
        
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="truncate">{stadium.location}</span>
          {stadium.distance && (
            <>
              <span className="text-border">•</span>
              <span>{stadium.distance}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{stadium.size}v{stadium.size}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">1hr slots</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <span className="text-2xl font-display text-primary">{stadium.pricePerHour}</span>
            <span className="text-sm text-muted-foreground"> DZD/hr</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-border hover:border-primary"
              onClick={() => onViewDetails?.(stadium)}
            >
              Details
            </Button>
            <Button
              size="sm"
              className="btn-primary"
              onClick={() => onBook?.(stadium)}
            >
              Book
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StadiumCard;
