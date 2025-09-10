"use client";

import React from "react";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, error, disabled = false }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Update preview when value changes
  React.useEffect(() => {
    if (value) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [value]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      // Validate image type more strictly
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please select a JPEG, PNG, GIF, or WebP image");
        return;
      }

      onChange(file);
    },
    [onChange]
  );

  const removeImage = useCallback(() => {
    onChange(null);
  }, [onChange]);

  return (
    <div className="space-y-4">
      {previewUrl ? (
        <Card className="relative overflow-hidden">
          <img
            src={previewUrl || "/placeholder.svg"}
            alt="Cover preview"
            className="w-full h-48 object-cover"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 p-0 w-6 h-6"
            onClick={removeImage}
          >
            <X size={12} />
          </Button>
        </Card>
      ) : (
        <Card
          className={`border-2 border-dashed transition-colors ${
            disabled
              ? "opacity-50 cursor-not-allowed"
              : dragActive
              ? "border-primary bg-primary/5"
              : error
              ? "border-destructive bg-destructive/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
          onDragEnter={disabled ? undefined : handleDrag}
          onDragLeave={disabled ? undefined : handleDrag}
          onDragOver={disabled ? undefined : handleDrag}
          onDrop={disabled ? undefined : handleDrop}
        >
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop an image here
            </p>
            <Button variant="outline" size="sm" asChild disabled={disabled}>
              <label htmlFor="image-upload" className={disabled ? "cursor-not-allowed" : "cursor-pointer"}>
                <Upload className="h-4 w-4 mr-2" />
                Choose Image
              </label>
            </Button>
            <input
              id="image-upload"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={disabled ? undefined : handleChange}
              className="hidden"
              disabled={disabled}
            />
          </div>
        </Card>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <p className="text-xs text-muted-foreground">
        Recommended: 1200x630px for optimal social media sharing. Max file size: 5MB.
      </p>
    </div>
  );
}
