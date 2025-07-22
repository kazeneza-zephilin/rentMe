import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import { useApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

const CreateListing = () => {
    const navigate = useNavigate();
    const api = useApi();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        category: "",
        location: "",
        images: [],
    });

    const createListingMutation = useMutation(
        async (data) => {
            const response = await api.post("/listings", data);
            return response.data;
        },
        {
            onSuccess: () => {
                toast.success("Listing created successfully!");
                navigate("/dashboard");
            },
            onError: (error) => {
                toast.error(error.message || "Failed to create listing");
            },
        }
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        createListingMutation.mutate({
            ...formData,
            price: parseFloat(formData.price),
            images:
                formData.images.length > 0
                    ? formData.images
                    : ["https://via.placeholder.com/400x300"],
        });
    };

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const categories = [
        "Electronics",
        "Gaming",
        "Vehicles",
        "Home & Garden",
        "Sports",
        "Tools",
        "Photography",
        "Music",
        "Fashion",
        "Books",
    ];

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Create New Listing</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Item Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="What are you renting out?"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe your item in detail..."
                                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="price">Price per day ($)</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="category">Category</Label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="City, State"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={createListingMutation.isLoading}
                        >
                            {createListingMutation.isLoading
                                ? "Creating..."
                                : "Create Listing"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default CreateListing;
