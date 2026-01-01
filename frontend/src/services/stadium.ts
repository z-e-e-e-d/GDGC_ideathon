// services/StadiumService.ts
import axiosInstance from "../utils/axiosInstance";

export interface Location {
  address?: string;
  lat?: number;
  lng?: number;
}

export interface Stadium {
  _id: string;
  name: string;
  owner: {
    _id: string;
    fullName: string;
    email: string;
  };
  location?: Location;
  pricePerHour?: number;
  maxPlayers: number;
  images: string[]; // Array of image URLs
  isActive: boolean;
  createdAt: string;
}

export interface CreateStadiumRequest {
  name: string;
  location?: Location;
  pricePerHour?: number;
  maxPlayers?: number;
  isActive?: boolean;
  images?: File[]; // Image files to upload
  owner?: string; // Only for admin creating stadium for specific owner
}

export interface UpdateStadiumRequest {
  name?: string;
  location?: Location;
  pricePerHour?: number;
  maxPlayers?: number;
  isActive?: boolean;
  owner?: string; // Only admin can change owner
  images?: File[]; // New images to add
  removeImages?: string[]; // URLs of images to remove
}

export interface GetAllStadiumsResponse {
  stadiums: Stadium[];
}

export interface GetStadiumResponse {
  stadium: Stadium;
}

export interface CreateStadiumResponse {
  message: string;
  stadium: Stadium;
}

export interface UpdateStadiumResponse {
  message: string;
  stadium: Stadium;
}

export interface DeleteStadiumResponse {
  message: string;
}

export interface GetMyStadiumsResponse {
  count: number;
  stadiums: Stadium[];
}

export interface DeleteImageResponse {
  message: string;
  stadium: Stadium;
}

// Get all stadiums (public)
export const getAllStadiums = async (): Promise<GetAllStadiumsResponse> => {
  try {
    const response = await axiosInstance.get("/stadium");
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch stadiums"
    );
  }
};

// Get stadium by ID (public)
export const getStadiumById = async (stadiumId: string): Promise<GetStadiumResponse> => {
  try {
    const response = await axiosInstance.get(`/stadium/${stadiumId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch stadium"
    );
  }
};

// Create stadium (owner/admin only)
// services/StadiumService.ts - Update the createStadium function
export const createStadium = async (
  data: CreateStadiumRequest
): Promise<CreateStadiumResponse> => {
  try {
    const formData = new FormData();
    
    // Add text fields
    formData.append("name", data.name);
    
    if (data.pricePerHour !== undefined) {
      formData.append("pricePerHour", data.pricePerHour.toString());
    }
    
    if (data.maxPlayers !== undefined) {
      formData.append("maxPlayers", data.maxPlayers.toString());
    }
    
    if (data.isActive !== undefined) {
      formData.append("isActive", data.isActive.toString());
    }
    
    // FIX: Handle location correctly
    if (data.location && data.location.address) {
      // Send location as individual fields OR as JSON string
      formData.append("address", data.location.address);
      
      // If you want to send as JSON object:
      // formData.append("location", JSON.stringify({
      //   address: data.location.address,
      //   lat: data.location.lat || null,
      //   lng: data.location.lng || null
      // }));
    }
    
    if (data.owner) {
      formData.append("owner", data.owner);
    }

    // Add image files
    if (data.images && data.images.length > 0) {
      data.images.forEach((image) => {
        formData.append("images", image);
      });
    }

    const response = await axiosInstance.post("/stadium", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to create stadium"
    );
  }
};
// Update stadium (owner/admin only)
export const updateStadium = async (
  stadiumId: string,
  data: UpdateStadiumRequest
): Promise<UpdateStadiumResponse> => {
  try {
    const formData = new FormData();
    
    // Add text fields
    if (data.name) formData.append("name", data.name);
    if (data.pricePerHour !== undefined) {
      formData.append("pricePerHour", data.pricePerHour.toString());
    }
    if (data.maxPlayers !== undefined) {
      formData.append("maxPlayers", data.maxPlayers.toString());
    }
    if (data.isActive !== undefined) {
      formData.append("isActive", data.isActive.toString());
    }
    if (data.location) {
      formData.append("location", JSON.stringify(data.location));
    }
    if (data.owner) {
      formData.append("owner", data.owner); // For admin
    }

    // Add new images
    if (data.images && data.images.length > 0) {
      data.images.forEach((image) => {
        formData.append("images", image);
      });
    }

    // Add images to remove
    if (data.removeImages && data.removeImages.length > 0) {
      formData.append("removeImages", JSON.stringify(data.removeImages));
    }

    const response = await axiosInstance.put(`/stadium/${stadiumId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update stadium"
    );
  }
};

// Delete stadium (owner/admin only)
export const deleteStadium = async (
  stadiumId: string
): Promise<DeleteStadiumResponse> => {
  try {
    const response = await axiosInstance.delete(`/stadium/${stadiumId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to delete stadium"
    );
  }
};

// Get my stadiums (owner only)
export const getMyStadiums = async (): Promise<GetMyStadiumsResponse> => {
  try {
    const response = await axiosInstance.get("/stadium/my/stadiums");
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch your stadiums"
    );
  }
};

// Delete single image from stadium (owner/admin only)
export const deleteStadiumImage = async (
  stadiumId: string,
  imageUrl: string
): Promise<DeleteImageResponse> => {
  try {
    const response = await axiosInstance.delete(`/stadium/${stadiumId}/image`, {
      data: { imageUrl },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to delete stadium image"
    );
  }
};

// Utility: Get full image URL
export const getStadiumImageUrl = (relativeUrl: string): string => {
  // If the URL already starts with http, return as is
  if (relativeUrl.startsWith('http')) {
    return relativeUrl;
  }
  
  // Construct full URL - uploads are served at root, not under /api
  const backendOrigin = axiosInstance.defaults.baseURL?.includes('/api')
    ? 'http://localhost:3000'  // Your backend server origin
    : axiosInstance.defaults.baseURL || 'http://localhost:3000';
  
  return `${backendOrigin}${relativeUrl}`;
};

// Utility: Get all stadium image URLs
export const getStadiumImageUrls = (stadium: Stadium): string[] => {
  return stadium.images.map(img => getStadiumImageUrl(img));
};

// Utility: Validate image file
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPG, PNG, and WEBP images are allowed'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image size must be less than 5MB'
    };
  }

  return { valid: true };
};

// Utility: Validate multiple images
export const validateImages = (files: File[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (files.length > 5) {
    errors.push('Maximum 5 images allowed');
  }

  files.forEach((file, index) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      errors.push(`Image ${index + 1}: ${validation.error}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};