import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ImageUpload = ({
    images = [],
    onImagesChange,
    maxImages = 5,
    className,
}) => {
    const onDrop = useCallback(
        (acceptedFiles) => {
            const newImages = acceptedFiles.map((file) => ({
                file,
                preview: URL.createObjectURL(file),
                isNew: true,
            }));

            const totalImages = images.length + newImages.length;
            if (totalImages > maxImages) {
                alert(`Maximum ${maxImages} images allowed`);
                return;
            }

            onImagesChange([...images, ...newImages]);
        },
        [images, onImagesChange, maxImages]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
        },
        multiple: true,
        maxFiles: maxImages,
    });

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);
    };

    return (
        <div className={cn("space-y-4", className)}>
            {/* Upload Area */}
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors",
                    isDragActive
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400",
                    images.length >= maxImages &&
                        "opacity-50 cursor-not-allowed"
                )}
            >
                <input
                    {...getInputProps()}
                    disabled={images.length >= maxImages}
                />
                <div className="flex flex-col items-center justify-center text-center">
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                        {isDragActive
                            ? "Drop the images here..."
                            : `Drag & drop images here, or click to select`}
                    </p>
                    <p className="text-xs text-gray-500">
                        {images.length}/{maxImages} images uploaded
                    </p>
                </div>
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {images.map((image, index) => (
                        <div key={index} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                <img
                                    src={image.preview || image.url || image}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Progress Info */}
            <div className="text-xs text-gray-500">
                Supported formats: JPEG, PNG, GIF, WebP (Max 5MB each)
            </div>
        </div>
    );
};

export default ImageUpload;
