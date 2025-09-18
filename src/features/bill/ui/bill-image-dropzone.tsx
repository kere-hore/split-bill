"use client";

import { cn } from "@/shared/lib/utils";
import { Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import Image from "next/image";

interface BillImageDropzoneProps {
  onFileSelect: (file: File | null) => void;
  maxSize?: number;
  className?: string;
}

export function BillImageDropzone({
  onFileSelect,
  maxSize = 5 * 1024 * 1024, // 5MB
  className,
}: BillImageDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileSelect = (file: File) => {
    // Validate file type - only JPEG/JPG/PNG
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      alert("Only JPEG/JPG/PNG files are allowed");
      return;
    }

    if (file.size > maxSize) {
      alert(`File size must be less than ${maxSize / 1024 / 1024}MB`);
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview(null);
    onFileSelect(null);
  };

  const handleClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".jpg,.jpeg,.png,image/jpeg,image/png";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFileSelect(file);
    };
    input.click();
  };

  if (selectedFile && preview) {
    return (
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-4 h-full",
          className
        )}
      >
        <div className="relative w-full h-full min-h-[200px]">
          <Image
            src={preview}
            alt="Bill preview"
            fill
            className="object-contain rounded-md"
            unoptimized
          />
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 z-10"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-0 text-center">
          {selectedFile.name}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors",
        "p-4 sm:p-8", // Smaller padding on mobile
        isDragOver
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <Upload className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mb-2 sm:mb-4" />
      <p className="text-base sm:text-lg font-medium mb-2">
        Drop your bill image here
      </p>
      <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4">
        or tap to browse files
      </p>
      <p className="text-xs text-muted-foreground">
        Only JPEG/JPG/PNG files (max {maxSize / 1024 / 1024}MB)
      </p>
    </div>
  );
}
