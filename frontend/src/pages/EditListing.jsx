import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
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
import { Loader2, Save } from "lucide-react";

const CATEGORIES = [
    "Electronics",
    "Sports",
    "Tools",
    "Home & Garden",
    "Automotive",
    "Books",
    "Clothing",
    "Furniture",
    "Art & Crafts",
    "Health & Beauty",
    "Toys & Games",
    "Other",
];

const EditListing = () => {
    const navigate = useNavigate();
    const { id: listingId } = useParams();
    const { user, isSignedIn } = useUser();
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [loadingListing, setLoadingListing] = useState(true);
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
                <Card className="max-w-md mx-auto">
                    <CardContent className="p-6 text-center">
                        <p className="text-gray-600 mb-4">
                            Please sign in to edit your listings
                        </p>
                        <Button onClick={() => navigate("/sign-in")}>
                            Sign In
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Fetch listing data on component mount
    useEffect(() => {
        if (listingId && isSignedIn) {
            fetchListing();
        }
    }, [listingId, isSignedIn]);

    const fetchListing = async () => {
        try {
            setLoadingListing(true);

            // Get authentication headers
            const authConfig = await createAuthenticatedRequest(getToken);

            const response = await api.get(
                `/listings/${listingId}`,
                authConfig
            );
            const listing = response.data;

            console.log("Fetched listing:", listing);
            console.log("Current user:", user);

            // Check if user owns this listing
            if (listing.owner?.clerkId !== user?.id) {
                toast.error("You can only edit your own listings!");
                navigate("/dashboard");
                return;
            }

            // Populate form with existing data
            setFormData({
                title: listing.title || "",
                description: listing.description || "",
                price: listing.price?.toString() || "",
                category: listing.category || "",
                location: listing.location || "",
                available: listing.available ?? true,
            });

            // Convert image URLs to image objects
            if (listing.images && listing.images.length > 0) {
                const imageObjects = listing.images.map((url, index) => ({
                    id: index,
                    url: url,
                    preview: url,
                }));
                setImages(imageObjects);
            }
        } catch (error) {
            console.error("Error fetching listing:", error);
            if (error.response?.status === 404) {
                toast.error("Listing not found.");
            } else if (error.response?.status === 403) {
                toast.error("You don't have permission to edit this listing.");
            } else {
                toast.error("Failed to load listing. Please try again.");
            }
            navigate("/dashboard");
        } finally {
            setLoadingListing(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
        } else if (formData.title.length < 3) {
            newErrors.title = "Title must be at least 3 characters";
        }

        if (!formData.description.trim()) {
            newErrors.description = "Description is required";
        } else if (formData.description.length < 10) {
            newErrors.description =
                "Description must be at least 10 characters";
        }

        if (!formData.price) {
            newErrors.price = "Price is required";
        } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
            newErrors.price = "Price must be a positive number";
        }

        if (!formData.category) {
            newErrors.category = "Category is required";
        }

        if (!formData.location.trim()) {
            newErrors.location = "Location is required";
        }

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

            const submitData = {
                ...formData,
                price: parseFloat(formData.price),
                images: allImageUrls,
            };

            console.log("Updating listing:", submitData);

            // Get authentication headers using Clerk
            const authConfig = await createAuthenticatedRequest(getToken);

            const response = await api.put(
                `/listings/${listingId}`,
                submitData,
                authConfig
            );

            console.log("Update response:", response.data);

            // Success - show success message and redirect to dashboard
            toast.success("✨ Listing updated successfully!", {
                duration: 4000,
                position: "top-center",
                style: {
                    background: "#10B981",
                    color: "white",
                    fontWeight: "500",
                },
            });

            // Redirect to dashboard
            setTimeout(() => {
                navigate("/dashboard");
            }, 1500);
        } catch (error) {
            console.error("Error updating listing:", error);

            // Handle different types of errors with better UX
            if (error.response?.status === 400) {
                setErrors({
                    submit:
                        error.response?.data?.error ||
                        "Invalid data provided. Please check all fields.",
                });
            } else if (error.response?.status === 401) {
                setErrors({
                    submit: "You must be signed in to update listings. Please refresh and try again.",
                });
            } else if (error.response?.status === 403) {
                setErrors({
                    submit: "You can only edit your own listings.",
                });
            } else if (error.response?.status === 404) {
                setErrors({
                    submit: "Listing not found. It may have been deleted.",
                });
            } else if (error.response?.status === 500) {
                setErrors({
                    submit: "Server error occurred. Please try again in a moment.",
                });
            } else if (error.code === "NETWORK_ERROR" || !error.response) {
                setErrors({
                    submit: "Network error. Please check your connection and try again.",
                });
            } else if (error.response?.data?.errors) {
                // Handle validation errors from backend
                const apiErrors = {};
                error.response.data.errors.forEach((err) => {
                    apiErrors[err.path || err.param] = err.msg;
                });
                setErrors(apiErrors);
            } else {
                setErrors({
                    submit:
                        error.response?.data?.error ||
                        "Failed to update listing. Please try again.",
                });
            }

            toast.error(
                "Failed to update listing. Please check the form and try again."
            );
        } finally {
            setLoading(false);
        }
    };

    if (loadingListing) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Loading listing...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Listing</CardTitle>
                        <CardDescription>
                            Update your item information
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {errors.submit && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-red-600 text-sm font-medium">
                                    {errors.submit}
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter listing title"
                                    className={
                                        errors.title ? "border-red-500" : ""
                                    }
                                />
                                {errors.title && (
                                    <p className="text-red-500 text-sm">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    Description *
                                </Label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    placeholder="Describe your item"
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.description
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    }`}
                                />
                                {errors.description && (
                                    <p className="text-red-500 text-sm">
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            {/* Price */}
                            <div className="space-y-2">
                                <Label htmlFor="price">
                                    Price per day ($) *
                                </Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    className={
                                        errors.price ? "border-red-500" : ""
                                    }
                                />
                                {errors.price && (
                                    <p className="text-red-500 text-sm">
                                        {errors.price}
                                    </p>
                                )}
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <Label htmlFor="category">Category *</Label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.category
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    }`}
                                >
                                    <option value="">Select a category</option>
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                                {errors.category && (
                                    <p className="text-red-500 text-sm">
                                        {errors.category}
                                    </p>
                                )}
                            </div>

                            {/* Location */}
                            <div className="space-y-2">
                                <Label htmlFor="location">Location *</Label>
                                <Input
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="City, State"
                                    className={
                                        errors.location ? "border-red-500" : ""
                                    }
                                />
                                {errors.location && (
                                    <p className="text-red-500 text-sm">
                                        {errors.location}
                                    </p>
                                )}
                            </div>

                            {/* Available checkbox */}
                            <div className="flex items-center space-x-2">
                                <input
                                    id="available"
                                    name="available"
                                    type="checkbox"
                                    checked={formData.available}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <Label htmlFor="available">
                                    Available for rent
                                </Label>
                            </div>

                            {/* Images */}
                            <div className="space-y-2">
                                <Label>Images *</Label>
                                <ImageUpload
                                    images={images}
                                    setImages={setImages}
                                    maxImages={5}
                                />
                                {errors.images && (
                                    <p className="text-red-500 text-sm">
                                        {errors.images}
                                    </p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Update Listing
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate("/dashboard")}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default EditListing;
