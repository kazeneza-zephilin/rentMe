import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ImageUpload from "@/components/ui/image-upload";
import { api, createAuthenticatedRequest } from "@/lib/api";
import { Loader2, Save, X } from "lucide-react";
import toast from "react-hot-toast";

const CATEGORIES = [
    "Electronics",
    "Sports",
    "Tools",
    "Home & Garden",
    "Automotive",
    "Books",
    "Clothing",
    "Furniture",
    "Music",
    "Other",
];

const CreateListing = () => {
    const navigate = useNavigate();
    const { user, isSignedIn } = useUser();
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState([]);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        category: "",
        location: "",
        available: true,
    });
    const [errors, setErrors] = useState({});

    // Redirect if not signed in
    if (!isSignedIn) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
                    <p>You need to be signed in to create a listing.</p>
                </div>
            </div>
        );
    }

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Title validation
        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
        } else if (formData.title.length < 3) {
            newErrors.title = "Title must be at least 3 characters";
        } else if (formData.title.length > 100) {
            newErrors.title = "Title must be less than 100 characters";
        }

        // Description validation
        if (!formData.description.trim()) {
            newErrors.description = "Description is required";
        } else if (formData.description.length < 10) {
            newErrors.description =
                "Description must be at least 10 characters";
        }

        // Price validation
        if (!formData.price) {
            newErrors.price = "Price is required";
        } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
            newErrors.price = "Price must be a valid number greater than 0";
        }

        // Category validation
        if (!formData.category) {
            newErrors.category = "Category is required";
        }

        // Location validation
        if (!formData.location.trim()) {
            newErrors.location = "Location is required";
        }

        // Images validation
        if (images.length === 0) {
            newErrors.images = "At least one image is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setErrors({}); // Clear previous errors

        try {
            // Upload images first if there are any new images
            let imageUrls = [];
            const imagesToUpload = images.filter(
                (img) => img.isNew && img.file
            );
            const existingImages = images.filter(
                (img) => !img.isNew && (img.url || typeof img === "string")
            );

            if (imagesToUpload.length > 0) {
                console.log(
                    "Uploading",
                    imagesToUpload.length,
                    "new images..."
                );

                // Create FormData for image upload
                const imageFormData = new FormData();
                imagesToUpload.forEach((image) => {
                    imageFormData.append("images", image.file);
                });

                // Get authentication headers
                const authConfig = await createAuthenticatedRequest(getToken);

                // Upload images to Cloudinary
                const uploadResponse = await api.post(
                    "/listings/upload-images",
                    imageFormData,
                    {
                        ...authConfig,
                        headers: {
                            ...authConfig.headers,
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

                console.log("Image upload response:", uploadResponse.data);
                imageUrls = uploadResponse.data.images;
            }

            // Combine uploaded images with existing ones
            const allImageUrls = [
                ...existingImages.map((img) => img.url || img),
                ...imageUrls,
            ];

            // Create the listing with uploaded image URLs
            const submitData = {
                ...formData,
                price: parseFloat(formData.price),
                images: allImageUrls,
            };

            console.log("Submitting listing data:", submitData);

            // Get authentication headers using Clerk
            const authConfig = await createAuthenticatedRequest(getToken);

            console.log("Auth config:", authConfig);

            const response = await api.post(
                "/listings",
                submitData,
                authConfig
            );

            console.log("Response:", response.data);

            // Success - show success message and redirect to dashboard
            toast.success("🎉 Listing created successfully!", {
                duration: 4000,
                position: "top-center",
                style: {
                    background: "#10B981",
                    color: "#FFFFFF",
                },
            });

            // Redirect to dashboard after a short delay
            setTimeout(() => {
                navigate("/dashboard");
            }, 1000);
        } catch (error) {
            console.error("Error creating listing:", error);

            if (error.response?.status === 401) {
                toast.error("Authentication failed. Please sign in again.");
                return;
            }

            if (error.response?.status === 400) {
                const validationErrors = error.response.data?.errors;
                if (validationErrors && Array.isArray(validationErrors)) {
                    const errorMap = {};
                    validationErrors.forEach((err) => {
                        errorMap[err.path] = err.msg;
                    });
                    setErrors(errorMap);
                    toast.error("Please fix the form errors and try again.");
                } else {
                    toast.error("Invalid form data. Please check your inputs.");
                }
            } else {
                toast.error("Failed to create listing. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Create New Listing
                </h1>
                <p className="text-gray-600">
                    Share your item with the community and start earning.
                </p>
            </div>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Save className="w-5 h-5" />
                        Item Details
                    </CardTitle>
                    <CardDescription>
                        Fill in the details about the item you want to rent out.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="title"
                                className="text-sm font-medium"
                            >
                                Title *
                            </Label>
                            <Input
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="What are you renting out?"
                                className={errors.title ? "border-red-500" : ""}
                            />
                            {errors.title && (
                                <p className="text-sm text-red-500">
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="description"
                                className="text-sm font-medium"
                            >
                                Description *
                            </Label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Describe your item in detail..."
                                rows={4}
                                className={`w-full rounded-md border px-3 py-2 text-sm ${
                                    errors.description
                                        ? "border-red-500"
                                        : "border-input"
                                } bg-background`}
                            />
                            {errors.description && (
                                <p className="text-sm text-red-500">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        {/* Price and Category */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="price"
                                    className="text-sm font-medium"
                                >
                                    Price per day ($) *
                                </Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    className={
                                        errors.price ? "border-red-500" : ""
                                    }
                                />
                                {errors.price && (
                                    <p className="text-sm text-red-500">
                                        {errors.price}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="category"
                                    className="text-sm font-medium"
                                >
                                    Category *
                                </Label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className={`w-full h-10 rounded-md border px-3 py-2 text-sm bg-background ${
                                        errors.category
                                            ? "border-red-500"
                                            : "border-input"
                                    }`}
                                >
                                    <option value="">Select a category</option>
                                    {CATEGORIES.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                                {errors.category && (
                                    <p className="text-sm text-red-500">
                                        {errors.category}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="location"
                                className="text-sm font-medium"
                            >
                                Location *
                            </Label>
                            <Input
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                placeholder="City, State or specific address"
                                className={
                                    errors.location ? "border-red-500" : ""
                                }
                            />
                            {errors.location && (
                                <p className="text-sm text-red-500">
                                    {errors.location}
                                </p>
                            )}
                        </div>

                        {/* Images */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">
                                Images *
                            </Label>
                            <ImageUpload
                                images={images}
                                onImagesChange={setImages}
                                maxImages={5}
                                className={
                                    errors.images ? "border-red-500" : ""
                                }
                            />
                            {errors.images && (
                                <p className="text-sm text-red-500">
                                    {errors.images}
                                </p>
                            )}
                        </div>

                        {/* Availability */}
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="available"
                                name="available"
                                checked={formData.available}
                                onChange={handleInputChange}
                                className="w-4 h-4"
                            />
                            <Label
                                htmlFor="available"
                                className="text-sm font-medium"
                            >
                                Available for rent
                            </Label>
                        </div>

                        {/* Submit and Cancel Buttons */}
                        <div className="pt-4 flex gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/dashboard")}
                                className="flex-1 h-12 text-base"
                                disabled={loading}
                            >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1 h-12 text-base"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Creating Listing...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Create Listing
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default CreateListing;
