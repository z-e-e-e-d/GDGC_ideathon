// services/OwnerService.ts
import axiosInstance from "../utils/axiosInstance";

export interface Owner {
  _id: string;
  fullName: string;
  email: string;
  role: "owner";
  
  // Verification
  verification: {
    documentUrl?: string;
    status: "pending" | "approved" | "rejected";
    reviewedBy?: {
      _id: string;
      fullName: string;
      email: string;
    };
    reviewedAt?: string;
    notes?: string;
  };
  
  isVerified: boolean;
  createdAt: string;
}

export interface OwnerStats {
  total: number;
  verified: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface GetAllOwnersResponse {
  success: boolean;
  data: Owner[];
  count: number;
  stats: OwnerStats;
}

export interface GetOwnerResponse {
  success: boolean;
  data: Owner;
}

export interface VerificationStatusUpdateRequest {
  status: "approved" | "rejected";
  notes?: string;
}

export interface VerificationStatusUpdateResponse {
  success: boolean;
  message: string;
  data: Owner;
}

export interface BulkVerificationUpdateRequest {
  ownerIds: string[];
  status: "approved" | "rejected";
  notes?: string;
}

export interface BulkVerificationUpdateResponse {
  success: boolean;
  message: string;
  data: {
    modifiedCount: number;
  };
}

export interface DocumentUploadResponse {
  success: boolean;
  message: string;
  data: {
    documentUrl: string;
    status: string;
  };
}

export interface DocumentInfo {
  url: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  status: string;
  reviewedBy?: {
    _id: string;
    fullName: string;
    email: string;
  };
  reviewedAt?: string;
}

export interface GetDocumentInfoResponse {
  success: boolean;
  data: DocumentInfo | null;
  message?: string;
}

export interface DeleteOwnerResponse {
  success: boolean;
  message: string;
}

export interface ExportOwnersResponse {
  success: boolean;
  data: Owner[];
  count: number;
  exportedAt: string;
}

export interface MyVerificationResponse {
  success: boolean;
  data: Owner;
}

// Get all owners (admin only)
export const getAllOwners = async (params?: {
  search?: string;
  verificationStatus?: string;
}): Promise<GetAllOwnersResponse> => {
  try {
    const response = await axiosInstance.get("/owners", { params });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || "Failed to fetch owners"
    );
  }
};

// Get owner by ID (admin only)
export const getOwnerById = async (ownerId: string): Promise<GetOwnerResponse> => {
  try {
    const response = await axiosInstance.get(`/owners/${ownerId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || "Failed to fetch owner"
    );
  }
};

// Update owner verification status (admin only)
export const updateVerificationStatus = async (
  ownerId: string,
  data: VerificationStatusUpdateRequest
): Promise<VerificationStatusUpdateResponse> => {
  try {
    const response = await axiosInstance.put(
      `/owners/${ownerId}/verification`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || "Failed to update verification status"
    );
  }
};

// Bulk update verification status (admin only)
export const bulkUpdateVerification = async (
  data: BulkVerificationUpdateRequest
): Promise<BulkVerificationUpdateResponse> => {
  try {
    const response = await axiosInstance.post(
      "/owners/bulk-verification",
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || "Failed to bulk update verification status"
    );
  }
};

// Upload verification document (owner only)
export const uploadVerificationDocument = async (
  file: File
): Promise<DocumentUploadResponse> => {
  try {
    const formData = new FormData();
    formData.append("document", file);

    const response = await axiosInstance.post(
      "/owners/upload/document",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || "Failed to upload verification document"
    );
  }
};

// View verification document (admin only)
export const viewVerificationDocument = async (ownerId: string): Promise<Blob> => {
  try {
    const response = await axiosInstance.get(`/owners/${ownerId}/document`, {
      responseType: "blob",
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || "Failed to view verification document"
    );
  }
};

// Get verification document info (admin only)
export const getDocumentInfo = async (
  ownerId: string
): Promise<GetDocumentInfoResponse> => {
  try {
    const response = await axiosInstance.get(`/owners/${ownerId}/document/info`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || "Failed to get document info"
    );
  }
};

// Delete owner (admin only)
export const deleteOwner = async (ownerId: string): Promise<DeleteOwnerResponse> => {
  try {
    const response = await axiosInstance.delete(`/owners/${ownerId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || "Failed to delete owner"
    );
  }
};

// Export owners data (admin only)
export const exportOwners = async (format: "json" | "csv" = "json"): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/owners/export/data`, {
      params: { format },
      responseType: format === "csv" ? "blob" : "json",
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || "Failed to export owners data"
    );
  }
};

// Get owner's own verification info (owner only)
export const getMyVerificationInfo = async (): Promise<MyVerificationResponse> => {
  try {
    const response = await axiosInstance.get("/owners/my/verification");
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || "Failed to fetch verification info"
    );
  }
};

// Utility function to download file
export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// Utility function to open file in new tab
export const openFileInNewTab = (blob: Blob) => {
  const url = window.URL.createObjectURL(blob);
  window.open(url, "_blank");
  // Note: URL will be revoked when the tab is closed
};