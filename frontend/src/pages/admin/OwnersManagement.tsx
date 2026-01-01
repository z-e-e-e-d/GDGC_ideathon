// src/pages/admin/OwnersManagement.tsx
import { useState, useEffect } from "react";
import {
  Users,
  Eye,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  User,
  Search,
  Filter,
  Download,
  Shield,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useToast } from "../../hooks/use-toast";
import { Badge } from "../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import * as OwnerService from "../../services/owner";

interface Owner {
  _id: string;
  fullName: string;
  email: string;
  role: "owner";
  verification: {
    documentUrl?: string;
    status: "pending" | "approved" | "rejected";
    reviewedBy?: {
      _id: string;
      fullName: string;
      email: string;
    };
    reviewedAt?: string;
  };
  isVerified: boolean;
  createdAt: string;
}

const OwnersManagement = () => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [filteredOwners, setFilteredOwners] = useState<Owner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [isViewingDocument, setIsViewingDocument] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const { toast } = useToast();

  useEffect(() => {
    fetchOwners();
  }, []);

  useEffect(() => {
    filterOwners();
  }, [owners, searchTerm, statusFilter, currentPage]);

  const fetchOwners = async () => {
    try {
      setIsLoading(true);
      const response = await OwnerService.getAllOwners();
      setOwners(response.data);
      setTotalPages(Math.ceil(response.data.length / itemsPerPage));
    } catch (error: any) {
      toast({
        title: "Failed to fetch owners",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterOwners = () => {
    let filtered = [...owners];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (owner) =>
          owner.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          owner.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      if (statusFilter === "verified") {
        filtered = filtered.filter((owner) => owner.isVerified);
      } else if (statusFilter === "unverified") {
        filtered = filtered.filter((owner) => !owner.isVerified);
      } else {
        filtered = filtered.filter(
          (owner) => owner.verification.status === statusFilter
        );
      }
    }

    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setFilteredOwners(filtered.slice(startIndex, endIndex));
  };

  const handleViewDocument = async (owner: Owner) => {
    if (!owner.verification.documentUrl) {
      toast({
        title: "No document",
        description: "This owner has not uploaded a verification document",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsViewingDocument(true);
      
      // Get the full document URL from backend
      const documentUrl = await OwnerService.viewVerificationDocument(owner._id);
      
      // Open in new tab
      window.open(documentUrl, '_blank');
      
    } catch (error: any) {
      toast({
        title: "Failed to view document",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsViewingDocument(false);
    }
  };

  const handleActionClick = (owner: Owner, type: "approve" | "reject") => {
    setSelectedOwner(owner);
    setActionType(type);
    setActionNotes("");
    setShowActionDialog(true);
  };

  const handleActionConfirm = async () => {
    if (!selectedOwner || !actionType) return;

    try {
      setIsProcessingAction(true);
      await OwnerService.updateVerificationStatus(selectedOwner._id, {
        status: actionType === "approve" ? "approved" : "rejected",
        notes: actionNotes,
      });

      toast({
        title: actionType === "approve" ? "Owner approved" : "Owner rejected",
        description: `Successfully ${actionType}d ${selectedOwner.fullName}`,
      });

      // Refresh owners list
      await fetchOwners();
      setShowActionDialog(false);
      setSelectedOwner(null);
      setActionType(null);
      setActionNotes("");
    } catch (error: any) {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleBulkAction = async (action: "approve" | "reject") => {
    const selectedIds = filteredOwners.map((owner) => owner._id);
    if (selectedIds.length === 0) return;

    try {
      await OwnerService.bulkUpdateVerification({
        ownerIds: selectedIds,
        status: action === "approve" ? "approved" : "rejected",
        notes: `Bulk ${action} action`,
      });

      toast({
        title: `Bulk ${action} successful`,
        description: `Updated ${selectedIds.length} owners`,
      });

      await fetchOwners();
    } catch (error: any) {
      toast({
        title: "Bulk action failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleExportData = async () => {
    try {
      const data = await OwnerService.exportOwners("csv");
      if (data instanceof Blob) {
        OwnerService.downloadFile(
          data,
          `owners_export_${new Date().toISOString().split("T")[0]}.csv`
        );
      }
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="font-display text-2xl md:text-3xl text-foreground">
            Owners Management
          </h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Review and verify stadium owners' documents
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-stadium p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground">
                {owners.length}
              </p>
              <p className="text-sm text-muted-foreground">Total Owners</p>
            </div>
            <Users className="w-8 h-8 text-primary/60" />
          </div>
        </div>
        <div className="card-stadium p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground">
                {owners.filter((o) => o.verification.status === "pending").length}
              </p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </div>
            <Clock className="w-8 h-8 text-amber-500/60" />
          </div>
        </div>
        <div className="card-stadium p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground">
                {owners.filter((o) => o.verification.status === "approved").length}
              </p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500/60" />
          </div>
        </div>
        <div className="card-stadium p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground">
                {owners.filter((o) => o.verification.status === "rejected").length}
              </p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500/60" />
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="card-stadium p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                className="pl-10 bg-input border-border"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-input border-border">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-border">
                  Bulk Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleBulkAction("approve")}>
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Approve Selected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction("reject")}>
                  <XCircle className="w-4 h-4 mr-2 text-red-500" />
                  Reject Selected
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExportData}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" onClick={fetchOwners} title="Refresh">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Owners Table */}
      <div className="card-stadium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Owner</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Document</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Registered</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Reviewed By</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOwners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No owners found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {searchTerm || statusFilter !== "all" ? "Try adjusting your filters" : "No owners have registered yet"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOwners.map((owner) => (
                  <tr key={owner._id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{owner.fullName}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {owner.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{getStatusBadge(owner.verification.status)}</td>
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleViewDocument(owner)}
                        disabled={!owner.verification.documentUrl || isViewingDocument}
                      >
                        <FileText className="w-4 h-4" />
                        {owner.verification.documentUrl ? "View" : "No Document"}
                      </Button>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{formatDate(owner.createdAt)}</td>
                    <td className="p-4">
                      {owner.verification.reviewedBy ? (
                        <div className="text-sm">
                          <p className="text-foreground">{owner.verification.reviewedBy.fullName}</p>
                          <p className="text-muted-foreground">{formatDate(owner.verification.reviewedAt || "")}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not reviewed</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {owner.verification.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-100 text-green-800 hover:bg-green-200"
                              onClick={() => handleActionClick(owner, "approve")}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => handleActionClick(owner, "reject")}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {owner.verification.status !== "pending" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleActionClick(owner, "approve")}>
                                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleActionClick(owner, "reject")}>
                                <XCircle className="w-4 h-4 mr-2 text-red-500" />
                                Reject
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewDocument(owner)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Document
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, owners.length)} of {owners.length} owners
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;

                return (
                  <Button key={i} variant={currentPage === pageNum ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(pageNum)} className="w-8 h-8 p-0">
                    {pageNum}
                  </Button>
                );
              })}
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>{actionType === "approve" ? "Approve Owner" : "Reject Owner"}</DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "Are you sure you want to approve this owner? They will be able to list and manage stadiums."
                : "Are you sure you want to reject this owner? They will need to submit new documents."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {selectedOwner && (
              <div className="p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{selectedOwner.fullName}</p>
                    <p className="text-sm text-muted-foreground">{selectedOwner.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <Button variant="link" className="p-0 h-auto text-sm" onClick={() => handleViewDocument(selectedOwner)}>
                    View verification document
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">
                Notes (Optional)
                <span className="text-muted-foreground text-xs ml-1">- Will be visible to the owner</span>
              </Label>
              <textarea
                id="notes"
                className="w-full min-h-[80px] p-3 bg-input border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder={actionType === "approve" ? "Add notes about why this owner was approved..." : "Add notes about why this owner was rejected..."}
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-4">
              <div className="flex gap-3 w-full">
                <Button variant="outline" className="flex-1" onClick={() => setShowActionDialog(false)} disabled={isProcessingAction}>
                  Cancel
                </Button>
                <Button
                  className={`flex-1 ${actionType === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
                  onClick={handleActionConfirm}
                  disabled={isProcessingAction}
                >
                  {isProcessingAction ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : actionType === "approve" ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Owner
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Owner
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OwnersManagement;