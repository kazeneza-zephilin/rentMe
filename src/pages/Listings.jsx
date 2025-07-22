import { useState, useEffect } from "react";
import { useQuery } from "react-query";
import { Link, useSearchParams } from "react-router-dom";
import { useApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Filter, MapPin, Star, Heart } from "lucide-react";

const Listings = () => {
    const api = useApi();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(
        searchParams.get("search") || ""
    );
    const [category, setCategory] = useState(
        searchParams.get("category") || ""
    );
    const [location, setLocation] = useState(
        searchParams.get("location") || ""
    );
    const [minPrice, setMinPrice] = useState(
        searchParams.get("minPrice") || ""
    );
    const [maxPrice, setMaxPrice] = useState(
        searchParams.get("maxPrice") || ""
    );
    const [page, setPage] = useState(1);

    const {
        data: listingsData,
        isLoading,
        error,
        refetch,
    } = useQuery(
        ["listings", searchTerm, category, location, minPrice, maxPrice, page],
        async () => {
            const params = new URLSearchParams();
            if (searchTerm) params.append("search", searchTerm);
            if (category) params.append("category", category);
            if (location) params.append("location", location);
            if (minPrice) params.append("minPrice", minPrice);
            if (maxPrice) params.append("maxPrice", maxPrice);
            params.append("page", page.toString());
            params.append("limit", "12");

            const response = await api.get(`/listings?${params.toString()}`);
            return response.data;
        },
        {
            keepPreviousData: true,
        }
    );

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.append("search", searchTerm);
        if (category) params.append("category", category);
        if (location) params.append("location", location);
        if (minPrice) params.append("minPrice", minPrice);
        if (maxPrice) params.append("maxPrice", maxPrice);

        setSearchParams(params);
        setPage(1);
        refetch();
    };

    const clearFilters = () => {
        setSearchTerm("");
        setCategory("");
        setLocation("");
        setMinPrice("");
        setMaxPrice("");
        setSearchParams({});
        setPage(1);
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

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${
                    i < Math.floor(rating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                }`}
            />
        ));
    };

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="text-center text-red-600">
                    Error loading listings: {error.message}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Browse Listings
                </h1>
                <p className="text-gray-600">Find the perfect item to rent</p>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    <div className="lg:col-span-2">
                        <Label htmlFor="search">Search</Label>
                        <Input
                            id="search"
                            placeholder="What are you looking for?"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) =>
                                e.key === "Enter" && handleSearch()
                            }
                        />
                    </div>

                    <div>
                        <Label htmlFor="category">Category</Label>
                        <select
                            id="category"
                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                            id="location"
                            placeholder="City, State"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>

                    <div>
                        <Label htmlFor="minPrice">Min Price</Label>
                        <Input
                            id="minPrice"
                            type="number"
                            placeholder="$0"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                        />
                    </div>

                    <div>
                        <Label htmlFor="maxPrice">Max Price</Label>
                        <Input
                            id="maxPrice"
                            type="number"
                            placeholder="$1000"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                    <Button onClick={handleSearch}>
                        <Search className="w-4 h-4 mr-2" />
                        Search
                    </Button>
                    <Button variant="outline" onClick={clearFilters}>
                        Clear Filters
                    </Button>
                </div>
            </div>

            {/* Results */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }, (_, i) => (
                        <Card key={i} className="animate-pulse">
                            <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                            <CardHeader>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-gray-600">
                            {listingsData?.pagination.total || 0} listings found
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {listingsData?.listings.map((listing) => (
                            <Link
                                key={listing.id}
                                to={`/listings/${listing.id}`}
                            >
                                <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                                    <div className="relative">
                                        <img
                                            src={
                                                listing.images[0] ||
                                                "/placeholder-image.jpg"
                                            }
                                            alt={listing.title}
                                            className="w-full h-48 object-cover rounded-t-lg"
                                        />
                                        <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Heart className="w-4 h-4" />
                                        </button>
                                        {listing.avgRating > 0 && (
                                            <div className="absolute bottom-2 left-2 bg-white rounded-full px-2 py-1 shadow-md">
                                                <div className="flex items-center space-x-1">
                                                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                                    <span className="text-xs font-medium">
                                                        {listing.avgRating.toFixed(
                                                            1
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg line-clamp-1">
                                            {listing.title}
                                        </CardTitle>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <MapPin className="w-3 h-3 mr-1" />
                                            {listing.location}
                                        </div>
                                    </CardHeader>

                                    <CardContent>
                                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                            {listing.description}
                                        </p>

                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="text-2xl font-bold text-green-600">
                                                    ${listing.price}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    /day
                                                </span>
                                            </div>

                                            <div className="flex items-center space-x-1">
                                                {renderStars(listing.avgRating)}
                                                <span className="text-xs text-gray-500">
                                                    (
                                                    {listing._count?.reviews ||
                                                        0}
                                                    )
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex items-center space-x-2">
                                            <img
                                                src={
                                                    listing.owner.avatar ||
                                                    "/placeholder-avatar.jpg"
                                                }
                                                alt={listing.owner.firstName}
                                                className="w-6 h-6 rounded-full"
                                            />
                                            <span className="text-sm text-gray-600">
                                                {listing.owner.firstName}{" "}
                                                {listing.owner.lastName}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination */}
                    {listingsData?.pagination &&
                        listingsData.pagination.pages > 1 && (
                            <div className="flex justify-center mt-8 space-x-2">
                                <Button
                                    variant="outline"
                                    disabled={page === 1}
                                    onClick={() => setPage(page - 1)}
                                >
                                    Previous
                                </Button>

                                {Array.from(
                                    { length: listingsData.pagination.pages },
                                    (_, i) => i + 1
                                )
                                    .filter(
                                        (pageNum) =>
                                            pageNum === 1 ||
                                            pageNum ===
                                                listingsData.pagination.pages ||
                                            Math.abs(pageNum - page) <= 2
                                    )
                                    .map((pageNum) => (
                                        <Button
                                            key={pageNum}
                                            variant={
                                                page === pageNum
                                                    ? "default"
                                                    : "outline"
                                            }
                                            onClick={() => setPage(pageNum)}
                                        >
                                            {pageNum}
                                        </Button>
                                    ))}

                                <Button
                                    variant="outline"
                                    disabled={
                                        page === listingsData.pagination.pages
                                    }
                                    onClick={() => setPage(page + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                </>
            )}
        </div>
    );
};

export default Listings;
