import { useState, useEffect } from "react";
import {
  MapPin,
  Search,
  Filter,
  SlidersHorizontal,
  X,
  Loader2,
  Users,
  Star,
  Clock,
  Calendar,
  Clock as ClockIcon,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  User as UserIcon,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { StadiumCardProps } from "../../components/StadiumCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../components/ui/sheet";
import { Slider } from "../../components/ui/slider";
import { useToast } from "../../hooks/use-toast";
import * as StadiumService from "../../services/stadium";
import * as ReservationService from "../../services/reservation";
import { Badge } from "../../components/ui/badge";
import { useAuth } from "../../contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../components/ui/collapsible";

// Add this utility function at the top of your component or in a separate file
const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  let startHour = 8;
  let startMinute = 30;

  while (startHour < 22 || (startHour === 22 && startMinute === 0)) {
    const endHour = startHour + Math.floor((startMinute + 90) / 60);
    const endMinute = (startMinute + 90) % 60;

    const startTime = `${startHour.toString().padStart(2, "0")}:${startMinute
      .toString()
      .padStart(2, "0")}`;
    const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute
      .toString()
      .padStart(2, "0")}`;

    slots.push(`${startTime}-${endTime}`);

    // Move to next slot
    startHour = endHour;
    startMinute = endMinute;
  }

  return slots;
};

// Helper function to get day name from weekday number
const getDayName = (weekday: number): string => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[weekday] || "Unknown day";
};

interface ReservationDetail {
  _id: string;
  captainName: string;
  captainEmail: string;
  teamName: string;
  day: string;
  time: string;
  status: string;
  notes?: string;
  createdAt: string;
}

interface StadiumReservationInfo {
  stadiumId: string;
  reservations: ReservationDetail[];
  showDetails: boolean;
}

const FindStadiums = () => {
  const [stadiums, setStadiums] = useState<StadiumService.Stadium[]>([]);
  const [filteredStadiums, setFilteredStadiums] = useState<
    StadiumService.Stadium[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([1000, 10000]);
  const [selectedSize, setSelectedSize] = useState<string>("all");
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);
  const [bookingStadium, setBookingStadium] =
    useState<StadiumService.Stadium | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingData, setBookingData] = useState({
    session: "",
    weekday: 0,
    notes: "",
  });
  const [availableSessions, setAvailableSessions] = useState<string[]>([]);
  const [stadiumReservations, setStadiumReservations] = useState<StadiumReservationInfo[]>([]);
  const [loadingReservations, setLoadingReservations] = useState<Record<string, boolean>>({});

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchStadiums();
  }, []);

  useEffect(() => {
    filterAndSortStadiums();
  }, [stadiums, searchQuery, priceRange, selectedSize, sortBy]);

  const fetchStadiums = async () => {
    try {
      setIsLoading(true);
      const response = await StadiumService.getAllStadiums();
      setStadiums(response.stadiums);

      if (response.stadiums.length > 0) {
        const prices = response.stadiums
          .filter((s) => s.pricePerHour)
          .map((s) => s.pricePerHour || 0);
        if (prices.length > 0) {
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          setPriceRange([minPrice, maxPrice]);
        }
      }
    } catch (error: any) {
      toast({
        title: "Failed to fetch stadiums",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStadiumReservations = async (stadiumId: string) => {
    try {
      setLoadingReservations(prev => ({ ...prev, [stadiumId]: true }));
      
      const response = await ReservationService.getStadiumReservations(stadiumId);
      
      if (response.reservations && response.reservations.length > 0) {
        const reservationDetails = response.reservations.map((reservation: any) => {
          // Extract team and captain information
          const team = reservation.requestingTeam as any;
          const captain = team?.captain || {};
          
          return {
            _id: reservation._id,
            captainName: captain.fullName || "Unknown Captain",
            captainEmail: captain.email || "No email",
            teamName: team?.name || "Unknown Team",
            day: getDayName(reservation.weekday),
            time: reservation.session,
            status: reservation.status,
            notes: reservation.notes,
            createdAt: new Date(reservation.createdAt).toLocaleDateString()
          };
        });

        // Update or add stadium reservations
        setStadiumReservations(prev => {
          const existingIndex = prev.findIndex(s => s.stadiumId === stadiumId);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = {
              ...updated[existingIndex],
              reservations: reservationDetails
            };
            return updated;
          } else {
            return [...prev, {
              stadiumId,
              reservations: reservationDetails,
              showDetails: false
            }];
          }
        });
      } else {
        // If no reservations, ensure stadium is in the list with empty array
        setStadiumReservations(prev => {
          const existingIndex = prev.findIndex(s => s.stadiumId === stadiumId);
          if (existingIndex >= 0) {
            return prev;
          } else {
            return [...prev, {
              stadiumId,
              reservations: [],
              showDetails: false
            }];
          }
        });
      }
    } catch (error: any) {
      console.error("Failed to fetch stadium reservations:", error);
      toast({
        title: "Failed to load reservations",
        description: "Could not fetch reservation details",
        variant: "destructive",
      });
    } finally {
      setLoadingReservations(prev => ({ ...prev, [stadiumId]: false }));
    }
  };

  const toggleReservationDetails = (stadiumId: string) => {
    setStadiumReservations(prev => {
      const existingIndex = prev.findIndex(s => s.stadiumId === stadiumId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          showDetails: !updated[existingIndex].showDetails
        };
        
        // Fetch reservations if not already loaded
        if (!updated[existingIndex].showDetails && updated[existingIndex].reservations.length === 0) {
          fetchStadiumReservations(stadiumId);
        }
        
        return updated;
      } else {
        // If not in list, add it and fetch reservations
        const newReservationInfo = {
          stadiumId,
          reservations: [],
          showDetails: true
        };
        fetchStadiumReservations(stadiumId);
        return [...prev, newReservationInfo];
      }
    });
  };

  const filterAndSortStadiums = () => {
    let filtered = [...stadiums];

    if (searchQuery) {
      filtered = filtered.filter((stadium) => {
        const nameMatch = stadium.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const addressMatch = stadium.location?.address
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
        const ownerMatch = stadium.owner?.fullName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
        return nameMatch || addressMatch || ownerMatch;
      });
    }

    filtered = filtered.filter((stadium) => {
      const price = stadium.pricePerHour || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    if (selectedSize !== "all") {
      filtered = filtered.filter((stadium) => {
        const size = stadium.maxPlayers || 0;
        return size === parseInt(selectedSize);
      });
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (a.pricePerHour || 0) - (b.pricePerHour || 0);
        case "price-high":
          return (b.pricePerHour || 0) - (a.pricePerHour || 0);
        case "popular":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredStadiums(filtered);
  };

  const handleBookNow = async (stadium: StadiumService.Stadium) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to book a stadium",
        variant: "destructive",
      });
      return;
    }

    // Check if user is a player (role === "player")
    if (user.role !== "player") {
      toast({
        title: "Player required",
        description: "Only players can book stadiums",
        variant: "destructive",
      });
      return;
    }

    // Check if player is a captain (playerType === "captain")
    if (user.playerType !== "captain") {
      toast({
        title: "Captain required",
        description: "Only team captains can book stadiums",
        variant: "destructive",
      });
      return;
    }

    setBookingStadium(stadium);
    setBookingData({
      session: "",
      weekday: 0,
      notes: "",
    });

    // Generate time slots from 08:30 to 22:00 with 90-minute intervals
    const timeSlots = generateTimeSlots();
    setAvailableSessions(timeSlots);

    setBookingDialogOpen(true);
  };

  const handleBookingSubmit = async () => {
    if (
      !bookingStadium ||
      !bookingData.session ||
      bookingData.weekday === undefined
    ) {
      toast({
        title: "Missing information",
        description: "Please select a day and time slot",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsBooking(true);

      const reservationData: ReservationService.CreateReservationRequest = {
        stadiumId: bookingStadium._id,
        session: bookingData.session,
        weekday: bookingData.weekday,
        notes: bookingData.notes,
      };

      await ReservationService.createReservation(reservationData);

      toast({
        title: "Reservation created!",
        description: "Your stadium reservation request has been submitted",
      });

      // Refresh reservations for this stadium after booking
      fetchStadiumReservations(bookingStadium._id);

      setBookingDialogOpen(false);
      setBookingStadium(null);
      setBookingData({
        session: "",
        weekday: 0,
        notes: "",
      });
    } catch (error: any) {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  const convertToCardProps = (
    stadium: StadiumService.Stadium
  ): StadiumCardProps => {
    const rating = 4.0 + Math.random() * 1.5;
    const distances = [
      "1.2 km",
      "2.5 km",
      "3.8 km",
      "4.1 km",
      "5.2 km",
      "8.5 km",
    ];
    const distance = distances[Math.floor(Math.random() * distances.length)];
    const availableSlots = Math.floor(Math.random() * 8) + 1;

    let size = 5;
    if (stadium.maxPlayers >= 18) size = 11;
    else if (stadium.maxPlayers >= 12) size = 7;

    const imageUrl =
      stadium.images && stadium.images.length > 0
        ? StadiumService.getStadiumImageUrl(stadium.images[0])
        : undefined;

    return {
      id: stadium._id,
      name: stadium.name,
      location: stadium.location?.address || "Location not specified",
      pricePerHour: stadium.pricePerHour || 0,
      rating,
      size,
      distance,
      availableSlots,
      imageUrl,
      isActive: stadium.isActive,
      maxPlayers: stadium.maxPlayers,
    };
  };

  const FiltersContent = () => (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-foreground mb-4 block">
          Price Range (DZD/hr)
        </label>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            min={1000}
            max={10000}
            step={500}
            className="my-4"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{priceRange[0]} DZD</span>
            <span>{priceRange[1]} DZD</span>
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Stadium Size
        </label>
        <Select value={selectedSize} onValueChange={setSelectedSize}>
          <SelectTrigger className="bg-input border-border">
            <SelectValue placeholder="All sizes" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All sizes</SelectItem>
            <SelectItem value="10">5v5 (10 players)</SelectItem>
            <SelectItem value="14">7v7 (14 players)</SelectItem>
            <SelectItem value="22">11v11 (22 players)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Sort By
        </label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="bg-input border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="price-low">Price (Low to High)</SelectItem>
            <SelectItem value="price-high">Price (High to Low)</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        className="w-full border-border"
        onClick={() => {
          if (stadiums.length > 0) {
            const prices = stadiums
              .filter((s) => s.pricePerHour)
              .map((s) => s.pricePerHour || 0);
            if (prices.length > 0) {
              const minPrice = Math.min(...prices);
              const maxPrice = Math.max(...prices);
              setPriceRange([minPrice, maxPrice]);
            }
          }
          setSelectedSize("all");
          setSortBy("popular");
          setSearchQuery("");
        }}
      >
        Reset Filters
      </Button>
    </div>
  );

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'matched':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Matched</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-foreground">
            Find Stadiums
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover nearby pitches and book your slot
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              fetchStadiums();
            }}
            title="Refresh"
          >
            <Loader2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search stadiums, locations, or owners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input border-border"
          />
        </div>

        <div className="hidden md:flex gap-4">
          <Select value={selectedSize} onValueChange={setSelectedSize}>
            <SelectTrigger className="w-40 bg-input border-border">
              <SelectValue placeholder="Stadium Size" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All sizes</SelectItem>
              <SelectItem value="10">5v5 (10 players)</SelectItem>
              <SelectItem value="14">7v7 (14 players)</SelectItem>
              <SelectItem value="22">11v11 (22 players)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-44 bg-input border-border">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="name">Name: A to Z</SelectItem>
            </SelectContent>
          </Select>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="border-border gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                More Filters
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-card border-border w-80">
              <SheetHeader>
                <SheetTitle className="text-foreground">Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FiltersContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Sheet open={showFilters} onOpenChange={setShowFilters}>
          <SheetTrigger asChild>
            <Button variant="outline" className="md:hidden border-border gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="bg-card border-border rounded-t-3xl h-[80vh]"
          >
            <SheetHeader className="flex-row items-center justify-between">
              <SheetTitle className="text-foreground">Filters</SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFilters(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </SheetHeader>
            <div className="mt-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              <FiltersContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Stats Bar */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-foreground">{stadiums.length}</span>
          <span className="text-muted-foreground">Total Stadiums</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Star className="w-4 h-4 text-amber-500" />
          <span className="text-foreground">
            {stadiums.filter((s) => s.isActive).length}
          </span>
          <span className="text-muted-foreground">Active Now</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-green-500" />
          <span className="text-foreground">{filteredStadiums.length}</span>
          <span className="text-muted-foreground">Match Your Search</span>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStadiums.map((stadium) => {
          const cardProps = convertToCardProps(stadium);
          const stadiumReservation = stadiumReservations.find(s => s.stadiumId === stadium._id);
          const hasReservations = stadiumReservation && stadiumReservation.reservations.length > 0;
          const isLoading = loadingReservations[stadium._id];
          
          return (
            <div key={stadium._id} className="card-stadium overflow-hidden border border-border rounded-lg">
              <div className="h-48 relative overflow-hidden">
                {cardProps.imageUrl ? (
                  <img
                    src={cardProps.imageUrl}
                    alt={stadium.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-primary/50" />
                  </div>
                )}
                {!stadium.isActive && (
                  <div className="absolute top-2 right-2 bg-destructive text-white text-xs px-2 py-1 rounded">
                    Inactive
                  </div>
                )}
                {stadium.pricePerHour && (
                  <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm text-foreground px-3 py-1 rounded-lg font-medium">
                    {stadium.pricePerHour} DZD/hr
                  </div>
                )}
                {hasReservations && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    {stadiumReservation?.reservations.length} {stadiumReservation?.reservations.length === 1 ? 'Reservation' : 'Reservations'}
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display text-lg text-foreground truncate">
                      {stadium.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span className="text-sm text-muted-foreground">
                        {cardProps.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">
                        {cardProps.distance}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Owner Information */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <UserIcon className="w-4 h-4" />
                    <span className="font-medium">Owner:</span>
                    <span>{stadium.owner?.fullName || "Unknown"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="font-medium">Email:</span>
                    <span className="truncate">{stadium.owner?.email || "No email"}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-muted-foreground text-sm mb-4">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">
                    {stadium.location?.address || "Location not specified"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="gap-1">
                    <Users className="w-3 h-3" />
                    Max {stadium.maxPlayers || 11} players
                  </Badge>
                  {stadium.images && stadium.images.length > 0 && (
                    <Badge variant="outline">
                      {stadium.images.length} photos
                    </Badge>
                  )}
                </div>

                {/* Reservation Details Collapsible */}
                {hasReservations && (
                  <Collapsible
                    open={stadiumReservation?.showDetails || false}
                    onOpenChange={() => toggleReservationDetails(stadium._id)}
                    className="mb-4"
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between mb-2"
                        disabled={isLoading}
                      >
                        <div className="flex items-center gap-2">
                          <Info className="w-4 h-4" />
                          <span>Reservation Details</span>
                          <Badge variant="secondary" className="ml-2">
                            {stadiumReservation?.reservations.length}
                          </Badge>
                        </div>
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : stadiumReservation?.showDetails ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                        {isLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          </div>
                        ) : stadiumReservation?.reservations.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-2">
                            No reservations found
                          </p>
                        ) : (
                          stadiumReservation?.reservations.map((reservation) => (
                            <div key={reservation._id} className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-medium text-sm">{reservation.teamName}</p>
                                  {getStatusBadge(reservation.status)}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {reservation.createdAt}
                                </span>
                              </div>
                              
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <UserIcon className="w-3 h-3" />
                                  <span className="font-medium">Captain:</span>
                                  <span className="text-foreground">{reservation.captainName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Mail className="w-3 h-3" />
                                  <span className="font-medium">Email:</span>
                                  <span className="text-foreground truncate">{reservation.captainEmail}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-3 h-3" />
                                  <span className="font-medium">Day:</span>
                                  <span className="text-foreground">{reservation.day}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <ClockIcon className="w-3 h-3" />
                                  <span className="font-medium">Time:</span>
                                  <span className="text-foreground">{reservation.time}</span>
                                </div>
                                {reservation.notes && (
                                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Notes:</p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{reservation.notes}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button
                    className="btn-primary flex-1"
                    onClick={() => handleBookNow(stadium)}
                    disabled={
                      !stadium.isActive ||
                      !user ||
                      user.playerType !== "captain"
                    }
                  >
                    {!stadium.isActive ? (
                      <>Unavailable</>
                    ) : !user ? (
                      <>Login Required</>
                    ) : user.playerType !== "captain" ? (
                      <>Captain Only</>
                    ) : (
                      <>Book Now</>
                    )}
                  </Button>
                  
                  {/* Details Button */}
                  <Button
                    variant="outline"
                    className="flex-1 border-border"
                    onClick={() => toggleReservationDetails(stadium._id)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        <span>Details</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredStadiums.length === 0 && stadiums.length > 0 && (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            No stadiums found matching your criteria
          </p>
          <Button
            variant="link"
            className="text-primary"
            onClick={() => {
              setSearchQuery("");
              if (stadiums.length > 0) {
                const prices = stadiums
                  .filter((s) => s.pricePerHour)
                  .map((s) => s.pricePerHour || 0);
                if (prices.length > 0) {
                  const minPrice = Math.min(...prices);
                  const maxPrice = Math.max(...prices);
                  setPriceRange([minPrice, maxPrice]);
                }
              }
              setSelectedSize("all");
            }}
          >
            Clear filters
          </Button>
        </div>
      )}

      {stadiums.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            No stadiums available at the moment
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Check back later or contact stadium owners to list their venues
          </p>
        </div>
      )}

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>Book Stadium</DialogTitle>
            <DialogDescription>
              Reserve {bookingStadium?.name} for your team match
            </DialogDescription>
          </DialogHeader>

          {bookingStadium && (
            <div className="space-y-4 mt-4">
              {/* Stadium Info */}
              <div className="p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">
                      {bookingStadium.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {bookingStadium.location?.address || "No address"}
                    </p>
                    {bookingStadium.pricePerHour && (
                      <p className="text-sm text-primary font-medium">
                        {bookingStadium.pricePerHour} DZD/hour
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Owner Information in Booking Dialog */}
              <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                <p className="text-sm font-medium text-foreground mb-2">Owner Details:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{bookingStadium.owner?.fullName || "Unknown"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium truncate">{bookingStadium.owner?.email || "No email"}</span>
                  </div>
                </div>
              </div>

              {/* Day Selection */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Select Day
                </Label>
                <div className="grid grid-cols-7 gap-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day, index) => (
                      <Button
                        key={day}
                        type="button"
                        variant={
                          bookingData.weekday === index ? "default" : "outline"
                        }
                        className={`h-10 ${
                          bookingData.weekday === index ? "" : "border-border"
                        }`}
                        onClick={() =>
                          setBookingData({ ...bookingData, weekday: index })
                        }
                      >
                        {day}
                      </Button>
                    )
                  )}
                </div>
                {bookingData.weekday !== undefined && (
                  <p className="text-sm text-muted-foreground">
                    Selected:{" "}
                    {ReservationService.formatWeekday(bookingData.weekday)}
                  </p>
                )}
              </div>

              {/* Time Slot Selection */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4" />
                  Select Time Slot
                </Label>
                <Select
                  value={bookingData.session}
                  onValueChange={(value) =>
                    setBookingData({ ...bookingData, session: value })
                  }
                >
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Choose a time slot" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border max-h-60">
                    {availableSessions.map((session) => (
                      <SelectItem key={session} value={session}>
                        {session}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Notes */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Additional Notes (Optional)
                </Label>
                <Textarea
                  className="bg-input border-border min-h-[80px]"
                  placeholder="Any special requests or notes for the stadium owner..."
                  value={bookingData.notes}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, notes: e.target.value })
                  }
                />
              </div>

              {/* Booking Info */}
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">How booking works:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Your request will be sent to the stadium owner</li>
                      <li>Owner must approve before match is confirmed</li>
                      <li>You can invite opponent teams after approval</li>
                      <li>Cancellation policy: 24 hours notice required</li>
                    </ul>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-4">
                <div className="flex gap-3 w-full">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setBookingDialogOpen(false)}
                    disabled={isBooking}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="btn-primary flex-1 gap-2"
                    onClick={handleBookingSubmit}
                    disabled={
                      isBooking ||
                      !bookingData.session ||
                      bookingData.weekday === undefined
                    }
                  >
                    {isBooking ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Submit Reservation
                      </>
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FindStadiums;