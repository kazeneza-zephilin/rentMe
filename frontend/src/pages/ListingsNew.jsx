import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ListingCard from "@/components/ListingCard";
import { api } from "@/lib/api";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";

const CATEGORIES = [
    "All",
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

const Listings = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        pages: 1,
    });

    const [filters, setFilters] = useState({
        search: searchParams.get("search") || "",
        category: searchParams.get("category") || "All",
        available: searchParams.get("available") !== "false",
    });

    const [searchInput, setSearchInput] = useState(filters.search);

    useEffect(() => {
        fetchListings();
    }, [pagination.page, filters]);

    const fetchListings = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                available: filters.available.toString(),
            });

            if (filters.search) {
                params.append("search", filters.search);
            }

            if (filters.category && filters.category !== "All") {
                params.append("category", filters.category);
            }

            const response = await api.get(`/listings?${params.toString()}`);
            setListings(response.data.listings);
            setPagination((prev) => ({
                ...prev,
                ...response.data.pagination,
            }));

            // Update URL parameters
            const newSearchParams = new URLSearchParams();
            if (filters.search) newSearchParams.set("search", filters.search);
            if (filters.category !== "All")
                newSearchParams.set("category", filters.category);
            if (!filters.available) newSearchParams.set("available", "false");
            setSearchParams(newSearchParams);
        } catch (error) {
            console.error("Error fetching listings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setFilters((prev) => ({ ...prev, search: searchInput }));
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handleCategoryChange = (category) => {
        setFilters((prev) => ({ ...prev, category }));
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handleAvailabilityToggle = () => {
        setFilters((prev) => ({ ...prev, available: !prev.available }));
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        setPagination((prev) => ({ ...prev, page: newPage }));
        window.scrollTo(0, 0);
    };

    const clearFilters = () => {
        setFilters({ search: "", category: "All", available: true });
        setSearchInput("");
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Browse Listings
                </h1>
                <p className="text-gray-600">Find the perfect item to rent</p>
            </div>

            {/* Filters */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Filter className="w-5 h-5 mr-2" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Search */}
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    placeholder="Search listings..."
                                    value={searchInput}
                                    onChange={(e) =>
                                        setSearchInput(e.target.value)
                                    }
                                    className="w-full"
                                />
                            </div>
                            <Button type="submit">
                                <Search className="w-4 h-4 mr-2" />
                                Search
                            </Button>
                        </form>

                        {/* Categories */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Category
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map((category) => (
                                    <Button
                                        key={category}
                                        variant={
                                            filters.category === category
                                                ? "default"
                                                : "outline"
                                        }
                                        size="sm"
                                        onClick={() =>
                                            handleCategoryChange(category)
                                        }
                                    >
                                        {category}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Availability */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="available"
                                    checked={filters.available}
                                    onChange={handleAvailabilityToggle}
                                    className="rounded"
                                />
                                <label
                                    htmlFor="available"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Available items only
                                </label>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                            >
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results Summary */}
            <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600">
                    {loading
                        ? "Loading..."
                        : `${pagination.total} listing${
                              pagination.total !== 1 ? "s" : ""
                          } found`}
                </p>
                {pagination.pages > 1 && (
                    <p className="text-gray-600">
                        Page {pagination.page} of {pagination.pages}
                    </p>
                )}
            </div>

            {/* Listings Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-gray-200 aspect-[4/3] rounded-t-lg"></div>
                            <div className="bg-white p-4 rounded-b-lg border border-t-0">
                                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                                <div className="h-6 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : listings.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <Search className="w-12 h-12 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No listings found
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Try adjusting your search criteria or browse all
                            categories
                        </p>
                        <Button onClick={clearFilters}>Clear Filters</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {listings.map((listing) => (
                        <ListingCard
                            key={listing.id}
                            listing={listing}
                            showOwnerActions={false}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex items-center justify-center mt-12 space-x-2">
                    <Button
                        variant="outline"
                        disabled={pagination.page === 1}
                        onClick={() => handlePageChange(pagination.page - 1)}
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Previous
                    </Button>

                    <div className="flex space-x-1">
                        {[...Array(Math.min(5, pagination.pages))].map(
                            (_, i) => {
                                const pageNum = Math.max(
                                    1,
                                    Math.min(
                                        pagination.page - 2 + i,
                                        pagination.pages - 4 + i
                                    )
                                );

                                if (pageNum > pagination.pages) return null;

                                return (
                                    <Button
                                        key={pageNum}
                                        variant={
                                            pagination.page === pageNum
                                                ? "default"
                                                : "outline"
                                        }
                                        size="sm"
                                        onClick={() =>
                                            handlePageChange(pageNum)
                                        }
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            }
                        )}
                    </div>

                    <Button
                        variant="outline"
                        disabled={pagination.page === pagination.pages}
                        onClick={() => handlePageChange(pagination.page + 1)}
                    >
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Listings;
