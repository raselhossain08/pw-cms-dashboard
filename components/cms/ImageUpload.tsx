"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (file: File) => void;
  onRemove?: () => void;
  disabled?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  showProgress?: boolean;
  progress?: number;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled = false,
  accept = "image/*",
  maxSize = 5,
  className,
  showProgress = false,
  progress = 0,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    setError(null);

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onChange(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onRemove?.();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
      />

      {!preview ? (
        <div
          onClick={!disabled ? handleClick : undefined}
          onDrop={!disabled ? handleDrop : undefined}
          onDragOver={!disabled ? handleDragOver : undefined}
          onDragLeave={handleDragLeave}
          className={cn(
            "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-gray-300 hover:border-primary",
            disabled && "opacity-50 cursor-not-allowed",
            error && "border-red-500"
          )}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 rounded-full bg-gray-100">
              <Upload className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF up to {maxSize}MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative group">
          <div className="relative border-2 border-gray-200 rounded-lg overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={handleRemove}
                disabled={disabled}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {showProgress && progress > 0 && progress < 100 && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Uploading...</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <ImageIcon className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}
