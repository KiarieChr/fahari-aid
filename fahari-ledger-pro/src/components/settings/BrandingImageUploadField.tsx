import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiCall, ApiError } from "@/api/client";
import { toast } from "sonner";

interface BrandingImageUploadFieldProps {
  label: string;
  description?: string;
  assetType: "logo" | "logo_dark" | "favicon";
  value: string | null;
  onChange: (url: string | null) => void;
  recommendedSize?: string;
}

export function BrandingImageUploadField({
  label,
  description,
  assetType,
  value,
  onChange,
  recommendedSize = "PNG, JPG, SVG, WebP, or ICO. Max 5MB.",
}: BrandingImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setUploadError(null);

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      const err = "Selected image exceeds 5MB. Please choose a smaller file.";
      setUploadError(err);
      toast.error(err);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("asset_type", assetType);

      const res = await apiCall<{ url: string; relative_url?: string }>(
        "/admin/branding/upload/",
        {
          method: "POST",
          body: formData,
        }
      );

      if (res && res.url) {
        onChange(res.url);
        toast.success(`${label} uploaded successfully!`);
      }
    } catch (err: unknown) {
      console.error("Upload failed:", err);
      let msg = "Failed to upload image. Please try again.";
      if (err instanceof ApiError && typeof err.data === "object" && err.data !== null) {
        msg = (err.data as any).error || msg;
      }
      setUploadError(msg);
      toast.error(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setUploadError(null);
  };

  const isDarkAsset = assetType === "logo_dark";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
          {label}
        </Label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
        >
          <LinkIcon className="h-3 w-3" />
          <span>{showUrlInput ? "Hide URL input" : "Or enter URL"}</span>
        </button>
      </div>

      {description && (
        <p className="text-[11px] text-muted-foreground">{description}</p>
      )}

      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`group relative flex items-center gap-4 p-3.5 rounded-2xl border-2 border-dashed transition-all cursor-pointer select-none ${
          dragOver
            ? "border-primary bg-primary/5 ring-4 ring-primary/10"
            : value
            ? "border-border/80 bg-card hover:border-primary/50"
            : "border-border/70 hover:border-primary/50 bg-secondary/20 hover:bg-secondary/40"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp,image/x-icon,image/vnd.microsoft.icon"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />

        {/* Thumbnail Preview or Icon */}
        <div
          className={`relative shrink-0 h-16 w-16 rounded-xl flex items-center justify-center overflow-hidden border shadow-xs transition-transform group-hover:scale-105 ${
            isDarkAsset
              ? "bg-slate-900 border-slate-700 text-white"
              : "bg-white dark:bg-slate-950 border-border/80 text-foreground"
          }`}
        >
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : value ? (
            <img
              src={value}
              alt={label}
              className="h-full w-full object-contain p-1"
              onError={(e) => {
                // Handle broken image URL fallback
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <ImageIcon className="h-6 w-6 text-muted-foreground/60" />
          )}
        </div>

        {/* Action text & Details */}
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
              {isUploading ? "Uploading file..." : value ? "Click to replace file" : "Choose file or drag & drop"}
            </span>
            {value && !isUploading && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                <CheckCircle2 className="h-3 w-3" /> Configured
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground truncate">
            {value ? value.split("/").pop() : recommendedSize}
          </p>
        </div>

        {/* Action Button */}
        <div className="shrink-0 flex items-center gap-1.5">
          {value && !isUploading ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Remove image"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              className="h-8 rounded-xl text-xs font-medium pointer-events-none"
            >
              <Upload className="h-3.5 w-3.5 mr-1" />
              Browse
            </Button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {uploadError && (
        <p className="text-xs font-medium text-destructive">{uploadError}</p>
      )}

      {/* Collapsible Manual URL Input */}
      {showUrlInput && (
        <div className="space-y-1 pt-1 animate-in fade-in duration-200">
          <Input
            value={value || ""}
            onChange={(e) => onChange(e.target.value.trim() || null)}
            placeholder="https://... (or /media/branding/...)"
            className="h-9 rounded-xl text-xs font-mono bg-background"
          />
        </div>
      )}
    </div>
  );
}
