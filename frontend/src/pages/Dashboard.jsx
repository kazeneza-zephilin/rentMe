import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { api, createAuthenticatedRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
    Loader2,
    Edit3,
    Trash2,
    DollarSign,
    Package,
    Calendar,
    TrendingUp,
    Eye,
    Star,
    Users,
    Plus,
    AlertTriangle,
    X,
} from "lucide-react";
import toast from "react-hot-toast";

const Dashboard = () => {
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [deletingIds, setDeletingIds] = useState(new Set());
    const [deleteConfirmation, setDeleteConfirmation] = useState({
        isOpen: false,
        listingId: null,
        listingTitle: "",
    });
    const [dashboardData, setDashboardData] = useState({
        myListings: 0,
        activeBookings: 0,
        totalEarnings: 0,
        recentListings: [],
        analytics: {
            totalViews: 0,
            averagePrice: 0,
            mostPopularCategory: "N/A",
            listingsThisMonth: 0,
            categoryBreakdown: {},
            priceRange: { min: 0, max: 0 },
        },
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const authConfig = await createAuthenticatedRequest(getToken);

            // Fetch user's listings
            const listingsResponse = await api.get(
                "/listings/user/me",
                authConfig
            );

            const listings = listingsResponse.data.listings || [];

            // Fetch user's bookings (placeholder for now)
            // const bookingsResponse = await api.get("/bookings", authConfig);
            // const bookings = bookingsResponse.data.bookings || [];

            // Calculate advanced metrics
            const myListings = listings.length;
            const activeBookings = 0; // Will be updated when booking system is implemented
            const totalEarnings = 0; // Will be calculated from completed bookings

            // Calculate analytics
            const totalViews = listings.reduce(
                (sum, listing) => sum + (listing.views || 0),
                0
            );
            const averagePrice =
                listings.length > 0
                    ? listings.reduce(
                          (sum, listing) => sum + listing.price,
                          0
                      ) / listings.length
                    : 0;

            // Category breakdown
            const categoryBreakdown = listings.reduce((acc, listing) => {
                acc[listing.category] = (acc[listing.category] || 0) + 1;
                return acc;
            }, {});

            const mostPopularCategory =
                Object.keys(categoryBreakdown).length > 0
                    ? Object.keys(categoryBreakdown).reduce((a, b) =>
                          categoryBreakdown[a] > categoryBreakdown[b] ? a : b
                      )
                    : "N/A";

            // Listings this month
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const listingsThisMonth = listings.filter((listing) => {
                const listingDate = new Date(listing.createdAt);
                return (
                    listingDate.getMonth() === currentMonth &&
                    listingDate.getFullYear() === currentYear
                );
            }).length;

            // Price range
            const prices = listings.map((l) => l.price).filter((p) => p > 0);
            const priceRange =
                prices.length > 0
                    ? { min: Math.min(...prices), max: Math.max(...prices) }
                    : { min: 0, max: 0 };

            // Get recent listings (last 5)
            const recentListings = listings.slice(0, 5);

            setDashboardData({
                myListings,
                activeBookings,
                totalEarnings,
                recentListings,
                analytics: {
                    totalViews,
                    averagePrice,
                    mostPopularCategory,
                    listingsThisMonth,
                    categoryBreakdown,
                    priceRange,
                },
            });
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            toast.error(
                `Failed to load dashboard data: ${
                    error.response?.data?.error || error.message
                }`
            );
        } finally {
            setLoading(false);
        }
    };

    const handleEditListing = (listingId) => {
        navigate(`/edit-listing/${listingId}`);
    };

    const openDeleteConfirmation = (listingId, listingTitle) => {
        setDeleteConfirmation({
            isOpen: true,
            listingId,
            listingTitle,
        });
    };

    const closeDeleteConfirmation = () => {
        setDeleteConfirmation({
            isOpen: false,
            listingId: null,
            listingTitle: "",
        });
    };

    const handleDeleteListing = async () => {
        const { listingId } = deleteConfirmation;
        if (!listingId) return;

        try {
            setDeletingIds((prev) => new Set(prev).add(listingId));
            const authConfig = await createAuthenticatedRequest(getToken);

            await api.delete(`/listings/${listingId}`, authConfig);
            toast.success("Listing deleted successfully");

            // Refresh dashboard data
            fetchDashboardData();
            closeDeleteConfirmation();
        } catch (error) {
            console.error("Error deleting listing:", error);
            toast.error("Failed to delete listing");
        } finally {
            setDeletingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(listingId);
                return newSet;
            });
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading dashboard...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-gray-600 mt-2">
                        Manage your listings and track performance
                    </p>
                </div>
                <Button
                    onClick={() => navigate("/create-listing")}
                    className="flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add New Listing
                </Button>
            </div>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">
                                My Listings
                            </h3>
                            <p className="text-2xl font-bold text-blue-600">
                                {dashboardData.myListings}
                            </p>
                        </div>
                        <Package className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">
                                Active Bookings
                            </h3>
                            <p className="text-2xl font-bold text-green-600">
                                {dashboardData.activeBookings}
                            </p>
                        </div>
                        <Calendar className="w-8 h-8 text-green-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">
                                Total Earnings
                            </h3>
                            <p className="text-2xl font-bold text-purple-600">
                                ${dashboardData.totalEarnings}
                            </p>
                        </div>
                        <DollarSign className="w-8 h-8 text-purple-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">
                                Avg. Price
                            </h3>
                            <p className="text-2xl font-bold text-orange-600">
                                $
                                {dashboardData.analytics.averagePrice.toFixed(
                                    0
                                )}
                            </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-orange-500" />
                    </div>
                </div>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        Quick Stats
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">This Month</span>
                            <span className="font-semibold">
                                {dashboardData.analytics.listingsThisMonth}{" "}
                                listings
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">
                                Popular Category
                            </span>
                            <span className="font-semibold">
                                {dashboardData.analytics.mostPopularCategory}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Price Range</span>
                            <span className="font-semibold">
                                ${dashboardData.analytics.priceRange.min} - $
                                {dashboardData.analytics.priceRange.max}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        Categories
                    </h3>
                    <div className="space-y-2">
                        {Object.entries(
                            dashboardData.analytics.categoryBreakdown
                        )
                            .slice(0, 5)
                            .map(([category, count]) => (
                                <div
                                    key={category}
                                    className="flex justify-between items-center"
                                >
                                    <span className="text-gray-600">
                                        {category}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full"
                                                style={{
                                                    width: `${
                                                        (count /
                                                            dashboardData.myListings) *
                                                        100
                                                    }%`,
                                                }}
                                            ></div>
                                        </div>
                                        <span className="font-semibold text-sm">
                                            {count}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        {Object.keys(dashboardData.analytics.categoryBreakdown)
                            .length === 0 && (
                            <p className="text-gray-500 text-sm">
                                No categories yet
                            </p>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-green-500" />
                        Performance
                    </h3>
                    <div className="space-y-3">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">
                                {dashboardData.analytics.totalViews}
                            </p>
                            <p className="text-gray-600 text-sm">Total Views</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-semibold text-blue-600">
                                {dashboardData.myListings > 0
                                    ? (
                                          dashboardData.analytics.totalViews /
                                          dashboardData.myListings
                                      ).toFixed(1)
                                    : 0}
                            </p>
                            <p className="text-gray-600 text-sm">
                                Avg. Views per Listing
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Listings */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Recent Listings</h2>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/listings")}
                    >
                        View All
                    </Button>
                </div>
                <div className="p-6">
                    {dashboardData.recentListings.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg mb-2">
                                No listings yet
                            </p>
                            <p className="text-gray-400 text-sm mb-4">
                                Start by creating your first listing
                            </p>
                            <Button onClick={() => navigate("/create-listing")}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Your First Listing
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {dashboardData.recentListings.map((listing) => (
                                <div
                                    key={listing.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        {listing.images &&
                                            listing.images.length > 0 && (
                                                <img
                                                    src={listing.images[0]}
                                                    alt={listing.title}
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                />
                                            )}
                                        <div>
                                            <h3 className="font-medium text-lg">
                                                {listing.title}
                                            </h3>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <span>
                                                    ${listing.price}/day
                                                </span>
                                                <span>•</span>
                                                <span>{listing.category}</span>
                                                <span>•</span>
                                                <span>{listing.location}</span>
                                            </div>
                                            <div className="flex items-center mt-1 text-xs text-gray-400">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                Created{" "}
                                                {new Date(
                                                    listing.createdAt
                                                ).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handleEditListing(listing.id)
                                            }
                                            className="flex items-center gap-2"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                openDeleteConfirmation(
                                                    listing.id,
                                                    listing.title
                                                )
                                            }
                                            disabled={deletingIds.has(
                                                listing.id
                                            )}
                                            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            {deletingIds.has(listing.id) ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirmation.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                        <AlertTriangle className="w-5 h-5 text-red-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Delete Listing
                                    </h3>
                                </div>
                                <button
                                    onClick={closeDeleteConfirmation}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="mb-6">
                                <p className="text-gray-600 mb-2">
                                    Are you sure you want to delete this
                                    listing?
                                </p>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="font-medium text-gray-900">
                                        "{deleteConfirmation.listingTitle}"
                                    </p>
                                </div>
                                <p className="text-sm text-red-600 mt-3">
                                    <strong>Warning:</strong> This action cannot
                                    be undone. The listing will be permanently
                                    removed.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={closeDeleteConfirmation}
                                    className="flex-1"
                                    disabled={deletingIds.has(
                                        deleteConfirmation.listingId
                                    )}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleDeleteListing}
                                    disabled={deletingIds.has(
                                        deleteConfirmation.listingId
                                    )}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                >
                                    {deletingIds.has(
                                        deleteConfirmation.listingId
                                    ) ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete Listing
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
