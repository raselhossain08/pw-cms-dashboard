"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  File,
  Image as ImageIcon,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
}

interface FileUploadProps {
  onUploadComplete?: () => void;
  folder?: string;
}

export const FileUpload = ({
  onUploadComplete,
  folder = "general",
}: FileUploadProps) => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async ({ file, folder }: { file: File; folder: string }) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post(
        `/upload/image?folder=${folder}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-files"] });
      queryClient.invalidateQueries({ queryKey: ["media-count"] });
      if (onUploadComplete) {
        onUploadComplete();
      }
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newUploadFiles: UploadFile[] = acceptedFiles.map((file) => ({
        file,
        id: `${file.name}-${Date.now()}`,
        progress: 0,
        status: "pending",
      }));

      setUploadFiles((prev) => [...prev, ...newUploadFiles]);

      // Start uploading files
      newUploadFiles.forEach((uploadFile) => {
        handleUpload(uploadFile);
      });
    },
    [folder]
  );

  const handleUpload = async (uploadFile: UploadFile) => {
    setUploadFiles((prev) =>
      prev.map((f) =>
        f.id === uploadFile.id ? { ...f, status: "uploading", progress: 0 } : f
      )
    );

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id && f.progress < 90
              ? { ...f, progress: f.progress + 10 }
              : f
          )
        );
      }, 100);

      await uploadMutation.mutateAsync({
        file: uploadFile.file,
        folder,
      });

      clearInterval(progressInterval);

      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? { ...f, status: "completed", progress: 100 }
            : f
        )
      );

      toast.success(`${uploadFile.file.name} uploaded successfully`);

      // Remove completed file after 2 seconds
      setTimeout(() => {
        setUploadFiles((prev) => prev.filter((f) => f.id !== uploadFile.id));
      }, 2000);
    } catch (error: any) {
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? {
                ...f,
                status: "error",
                error: error.message || "Upload failed",
                progress: 0,
              }
            : f
        )
      );

      toast.error(`Failed to upload ${uploadFile.file.name}`, {
        description: error.message || "An error occurred during upload",
      });
    }
  };

  const removeFile = (id: string) => {
    setUploadFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif", ".svg"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: true,
  });

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5" />;
    }
    return <File className="h-5 w-5" />;
  };

  const getStatusIcon = (status: UploadFile["status"]) => {
    switch (status) {
      case "completed":
        return <Check className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <Card
        {...getRootProps()}
        className={`cursor-pointer transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-dashed border-gray-300 hover:border-gray-400"
        }`}
      >
        <CardContent className="p-8 text-center">
          <input {...getInputProps()} />
          <Upload
            className={`mx-auto h-12 w-12 mb-4 ${
              isDragActive ? "text-blue-500" : "text-gray-400"
            }`}
          />
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {isDragActive ? "Drop files here" : "Upload files"}
            </p>
            <p className="text-sm text-gray-600">
              Drag and drop images here, or click to select files
            </p>
            <p className="text-xs text-gray-500">
              Supports: JPEG, PNG, WebP, GIF, SVG (max 5MB each)
            </p>
          </div>
          <Button variant="outline" className="mt-4">
            Select Files
          </Button>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploadFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Uploading files</h4>
          {uploadFiles.map((uploadFile) => (
            <Card key={uploadFile.id} className="p-4">
              <div className="flex items-center gap-3">
                <div className="shrink-0">{getFileIcon(uploadFile.file)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {uploadFile.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {uploadFile.status === "uploading" && (
                    <Progress value={uploadFile.progress} className="mt-2" />
                  )}
                  {uploadFile.status === "error" && (
                    <p className="text-xs text-red-500 mt-1">
                      {uploadFile.error}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(uploadFile.status)}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => removeFile(uploadFile.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
