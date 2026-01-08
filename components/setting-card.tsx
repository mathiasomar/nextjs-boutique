"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { Camera, Edit, Package, Trash2, Upload, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { ChangeEvent, useRef, useState } from "react";
import toast from "react-hot-toast";
import AddSetting from "./add-setting";
import { SettingCategory } from "@/generated/prisma/enums";
import { useSettingsByCategory } from "@/hooks/use-setting";
import { TableMinimalSkeleton } from "./loaders/table-minimal-skeleton";

const SettingCard = ({ category }: { category: SettingCategory }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data: settings, isLoading: isLoadingSettings } =
    useSettingsByCategory(category);

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error(
          "Please select a valid image file (JPEG, PNG, GIF, or WebP)"
        );
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        alert("Image size should be less than 5MB");
        return;
      }

      setSelectedImage(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle image upload (you can integrate with your backend here)
  const handleUpload = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", selectedImage);
      formData.append("upload_preset", "boutique");
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (res.ok) {
        const data = await res.json();
        // updateUserMutation.mutateAsync({ id: user.id, image: data.secure_url });
        console.log(data);
        // toast.success("Image uploaded successfully!");
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Upload failed. Please try again.");
      setUploading(false);
    } finally {
      setUploading(false);
    }

    // Here you would typically upload to your server
    // Example: await uploadToServer(selectedImage);

    // console.log("Uploading image:", {
    //   name: selectedImage.name,
    //   type: selectedImage.type,
    //   size: selectedImage.size,
    //   preview: imagePreview,
    // });

    // Simulate upload
    // alert(`Image "${selectedImage.name}" is ready for upload!`);
  };

  // Get fallback initials from file name
  const getFallbackInitials = () => {
    if (selectedImage) {
      const nameWithoutExtension = selectedImage.name
        .split(".")
        .slice(0, -1)
        .join(".");
      return nameWithoutExtension.substring(0, 2).toUpperCase();
    }
    return "IMG";
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="relative z-1 w-full before:absolute before:top-1/2 before:-traslate-y-1/2 before:left-0 before:w-full before:h-0.5 before:bg-primary before:rounded-2xl">
        <h1 className="relative z-2 bg-background w-max px-2 py-1 ml-6">
          {category
            .toString()
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ") || ""}
        </h1>
      </div>
      <div className="flex flex-col gap-2">
        {category === "branding" ? (
          <div className="grid grid-cols-4 gap-4">
            <Card className="col-span-4 md:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Image Upload
                </CardTitle>
                <CardDescription>
                  Select an image to upload and preview it
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Hidden file input */}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  ref={fileInputRef}
                  className="hidden"
                  id="image-upload"
                />

                {/* Avatar Preview */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-gray-200">
                      {imagePreview ? (
                        <AvatarImage
                          src={imagePreview}
                          alt="Selected preview"
                          className="object-cover"
                        />
                      ) : null}
                      <AvatarFallback className="text-lg bg-gray-100">
                        {selectedImage ? (
                          getFallbackInitials()
                        ) : (
                          <Camera className="h-8 w-8" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    {/* Badge showing selected status */}
                    {selectedImage && (
                      <Badge className="absolute -top-2 -right-2 bg-green-500">
                        Selected
                      </Badge>
                    )}
                  </div>

                  {/* File info */}
                  {selectedImage && (
                    <div className="text-center space-y-2">
                      <p className="font-medium truncate max-w-[250px]">
                        {selectedImage.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(selectedImage.size / 1024).toFixed(2)} KB •{" "}
                        {selectedImage.type.split("/")[1].toUpperCase()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Upload Controls */}
                <div className="space-y-4">
                  {/* Select Button */}
                  <div className="flex flex-col lg:flex-row gap-3">
                    <Button
                      type="button"
                      onClick={handleButtonClick}
                      variant="outline"
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {selectedImage ? "Change Image" : "Select Image"}
                    </Button>

                    {/* Remove Button (only when image is selected) */}
                    {selectedImage && (
                      <Button
                        type="button"
                        onClick={handleRemoveImage}
                        variant="ghost"
                        className="flex-1 flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>

                  {/* Upload Button */}
                  <Button
                    type="button"
                    onClick={handleUpload}
                    disabled={!selectedImage || uploading}
                    className="w-full"
                  >
                    {uploading ? "Uploading..." : "Upload Image"}
                  </Button>
                </div>

                {/* Help text */}
                <div className="text-sm text-gray-500 text-center">
                  <p>Supported formats: JPEG, PNG, GIF, WebP</p>
                  <p>Max file size: 5MB</p>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-4 md:col-span-3">
              <CardHeader>
                <CardTitle>Branding Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  <div className="mx-auto col-span-4 md:col-span-1">
                    <Avatar className="h-32 w-32">
                      <AvatarImage
                        src={"/noimage.png"}
                        alt={""}
                        className="object-cover"
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="w-max">
                    <div className="mb-4">
                      <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-2 flex items-center gap-2">
                          <span>Filename:</span> <span>Filename</span>
                        </div>
                        <div className="col-span-2 flex items-center gap-2">
                          <span>Path:</span> <span>Path</span>
                        </div>
                        <div className="col-span-2 flex items-center gap-2">
                          <span>Mime Type:</span> <span>mimeType</span>
                        </div>
                        <div className="col-span-2 flex items-center gap-2">
                          <span>Size:</span> <span>Size</span>
                        </div>
                        <div className="col-span-2 flex items-center gap-2">
                          <span>Uploaded By:</span> <span>Omar Mathias</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-end my-2">
              <AddSetting category={category as SettingCategory} />
            </div>
            {isLoadingSettings ? (
              <TableMinimalSkeleton />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settings?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No Settings
                      </TableCell>
                    </TableRow>
                  ) : (
                    settings?.map((setting) => (
                      <TableRow key={setting.id}>
                        <TableCell>LOGO</TableCell>
                        <TableCell>logo</TableCell>
                        <TableCell>string</TableCell>
                        <TableCell>Logo</TableCell>
                        <TableCell>Logo</TableCell>
                        <TableCell className="flex items-center gap-2">
                          <Button size={"icon-sm"} variant={"outline"}>
                            <Edit />
                          </Button>
                          <Button size={"icon-sm"} variant={"destructive"}>
                            <Trash2 />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingCard;
