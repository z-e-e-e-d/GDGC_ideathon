import { useState } from "react";
import { Plus, MapPin, Star, Users, Edit, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";

interface Stadium {
  id: string;
  name: string;
  location: string;
  pricePerHour: number;
  size: number;
  rating: number;
  totalBookings: number;
  image?: string;
}

const mockStadiums: Stadium[] = [
  {
    id: "1",
    name: "El Harrach Stadium",
    location: "El Harrach, Algiers",
    pricePerHour: 5000,
    size: 5,
    rating: 4.8,
    totalBookings: 156,
  },
  {
    id: "2",
    name: "Bab Ezzouar Pitch",
    location: "Bab Ezzouar, Algiers",
    pricePerHour: 4500,
    size: 7,
    rating: 4.5,
    totalBookings: 89,
  },
  {
    id: "3",
    name: "Hussein Dey Arena",
    location: "Hussein Dey, Algiers",
    pricePerHour: 6000,
    size: 11,
    rating: 4.9,
    totalBookings: 234,
  },
];

const ManageStadiums = () => {
  const [stadiums, setStadiums] = useState<Stadium[]>(mockStadiums);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newStadium, setNewStadium] = useState({
    name: "",
    location: "",
    pricePerHour: "",
    size: "5",
  });

  const handleAddStadium = () => {
    if (newStadium.name && newStadium.location && newStadium.pricePerHour) {
      const stadium: Stadium = {
        id: Date.now().toString(),
        name: newStadium.name,
        location: newStadium.location,
        pricePerHour: parseInt(newStadium.pricePerHour),
        size: parseInt(newStadium.size),
        rating: 0,
        totalBookings: 0,
      };
      setStadiums([...stadiums, stadium]);
      setNewStadium({ name: "", location: "", pricePerHour: "", size: "5" });
      setDialogOpen(false);
    }
  };

  const handleDeleteStadium = (id: string) => {
    setStadiums(stadiums.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-foreground">My Stadiums</h1>
          <p className="text-muted-foreground mt-1">
            Manage your registered stadiums
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-primary gap-2">
              <Plus className="w-4 h-4" />
              Add Stadium
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle>Register New Stadium</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {/* Image Upload */}
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors">
                <ImageIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Click to upload stadium images</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
              </div>

              <div>
                <Label>Stadium Name</Label>
                <Input
                  className="mt-2 bg-input border-border"
                  placeholder="Enter stadium name"
                  value={newStadium.name}
                  onChange={(e) => setNewStadium({ ...newStadium, name: e.target.value })}
                />
              </div>

              <div>
                <Label>Location</Label>
                <Input
                  className="mt-2 bg-input border-border"
                  placeholder="Enter address"
                  value={newStadium.location}
                  onChange={(e) => setNewStadium({ ...newStadium, location: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price per Hour (DZD)</Label>
                  <Input
                    type="number"
                    className="mt-2 bg-input border-border"
                    placeholder="5000"
                    value={newStadium.pricePerHour}
                    onChange={(e) => setNewStadium({ ...newStadium, pricePerHour: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Size (Players per team)</Label>
                  <Select
                    value={newStadium.size}
                    onValueChange={(val) => setNewStadium({ ...newStadium, size: val })}
                  >
                    <SelectTrigger className="mt-2 bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="5">5v5</SelectItem>
                      <SelectItem value="7">7v7</SelectItem>
                      <SelectItem value="11">11v11</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="w-full btn-primary" onClick={handleAddStadium}>
                Register Stadium
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stadiums Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stadiums.map((stadium) => (
          <div key={stadium.id} className="card-stadium overflow-hidden">
            {/* Image */}
            <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-muted-foreground" />
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display text-lg text-foreground">{stadium.name}</h3>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm text-foreground">{stadium.rating}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                <MapPin className="w-4 h-4" />
                <span>{stadium.location}</span>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{stadium.size}v{stadium.size}</span>
                </div>
                <span>•</span>
                <span>{stadium.totalBookings} bookings</span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <span className="text-xl font-display text-primary">{stadium.pricePerHour}</span>
                  <span className="text-sm text-muted-foreground"> DZD/hr</span>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" className="border-border h-9 w-9">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="outline" className="border-destructive text-destructive h-9 w-9">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Stadium?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. All bookings and data for this stadium will be permanently deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-secondary border-border">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground"
                          onClick={() => handleDeleteStadium(stadium.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {stadiums.length === 0 && (
        <div className="text-center py-16">
          <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-xl text-foreground mb-2">No Stadiums Yet</h3>
          <p className="text-muted-foreground mb-6">
            Register your first stadium to start receiving bookings
          </p>
          <Button className="btn-primary" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Stadium
          </Button>
        </div>
      )}
    </div>
  );
};

export default ManageStadiums;
