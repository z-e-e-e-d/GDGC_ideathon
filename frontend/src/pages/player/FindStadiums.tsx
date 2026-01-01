import { useState } from "react";
import { MapPin, Search, Filter, SlidersHorizontal, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import StadiumCard, { Stadium } from "../../components/StadiumCard";
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
  {
    id: "4",
    name: "Kouba Sports Center",
    location: "Kouba, Algiers",
    pricePerHour: 3500,
    rating: 4.2,
    size: 5,
    distance: "4.1 km",
    availableSlots: 8,
  },
  {
    id: "5",
    name: "Bir Mourad Raïs Field",
    location: "Bir Mourad Raïs, Algiers",
    pricePerHour: 5500,
    rating: 4.7,
    size: 7,
    distance: "5.2 km",
    availableSlots: 4,
  },
  {
    id: "6",
    name: "Chéraga Premium Pitch",
    location: "Chéraga, Algiers",
    pricePerHour: 7500,
    rating: 4.9,
    size: 11,
    distance: "8.5 km",
    availableSlots: 1,
  },
];

const FindStadiums = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([3000, 8000]);
  const [selectedSize, setSelectedSize] = useState<string>("all");
  const [sortBy, setSortBy] = useState("distance");
  const [showFilters, setShowFilters] = useState(false);

  const filteredStadiums = mockStadiums
    .filter((stadium) => {
      const matchesSearch =
        stadium.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stadium.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice =
        stadium.pricePerHour >= priceRange[0] && stadium.pricePerHour <= priceRange[1];
      const matchesSize = selectedSize === "all" || stadium.size === parseInt(selectedSize);
      return matchesSearch && matchesPrice && matchesSize;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "distance":
          return parseFloat(a.distance || "0") - parseFloat(b.distance || "0");
        case "price":
          return a.pricePerHour - b.pricePerHour;
        case "rating":
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

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
            <SelectItem value="5">5v5</SelectItem>
            <SelectItem value="7">7v7</SelectItem>
            <SelectItem value="11">11v11</SelectItem>
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
            <SelectItem value="distance">Distance</SelectItem>
            <SelectItem value="price">Price (Low to High)</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        className="w-full border-border"
        onClick={() => {
          setPriceRange([3000, 8000]);
          setSelectedSize("all");
          setSortBy("distance");
        }}
      >
        Reset Filters
      </Button>
    </div>
  );

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
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input border-border"
          />
        </div>

        {/* Desktop Filters */}
        <div className="hidden md:flex gap-4">
          <Select value={selectedSize} onValueChange={setSelectedSize}>
            <SelectTrigger className="w-32 bg-input border-border">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All sizes</SelectItem>
              <SelectItem value="5">5v5</SelectItem>
              <SelectItem value="7">7v7</SelectItem>
              <SelectItem value="11">11v11</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 bg-input border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="distance">Sort: Distance</SelectItem>
              <SelectItem value="price">Sort: Price</SelectItem>
              <SelectItem value="rating">Sort: Rating</SelectItem>
            </SelectContent>
          </Select>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="border-border gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                More Filters
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-card border-border">
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
            <div className="mt-6">
              <FiltersContent />
            </div>
          </SheetContent>
        </Sheet>
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
            {mockStadiums.slice(0, 4).map((stadium, i) => (
              <div
                key={stadium.id}
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

      {/* Results */}
      <div>
        <p className="text-muted-foreground mb-4">
          {filteredStadiums.length} stadiums found
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStadiums.map((stadium) => (
            <StadiumCard key={stadium.id} stadium={stadium} />
          ))}
        </div>
        {filteredStadiums.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No stadiums found matching your criteria</p>
            <Button
              variant="link"
              className="text-primary"
              onClick={() => {
                setSearchQuery("");
                setPriceRange([3000, 8000]);
                setSelectedSize("all");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindStadiums;
