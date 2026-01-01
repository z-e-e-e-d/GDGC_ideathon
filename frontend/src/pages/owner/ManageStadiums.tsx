import { useState, useEffect } from "react";
import { Plus, MapPin, Star, Users, Edit, Trash2, Image as ImageIcon, X } from "lucide-react";
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
import { useToast } from "../../hooks/use-toast";
import * as StadiumService from "../../services/stadium";

const ManageStadiums = () => {
  const [stadiums, setStadiums] = useState<StadiumService.Stadium[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedStadium, setSelectedStadium] = useState<StadiumService.Stadium | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    pricePerHour: "",
    maxPlayers: "11",
    isActive: true,
  });
  
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    fetchMyStadiums();
  }, []);

  const fetchMyStadiums = async () => {
    try {
      setIsLoading(true);
      const response = await StadiumService.getMyStadiums();
      setStadiums(response.stadiums);
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate images
    const validation = StadiumService.validateImages(files);
    if (!validation.valid) {
      toast({
        title: "Invalid images",
        description: validation.errors.join(", "),
        variant: "destructive",
      });
      return;
    }

    // Check total images (existing + new)
    const totalImages = (selectedStadium?.images.length || 0) + files.length;
    if (totalImages > 5) {
      toast({
        title: "Too many images",
        description: `Maximum 5 images allowed. You already have ${selectedStadium?.images.length || 0} images.`,
        variant: "destructive",
      });
      return;
    }

    setSelectedImages(files);

    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(urls);
  };

  const removeSelectedImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newUrls = imagePreviewUrls.filter((_, i) => i !== index);
    
    // Revoke the URL to free memory
    URL.revokeObjectURL(imagePreviewUrls[index]);
    
    setSelectedImages(newImages);
    setImagePreviewUrls(newUrls);
  };

  const handleAddStadium = async () => {
    if (!formData.name || !formData.address || !formData.pricePerHour) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      await StadiumService.createStadium({
        name: formData.name,
        location: {
          address: formData.address,
        },
        pricePerHour: parseFloat(formData.pricePerHour),
        maxPlayers: parseInt(formData.maxPlayers),
        isActive: formData.isActive,
        images: selectedImages,
      });

      toast({
        title: "Stadium created",
        description: "Your stadium has been registered successfully",
      });

      // Reset form
      setFormData({
        name: "",
        address: "",
        pricePerHour: "",
        maxPlayers: "11",
        isActive: true,
      });
      setSelectedImages([]);
      setImagePreviewUrls([]);
      setDialogOpen(false);

      // Refresh list
      fetchMyStadiums();
    } catch (error: any) {
      toast({
        title: "Failed to create stadium",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStadium = (stadium: StadiumService.Stadium) => {
    setSelectedStadium(stadium);
    setFormData({
      name: stadium.name,
      address: stadium.location?.address || "",
      pricePerHour: stadium.pricePerHour?.toString() || "",
      maxPlayers: stadium.maxPlayers.toString(),
      isActive: stadium.isActive,
    });
    setEditDialogOpen(true);
  };

  const handleUpdateStadium = async () => {
    if (!selectedStadium) return;

    try {
      setIsSubmitting(true);

      await StadiumService.updateStadium(selectedStadium._id, {
        name: formData.name,
        location: {
          address: formData.address,
        },
        pricePerHour: parseFloat(formData.pricePerHour),
        maxPlayers: parseInt(formData.maxPlayers),
        isActive: formData.isActive,
        images: selectedImages.length > 0 ? selectedImages : undefined,
      });

      toast({
        title: "Stadium updated",
        description: "Your stadium has been updated successfully",
      });

      // Reset
      setSelectedStadium(null);
      setSelectedImages([]);
      setImagePreviewUrls([]);
      setEditDialogOpen(false);

      // Refresh
      fetchMyStadiums();
    } catch (error: any) {
      toast({
        title: "Failed to update stadium",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStadium = async (stadiumId: string) => {
    try {
      await StadiumService.deleteStadium(stadiumId);
      
      toast({
        title: "Stadium deleted",
        description: "Stadium has been deleted successfully",
      });

      // Refresh list
      fetchMyStadiums();
    } catch (error: any) {
      toast({
        title: "Failed to delete stadium",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteImage = async (stadiumId: string, imageUrl: string) => {
    try {
      await StadiumService.deleteStadiumImage(stadiumId, imageUrl);
      
      toast({
        title: "Image deleted",
        description: "Stadium image has been deleted successfully",
      });

      // Refresh list
      fetchMyStadiums();
    } catch (error: any) {
      toast({
        title: "Failed to delete image",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

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
          <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Register New Stadium</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {/* Image Upload */}
              <div>
                <Label>Stadium Images (Max 5)</Label>
                <div className="mt-2">
                  <label className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors block">
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <ImageIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Click to upload stadium images</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 5MB each</p>
                  </label>

                  {/* Image Previews */}
                  {imagePreviewUrls.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {imagePreviewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeSelectedImage(index)}
                            className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Stadium Name *</Label>
                <Input
                  className="mt-2 bg-input border-border"
                  placeholder="Enter stadium name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <Label>Location/Address *</Label>
                <Input
                  className="mt-2 bg-input border-border"
                  placeholder="Enter full address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price per Hour (DZD) *</Label>
                  <Input
                    type="number"
                    className="mt-2 bg-input border-border"
                    placeholder="5000"
                    value={formData.pricePerHour}
                    onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Max Players</Label>
                  <Select
                    value={formData.maxPlayers}
                    onValueChange={(val) => setFormData({ ...formData, maxPlayers: val })}
                  >
                    <SelectTrigger className="mt-2 bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="10">10 (5v5)</SelectItem>
                      <SelectItem value="14">14 (7v7)</SelectItem>
                      <SelectItem value="22">22 (11v11)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Stadium is active and accepting bookings
                </Label>
              </div>

              <Button
                className="w-full btn-primary"
                onClick={handleAddStadium}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Register Stadium"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stadiums Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stadiums.map((stadium) => (
          <div key={stadium._id} className="card-stadium overflow-hidden">
            {/* Image */}
            <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary relative">
              {stadium.images && stadium.images.length > 0 ? (
                <img
                  src={StadiumService.getStadiumImageUrl(stadium.images[0])}
                  alt={stadium.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              {!stadium.isActive && (
                <div className="absolute top-2 right-2 bg-destructive text-white text-xs px-2 py-1 rounded">
                  Inactive
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display text-lg text-foreground">{stadium.name}</h3>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                <MapPin className="w-4 h-4" />
                <span className="line-clamp-1">{stadium.location?.address || "No address"}</span>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>Max {stadium.maxPlayers} players</span>
                </div>
                {stadium.images && (
                  <>
                    <span>•</span>
                    <span>{stadium.images.length} photos</span>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <span className="text-xl font-display text-primary">
                    {stadium.pricePerHour || 0}
                  </span>
                  <span className="text-sm text-muted-foreground"> DZD/hr</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="border-border h-9 w-9"
                    onClick={() => handleEditStadium(stadium)}
                  >
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
                          onClick={() => handleDeleteStadium(stadium._id)}
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

      {/* Empty State */}
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Stadium</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Existing Images */}
            {selectedStadium?.images && selectedStadium.images.length > 0 && (
              <div>
                <Label>Current Images</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {selectedStadium.images.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={StadiumService.getStadiumImageUrl(imageUrl)}
                        alt={`Stadium ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleDeleteImage(selectedStadium._id, imageUrl)}
                        className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Images */}
            <div>
              <Label>Add New Images (Max 5 total)</Label>
              <div className="mt-2">
                <label className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors block">
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Add more images</p>
                </label>

                {imagePreviewUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`New ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeSelectedImage(index)}
                          className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label>Stadium Name *</Label>
              <Input
                className="mt-2 bg-input border-border"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label>Location/Address *</Label>
              <Input
                className="mt-2 bg-input border-border"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price per Hour (DZD) *</Label>
                <Input
                  type="number"
                  className="mt-2 bg-input border-border"
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                />
              </div>
              <div>
                <Label>Max Players</Label>
                <Select
                  value={formData.maxPlayers}
                  onValueChange={(val) => setFormData({ ...formData, maxPlayers: val })}
                >
                  <SelectTrigger className="mt-2 bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="10">10 (5v5)</SelectItem>
                    <SelectItem value="14">14 (7v7)</SelectItem>
                    <SelectItem value="22">22 (11v11)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActiveEdit"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="isActiveEdit" className="cursor-pointer">
                Stadium is active
              </Label>
            </div>

            <Button
              className="w-full btn-primary"
              onClick={handleUpdateStadium}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Stadium"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageStadiums;