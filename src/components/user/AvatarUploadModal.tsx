"use client";

import { useState, useRef, ChangeEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { Camera, Upload, X } from "lucide-react";

interface AvatarUploadModalProps {
  currentAvatar?: string;
  onAvatarUpdated: (newAvatarUrl: string) => void;
  userName: string;
}

export function AvatarUploadModal({
  currentAvatar,
  onAvatarUpdated,
  userName,
}: AvatarUploadModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const userId = useAuthStore((state) => state.user?.id);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image less than 5MB.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSelection = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !userId) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("avatar", selectedFile);

    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/profile/${userId}/avatar`,
        {
          method: "PUT",
          body: formData,
          // Note: Don't set Content-Type header when sending FormData
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();

      // Call the callback with the new avatar URL
      onAvatarUpdated(data.user.avatar);

      toast({
        title: "Avatar updated",
        description: "Your profile image has been updated successfully.",
      });

      setIsOpen(false);
      clearSelection();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description:
          "There was a problem uploading your image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-[#252330] border-purple-800/30 hover:bg-purple-900/20 text-white"
        >
          <Camera className="mr-2 h-4 w-4" />
          Change Profile Picture
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#1A171E] border border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">
            Update Profile Picture
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Upload a new avatar for your profile
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          {previewUrl ? (
            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage src={previewUrl} />
                <AvatarFallback className="text-3xl bg-[#252330]">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-red-600 hover:bg-red-700"
                onClick={clearSelection}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <Avatar className="h-32 w-32 mx-auto">
                <AvatarImage src={currentAvatar || ""} />
                <AvatarFallback className="text-3xl bg-[#252330]">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>

              <div
                className="border-2 border-dashed border-gray-700 rounded-lg p-6 cursor-pointer hover:border-purple-600 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center space-y-2">
                  <Upload className="h-10 w-10 text-gray-500" />
                  <p className="text-sm text-gray-400">
                    Click to select an image
                  </p>
                  <p className="text-xs text-gray-500">
                    JPG, PNG or GIF. 5MB max.
                  </p>
                </div>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {!previewUrl && (
            <Button
              type="button"
              variant="outline"
              className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800"
              onClick={() => fileInputRef.current?.click()}
            >
              Select Image
            </Button>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            className="text-gray-400 hover:bg-gray-800"
            onClick={() => {
              setIsOpen(false);
              clearSelection();
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:from-purple-700 hover:to-cyan-700"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin mr-2"></div>
                Uploading...
              </>
            ) : (
              "Upload Avatar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
