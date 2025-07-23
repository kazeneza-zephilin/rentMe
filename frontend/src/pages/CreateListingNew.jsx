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
                <Card className="max-w-md mx-auto">
                    <CardContent className="p-6 text-center">
                        <p className="text-gray-600 mb-4">
                            Please sign in to create a listing
                        </p>
                        <Button onClick={() => navigate("/sign-in")}>
                            Sign In
                        </Button>
                    </CardContent>
                </Card>
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
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }

        // Real-time validation for better UX
        if (name === "title" && value.trim()) {
            if (value.length < 3) {
                setErrors((prev) => ({
                    ...prev,
                    title: "Title must be at least 3 characters",
                }));
            } else if (value.length > 100) {
                setErrors((prev) => ({
                    ...prev,
                    title: "Title must be less than 100 characters",
                }));
            }
        }

        if (name === "description" && value.trim()) {
            if (value.length < 10) {
                setErrors((prev) => ({
                    ...prev,
                    description: "Description must be at least 10 characters",
                }));
            } else if (value.length > 1000) {
                setErrors((prev) => ({
                    ...prev,
                    description:
                        "Description must be less than 1000 characters",
                }));
            }
        }

        if (name === "price" && value) {
            const numValue = parseFloat(value);
            if (isNaN(numValue) || numValue <= 0) {
                setErrors((prev) => ({
                    ...prev,
                    price: "Price must be a positive number",
                }));
            } else if (numValue > 10000) {
                setErrors((prev) => ({
                    ...prev,
                    price: "Price must be less than $10,000 per day",
                }));
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
        } else if (formData.title.length < 3) {
            newErrors.title = "Title must be at least 3 characters";
        } else if (formData.title.length > 100) {
            newErrors.title = "Title must be less than 100 characters";
        }

        if (!formData.description.trim()) {
            newErrors.description = "Description is required";
        } else if (formData.description.length < 10) {
            newErrors.description =
                "Description must be at least 10 characters";
        } else if (formData.description.length > 1000) {
            newErrors.description =
                "Description must be less than 1000 characters";
        }

        if (!formData.price) {
            newErrors.price = "Price is required";
        } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
            newErrors.price = "Price must be a positive number";
        } else if (parseFloat(formData.price) > 10000) {
            newErrors.price = "Price must be less than $10,000 per day";
        }

        if (!formData.category) {
            newErrors.category = "Please select a category";
        }

        if (!formData.location.trim()) {
            newErrors.location = "Location is required";
        } else if (formData.location.length < 3) {
            newErrors.location = "Location must be at least 3 characters";
        }

        if (images.length === 0) {
            newErrors.images = "At least one image is required";
        } else if (images.length > 5) {
            newErrors.images = "Maximum 5 images allowed";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            // Show validation errors with better UX
            const firstErrorField = Object.keys(errors)[0];
            if (firstErrorField) {
                const element = document.getElementById(firstErrorField);
                if (element) {
                    element.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                    element.focus();
                }
            }
            return;
        }

        setLoading(true);
        setErrors({}); // Clear previous errors

        try {
            // For now, send as JSON since backend doesn't handle file uploads yet
            const submitData = {
                ...formData,
                price: parseFloat(formData.price),
                images: images.map(
                    (img) =>
                        img.preview ||
                        img.url ||
                        "https://via.placeholder.com/400x300"
                ),
            };

            console.log("Submitting data:", submitData);

            // Get authentication headers using Clerk
            const authConfig = await createAuthenticatedRequest(getToken);

            console.log("Auth config:", authConfig);

            const response = await api.post(
                "/listings",
                submitData,
                authConfig
            );

            console.log("Response:", response.data);

            // Success - show success message and redirect
            setErrors({
                success: "Listing created successfully! Redirecting...",
            });

            setTimeout(() => {
                if (response.data?.id) {
                    navigate(`/listings/${response.data.id}`);
                } else {
                    navigate("/dashboard");
                }
            }, 1500);
        } catch (error) {
            console.error("Error creating listing:", error);

            // Handle different types of errors with better UX
            if (error.response?.status === 400) {
                setErrors({
                    submit:
                        error.response?.data?.error ||
                        "Invalid data provided. Please check all fields.",
                });
            } else if (error.response?.status === 401) {
                setErrors({
                    submit: "You must be signed in to create a listing. Please refresh and try again.",
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
                        "Failed to create listing. Please try again.",
                });
            }

            // Scroll to error message
            setTimeout(() => {
                const errorElement = document.querySelector(".error-message");
                if (errorElement) {
                    errorElement.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                }
            }, 100);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Listing</CardTitle>
                        <CardDescription>
                            List your item for rent and start earning money
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading && (
                            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                                <div className="text-center">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
                                    <p className="text-sm text-gray-600">
                                        Creating your listing...
                                    </p>
                                </div>
                            </div>
                        )}
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6 relative"
                        >
                            {/* Disable form during loading */}
                            <fieldset disabled={loading} className="space-y-6">
                                {/* Title */}
                                <div>
                                    <Label htmlFor="title">Title *</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Professional Camera Kit"
                                        maxLength={100}
                                        className={
                                            errors.title ? "border-red-500" : ""
                                        }
                                    />
                                    <div className="flex justify-between items-center mt-1">
                                        {errors.title ? (
                                            <p className="text-sm text-red-500">
                                                {errors.title}
                                            </p>
                                        ) : (
                                            <div />
                                        )}
                                        <p className="text-xs text-gray-500">
                                            {formData.title.length}/100
                                        </p>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <Label htmlFor="description">
                                        Description *
                                    </Label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Describe your item in detail..."
                                        rows={4}
                                        maxLength={1000}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.description
                                                ? "border-red-500"
                                                : "border-gray-300"
                                        }`}
                                    />
                                    <div className="flex justify-between items-center mt-1">
                                        {errors.description ? (
                                            <p className="text-sm text-red-500">
                                                {errors.description}
                                            </p>
                                        ) : (
                                            <div />
                                        )}
                                        <p className="text-xs text-gray-500">
                                            {formData.description.length}/1000
                                        </p>
                                    </div>
                                </div>

                                {/* Price and Category */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="price">
                                            Price per day ($) *
                                        </Label>
                                        <Input
                                            id="price"
                                            name="price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            placeholder="25.00"
                                            className={
                                                errors.price
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        />
                                        {errors.price && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {errors.price}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="category">
                                            Category *
                                        </Label>
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
                                            <option value="">
                                                Select a category
                                            </option>
                                            {CATEGORIES.map((category) => (
                                                <option
                                                    key={category}
                                                    value={category}
                                                >
                                                    {category}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {errors.category}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Location */}
                                <div>
                                    <Label htmlFor="location">Location *</Label>
                                    <Input
                                        id="location"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        placeholder="e.g., San Francisco, CA"
                                        className={
                                            errors.location
                                                ? "border-red-500"
                                                : ""
                                        }
                                    />
                                    {errors.location && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {errors.location}
                                        </p>
                                    )}
                                </div>

                                {/* Images */}
                                <div>
                                    <Label>Images *</Label>
                                    <ImageUpload
                                        images={images}
                                        onImagesChange={setImages}
                                        maxImages={5}
                                        className="mt-2"
                                    />
                                    {errors.images && (
                                        <p className="text-sm text-red-500 mt-1">
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
                                        className="rounded"
                                    />
                                    <Label
                                        htmlFor="available"
                                        className="text-sm"
                                    >
                                        Available for rent
                                    </Label>
                                </div>

                                {/* Success Message */}
                                {errors.success && (
                                    <div className="bg-green-50 border border-green-200 rounded-md p-4 error-message">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <svg
                                                    className="h-5 w-5 text-green-400"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-green-800">
                                                    {errors.success}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Submit Error */}
                                {errors.submit && (
                                    <div className="bg-red-50 border border-red-200 rounded-md p-4 error-message">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg
                                                    className="h-5 w-5 text-red-400"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-red-800">
                                                    Error creating listing
                                                </h3>
                                                <p className="text-sm text-red-700 mt-1">
                                                    {errors.submit}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <div className="flex gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => navigate("/dashboard")}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Create Listing
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </fieldset>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CreateListing;
