"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Image,
  File,
  Trash2,
  Download,
  Eye,
  Search,
  Filter,
  Upload,
  MoreVertical,
  AlertCircle,
  Calendar,
  HardDrive,
  Grid,
  List,
  Copy,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { formatBytes, formatDate } from "@/lib/utils";
import { FileUpload } from "@/components/shared/file-upload";

interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
  uploadedAt: string;
}

interface MediaResponse {
  files: MediaFile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const mediaApi = {
  async getFiles(
    page = 1,
    limit = 20,
    search = "",
    type = ""
  ): Promise<MediaResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(type && { type }),
    });

    const response = await apiClient.get(`/upload/files?${params}`);
    return response.data;
  },

  async deleteFile(fileId: string): Promise<void> {
    await apiClient.delete(`/upload/files/${fileId}`);
  },

  async getFileInfo(fileId: string): Promise<MediaFile> {
    const response = await apiClient.get(`/upload/files/${fileId}`);
    return response.data;
  },
};

export default function MediaLibraryPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["media-files", currentPage, searchQuery, fileTypeFilter],
    queryFn: () =>
      mediaApi.getFiles(currentPage, 20, searchQuery, fileTypeFilter),
    staleTime: 30000, // 30 seconds
  });

  const deleteMutation = useMutation({
    mutationFn: mediaApi.deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-files"] });
      toast.success("File deleted successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to delete file", {
        description:
          error.message || "An error occurred while deleting the file",
      });
    },
  });

  const handleDeleteFile = async (fileId: string, filename: string) => {
    try {
      await deleteMutation.mutateAsync(fileId);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;

    try {
      await Promise.all(
        selectedFiles.map((fileId) => deleteMutation.mutateAsync(fileId))
      );
      setSelectedFiles([]);
      toast.success(`${selectedFiles.length} files deleted successfully`);
    } catch (error) {
      toast.error("Failed to delete some files");
    }
  };

  const handleViewFile = (file: MediaFile) => {
    setSelectedFile(file);
    setShowViewModal(true);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("File URL copied to clipboard");
  };

  const handleDownload = (file: MediaFile) => {
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download started");
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith("image/")) {
      return <Image className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const getFileTypeColor = (mimetype: string) => {
    if (mimetype.startsWith("image/")) return "bg-green-100 text-green-800";
    if (mimetype.startsWith("video/")) return "bg-purple-100 text-purple-800";
    if (mimetype.startsWith("audio/")) return "bg-blue-100 text-blue-800";
    if (mimetype.includes("pdf")) return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load media files:{" "}
            {(error as any)?.message || "Unknown error"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 container mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600 mt-1">
            Manage your uploaded files and media assets
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 px-3"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 px-3"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUpload(!showUpload)}
          >
            <Upload className="h-4 w-4 mr-2" />
            {showUpload ? "Hide Upload" : "Upload Files"}
          </Button>
          {selectedFiles.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedFiles.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Selected Files</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {selectedFiles.length}{" "}
                    selected files? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBulkDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Files
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Upload Section */}
      {showUpload && (
        <div className="mb-6">
          <FileUpload
            onUploadComplete={() => {
              setShowUpload(false);
            }}
            folder="general"
          />
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter by type
              {fileTypeFilter && (
                <Badge variant="secondary" className="ml-2">
                  {fileTypeFilter}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFileTypeFilter("")}>
              All Files
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setFileTypeFilter("image")}>
              Images
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFileTypeFilter("video")}>
              Videos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFileTypeFilter("audio")}>
              Audio
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFileTypeFilter("document")}>
              Documents
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Files</p>
                  <p className="text-2xl font-bold">{data.total}</p>
                </div>
                <File className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Storage Used</p>
                  <p className="text-2xl font-bold">
                    {formatBytes(
                      data.files.reduce((acc, file) => acc + file.size, 0)
                    )}
                  </p>
                </div>
                <HardDrive className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pages</p>
                  <p className="text-2xl font-bold">{data.totalPages}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Files Display */}
      {isLoading ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              : "space-y-4"
          }
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                {viewMode === "grid" ? (
                  <>
                    <Skeleton className="h-40 w-full rounded-lg mb-3" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </>
                ) : (
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-1/2 mb-2" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                    <Skeleton className="h-8 w-8" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data?.files.length === 0 ? (
        <Card className="p-12 text-center">
          <File className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No files found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || fileTypeFilter
              ? "No files match your current search and filter criteria."
              : "Upload your first file to get started."}
          </p>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
        </Card>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              : "space-y-4"
          }
        >
          {data?.files.map((file) => (
            <Card
              key={file.id}
              className="group hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-4">
                {viewMode === "grid" ? (
                  <>
                    {/* Grid View - File Preview */}
                    <div className="relative mb-3">
                      <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                        {file.mimetype.startsWith("image/") ? (
                          <img
                            src={file.url}
                            alt={file.originalName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            {getFileIcon(file.mimetype)}
                            <span className="text-xs mt-2 font-medium">
                              {file.mimetype.split("/")[1]?.toUpperCase() ||
                                "FILE"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Grid View Selection checkbox */}
                      <div className="absolute top-2 left-2">
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFiles([...selectedFiles, file.id]);
                            } else {
                              setSelectedFiles(
                                selectedFiles.filter((id) => id !== file.id)
                              );
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </div>

                      {/* Grid View Actions menu */}
                      <div className="absolute top-2 right-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewFile(file)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDownload(file)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleCopyUrl(file.url)}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy URL
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete File
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "
                                    {file.originalName}"? This action cannot be
                                    undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteFile(
                                        file.id,
                                        file.originalName
                                      )
                                    }
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Grid View File Info */}
                    <div className="space-y-2">
                      <h3
                        className="font-medium text-sm text-gray-900 truncate"
                        title={file.originalName}
                      >
                        {file.originalName}
                      </h3>
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getFileTypeColor(
                            file.mimetype
                          )}`}
                        >
                          {file.mimetype.split("/")[0]}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatBytes(file.size)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatDate(file.uploadedAt)}
                      </p>
                    </div>
                  </>
                ) : (
                  /* List View */
                  <div className="flex items-center gap-4">
                    {/* List View Selection */}
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFiles([...selectedFiles, file.id]);
                        } else {
                          setSelectedFiles(
                            selectedFiles.filter((id) => id !== file.id)
                          );
                        }
                      }}
                      className="rounded border-gray-300"
                    />

                    {/* List View Thumbnail */}
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                      {file.mimetype.startsWith("image/") ? (
                        <img
                          src={file.url}
                          alt={file.originalName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400">
                          {getFileIcon(file.mimetype)}
                        </div>
                      )}
                    </div>

                    {/* List View File Info */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-medium text-sm text-gray-900 truncate"
                        title={file.originalName}
                      >
                        {file.originalName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getFileTypeColor(
                            file.mimetype
                          )}`}
                        >
                          {file.mimetype.split("/")[0]}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatBytes(file.size)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(file.uploadedAt)}
                        </span>
                      </div>
                    </div>

                    {/* List View Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewFile(file)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(file)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleCopyUrl(file.url)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy URL
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => window.open(file.url, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open in New Tab
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete File</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "
                                  {file.originalName}"? This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteFile(file.id, file.originalName)
                                  }
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= data.totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* View Modal */}
      <AlertDialog open={showViewModal} onOpenChange={setShowViewModal}>
        <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center justify-between">
              <span>File Details</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    selectedFile && handleCopyUrl(selectedFile.url)
                  }
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy URL
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedFile && handleDownload(selectedFile)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    selectedFile && window.open(selectedFile.url, "_blank")
                  }
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open
                </Button>
              </div>
            </AlertDialogTitle>
          </AlertDialogHeader>
          {selectedFile && (
            <div className="space-y-6">
              {/* File Preview */}
              <div className="flex justify-center">
                {selectedFile.mimetype.startsWith("image/") ? (
                  <img
                    src={selectedFile.url}
                    alt={selectedFile.originalName}
                    className="max-w-full max-h-96 object-contain rounded-lg border"
                  />
                ) : (
                  <div className="w-64 h-64 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                    {getFileIcon(selectedFile.mimetype)}
                    <span className="text-lg font-medium mt-4 text-gray-600">
                      {selectedFile.mimetype.split("/")[1]?.toUpperCase() ||
                        "FILE"}
                    </span>
                    <span className="text-sm text-gray-500 mt-1">
                      {selectedFile.originalName}
                    </span>
                  </div>
                )}
              </div>

              {/* File Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      File Name
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedFile.originalName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      File Type
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedFile.mimetype}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      File Size
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {formatBytes(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Upload Date
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {formatDate(selectedFile.uploadedAt)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      File URL
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs bg-gray-100 p-2 rounded flex-1 break-all">
                        {selectedFile.url}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyUrl(selectedFile.url)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
