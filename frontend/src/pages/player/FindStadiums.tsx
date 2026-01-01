import { useState, useEffect } from "react";
import { MapPin, Search, Filter, SlidersHorizontal, X, Loader2, Users, Star, Clock } from "lucide-react";
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
import { Badge } from "../../components/ui/badge";

const FindStadiums = () => {
  const [stadiums, setStadiums] = useState<StadiumService.Stadium[]>([]);
  const [filteredStadiums, setFilteredStadiums] = useState<StadiumService.Stadium[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([1000, 10000]);
  const [selectedSize, setSelectedSize] = useState<string>("all");
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);

  const { toast } = useToast();

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
      
      // Set initial price range based on actual data
      if (response.stadiums.length > 0) {
        const prices = response.stadiums
          .filter(s => s.pricePerHour)
          .map(s => s.pricePerHour || 0);
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

  const filterAndSortStadiums = () => {
    let filtered = [...stadiums];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((stadium) => {
        const nameMatch = stadium.name.toLowerCase().includes(searchQuery.toLowerCase());
        const addressMatch = stadium.location?.address?.toLowerCase().includes(searchQuery.toLowerCase());
        const ownerMatch = stadium.owner?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
        return nameMatch || addressMatch || ownerMatch;
      });
    }

    // Filter by price range
    filtered = filtered.filter((stadium) => {
      const price = stadium.pricePerHour || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Filter by size (maxPlayers)
    if (selectedSize !== "all") {
      filtered = filtered.filter((stadium) => {
        const size = stadium.maxPlayers || 0;
        return size === parseInt(selectedSize);
      });
    }

    // Sort stadiums
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (a.pricePerHour || 0) - (b.pricePerHour || 0);
        case "price-high":
          return (b.pricePerHour || 0) - (a.pricePerHour || 0);
        case "popular":
          // For now, sort by creation date (newest first)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredStadiums(filtered);
  };

  const convertToCardProps = (stadium: StadiumService.Stadium): StadiumCardProps => {
    // Generate a mock rating for now (you might want to add ratings to your Stadium model)
    const rating = 4.0 + (Math.random() * 1.5); // Random between 4.0-5.5
    
    // Mock distance calculation (you can implement real distance later)
    const distances = ["1.2 km", "2.5 km", "3.8 km", "4.1 km", "5.2 km", "8.5 km"];
    const distance = distances[Math.floor(Math.random() * distances.length)];
    
    // Calculate available slots (mock - you might want to implement actual booking logic)
    const availableSlots = Math.floor(Math.random() * 8) + 1;
    
    // Determine size based on maxPlayers
    let size = 5; // Default 5v5
    if (stadium.maxPlayers >= 18) size = 11; // 11v11
    else if (stadium.maxPlayers >= 12) size = 7; // 7v7

    // Get primary image
    const imageUrl = stadium.images && stadium.images.length > 0 
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
      {/* Price Range */}
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

      {/* Stadium Size */}
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

      {/* Sort By */}
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
          // Reset to defaults based on actual data
          if (stadiums.length > 0) {
            const prices = stadiums
              .filter(s => s.pricePerHour)
              .map(s => s.pricePerHour || 0);
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
          <h1 className="font-display text-2xl md:text-3xl text-foreground">Find Stadiums</h1>
          <p className="text-muted-foreground mt-1">
            Discover nearby pitches and book your slot
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchStadiums}
            title="Refresh"
          >
            <Loader2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search stadiums, locations, or owners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input border-border"
          />
        </div>

        {/* Desktop Filters */}
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

        {/* Mobile Filter Button */}
        <Sheet open={showFilters} onOpenChange={setShowFilters}>
          <SheetTrigger asChild>
            <Button variant="outline" className="md:hidden border-border gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="bg-card border-border rounded-t-3xl h-[80vh]">
            <SheetHeader className="flex-row items-center justify-between">
              <SheetTitle className="text-foreground">Filters</SheetTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
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
            {stadiums.filter(s => s.isActive).length}
          </span>
          <span className="text-muted-foreground">Active Now</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-green-500" />
          <span className="text-foreground">
            {filteredStadiums.length}
          </span>
          <span className="text-muted-foreground">Match Your Search</span>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="card-stadium overflow-hidden">
        <div className="relative h-64 md:h-80 bg-secondary flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-primary mx-auto mb-3" />
            <p className="text-muted-foreground">Interactive map coming soon</p>
            <p className="text-sm text-muted-foreground">Find stadiums near your location</p>
          </div>
          {/* Map pins preview */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            {filteredStadiums.slice(0, 4).map((stadium, i) => (
              <div
                key={stadium._id}
                className="absolute w-4 h-4 bg-primary rounded-full animate-pulse"
                style={{
                  top: `${20 + i * 15}%`,
                  left: `${25 + i * 12}%`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-muted-foreground">
            Showing {filteredStadiums.length} of {stadiums.length} stadiums
          </p>
        </div>
        <div className="flex gap-2">
          {selectedSize !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Size: {selectedSize === "10" ? "5v5" : selectedSize === "14" ? "7v7" : "11v11"}
            </Badge>
          )}
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: "{searchQuery}"
            </Badge>
          )}
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStadiums.map((stadium) => {
          const cardProps = convertToCardProps(stadium);
          // You'll need to update StadiumCard to accept these props
          return (
            <div key={stadium._id} className="card-stadium overflow-hidden">
              {/* Stadium Image */}
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
              </div>

              {/* Stadium Info */}
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

                {/* Location */}
                <div className="flex items-start gap-2 text-muted-foreground text-sm mb-4">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">
                    {stadium.location?.address || "Location not specified"}
                  </span>
                </div>

                {/* Stadium Details */}
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

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    className="flex-1 border-border"
                    onClick={() => {
                      // Navigate to stadium details
                      window.location.href = `/stadium/${stadium._id}`;
                    }}
                  >
                    View Details
                  </Button>
                  <Button className="btn-primary flex-1">
                    Book Now
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
          <p className="text-muted-foreground">No stadiums found matching your criteria</p>
          <Button
            variant="link"
            className="text-primary"
            onClick={() => {
              setSearchQuery("");
              // Reset price range to include all stadiums
              if (stadiums.length > 0) {
                const prices = stadiums
                  .filter(s => s.pricePerHour)
                  .map(s => s.pricePerHour || 0);
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

      {/* No Stadiums State */}
      {stadiums.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No stadiums available at the moment</p>
          <p className="text-sm text-muted-foreground mt-1">
            Check back later or contact stadium owners to list their venues
          </p>
        </div>
      )}
    </div>
  );
};

export default FindStadiums;