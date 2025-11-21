"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useImageUpload } from "@/hooks/use-image-upload";
import { uploadService } from "@/lib/api/upload-service";
import { toast } from "sonner";

interface ImageUploaderProps {
  onUpload: (url: string) => void;
  currentImage?: string;
  accept?: string;
  maxSize?: number;
  uploadKey: string;
  label?: string;
  className?: string;
  folder?: "footer" | "header" | "blog" | "course" | "gallery" | "general";
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUpload,
  currentImage,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB
  uploadKey,
  label,
  className,
  folder = "general",
}) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const { upload, progress, isUploading, clear } = useImageUpload(
    uploadKey,
    folder
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      try {
        // Show upload start notification
        toast.info(`Uploading ${file.name}...`, {
          description: "Processing your image, please wait.",
          duration: 2000,
        });

        const result = await upload(file);

        // Set preview to the uploaded URL
        setPreview(result.url);
        onUpload(result.url);

        // Success is handled in the parent component
      } catch (error) {
        // Error is handled in the hook, reset preview
        setPreview(currentImage || null);

        toast.error("Upload failed", {
          description: "Please try again or choose a different image.",
          duration: 4000,
        });
      }
    },
    [upload, onUpload, currentImage]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { [accept]: [] },
    maxSize,
    maxFiles: 1,
    disabled: isUploading,
  });

  const handleRemove = () => {
    setPreview(null);
    clear();
    onUpload("");
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <label className="text-sm font-medium">{label}</label>}

      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
          isDragActive && "border-primary bg-primary/5",
          !isDragActive && "border-gray-300 hover:border-primary",
          isUploading && "pointer-events-none opacity-60"
        )}
      >
        <input {...getInputProps()} />

        {preview ? (
          <div className="relative">
            <img
              src={
                preview.startsWith("http") || preview.startsWith("data:")
                  ? preview
                  : uploadService.getImageUrl(preview)
              }
              alt="Preview"
              className="w-full h-48 object-contain rounded"
              onError={(e) => {
                const src = e.currentTarget.src;
                const generatedUrl = uploadService.getImageUrl(preview);

                console.error("Image load failed:", {
                  originalPreview: preview,
                  generatedSrc: generatedUrl,
                  actualSrc: src,
                  isFullUrl:
                    preview.startsWith("http") || preview.startsWith("data:"),
                  timestamp: new Date().toISOString(),
                });

                // Show error toast for better user feedback
                toast.error("Failed to load image preview", {
                  description:
                    "Please check if the image file exists and try uploading again.",
                  duration: 3000,
                });

                setPreview(null);
              }}
              onLoad={(e) => {
                if (process.env.NODE_ENV === "development") {
                  console.log("Image loaded successfully:", {
                    src: e.currentTarget.src,
                    originalPreview: preview,
                    timestamp: new Date().toISOString(),
                  });
                }
              }}
            />
            {!isUploading && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              {isUploading ? (
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              ) : (
                <Upload className="h-12 w-12 text-gray-400" />
              )}
            </div>
            <p className="text-sm text-gray-600 mb-1">
              {isDragActive
                ? "Drop the image here"
                : "Drag & drop an image here, or click to browse"}
            </p>
            <p className="text-xs text-gray-400">
              Max size: {(maxSize / (1024 * 1024)).toFixed(0)}MB
            </p>
          </div>
        )}

        {isUploading && (
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-center mt-2 text-gray-500">
              Uploading... {progress}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
