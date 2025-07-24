import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Users,
    Package,
    DollarSign,
    Calendar,
    Search,
    Trash2,
    Eye,
    LogOut,
    Shield,
} from "lucide-react";
import { api } from "@/lib/api";

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [users, setUsers] = useState([]);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    // Create authenticated API instance for admin
    const adminApi = api.create({
        baseURL: api.defaults.baseURL,
        headers: {
            ...api.defaults.headers,
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
    });

    useEffect(() => {
        checkAdminAuth();
        if (activeTab === "overview") {
            fetchDashboardData();
        } else if (activeTab === "users") {
            fetchUsers();
        } else if (activeTab === "listings") {
            fetchListings();
        }
    }, [activeTab]);

    const checkAdminAuth = async () => {
        const token = localStorage.getItem("adminToken");
        if (!token) {
            navigate("/admin");
            return;
        }

        try {
            await adminApi.get("/admin/verify");
        } catch (error) {
            console.error("Admin auth check failed:", error);
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminData");
            navigate("/admin");
        }
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await adminApi.get("/admin/dashboard");
            setDashboardData(response.data);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await adminApi.get(
                `/admin/users?search=${searchTerm}`
            );
            setUsers(response.data.users);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchListings = async () => {
        try {
            setLoading(true);
            const response = await adminApi.get(
                `/admin/listings?search=${searchTerm}`
            );
            setListings(response.data.listings);
        } catch (error) {
            console.error("Error fetching listings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (
            !confirm(
                "Are you sure you want to delete this user? This will also delete all their listings."
            )
        ) {
            return;
        }

        try {
            await adminApi.delete(`/admin/users/${userId}`);
            fetchUsers(); // Refresh the list
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user");
        }
    };

    const handleDeleteListing = async (listingId) => {
        if (!confirm("Are you sure you want to delete this listing?")) {
            return;
        }

        try {
            await adminApi.delete(`/admin/listings/${listingId}`);
            fetchListings(); // Refresh the list
        } catch (error) {
            console.error("Error deleting listing:", error);
            alert("Failed to delete listing");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminData");
        navigate("/admin");
    };

    const StatCard = ({
        icon: Icon,
        title,
        value,
        color = "bg-indigo-500",
    }) => (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center">
                    <div
                        className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}
                    >
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                            {title}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                            {value}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    if (loading && !dashboardData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                        Loading admin dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <Shield className="w-8 h-8 text-indigo-600 mr-3" />
                            <h1 className="text-3xl font-bold text-gray-900">
                                Admin Dashboard
                            </h1>
                        </div>
                        <Button onClick={handleLogout} variant="outline">
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8">
                        {[
                            { id: "overview", label: "Overview" },
                            { id: "users", label: "Users" },
                            { id: "listings", label: "Listings" },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? "border-indigo-500 text-indigo-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {activeTab === "overview" && dashboardData && (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                icon={Users}
                                title="Total Users"
                                value={dashboardData.stats.totalUsers}
                                color="bg-blue-500"
                            />
                            <StatCard
                                icon={Package}
                                title="Total Listings"
                                value={dashboardData.stats.totalListings}
                                color="bg-green-500"
                            />
                            <StatCard
                                icon={Calendar}
                                title="Total Bookings"
                                value={dashboardData.stats.totalBookings}
                                color="bg-purple-500"
                            />
                            <StatCard
                                icon={DollarSign}
                                title="Total Revenue"
                                value={`$${
                                    dashboardData.stats.totalRevenue?.toFixed(
                                        2
                                    ) || "0.00"
                                }`}
                                color="bg-yellow-500"
                            />
                        </div>

                        {/* Recent Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Users */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Users</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {dashboardData.recentUsers.map(
                                            (user) => (
                                                <div
                                                    key={user.id}
                                                    className="flex items-center justify-between"
                                                >
                                                    <div>
                                                        <p className="font-medium">
                                                            {user.firstName}{" "}
                                                            {user.lastName}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(
                                                            user.createdAt
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Listings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Listings</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {dashboardData.recentListings.map(
                                            (listing) => (
                                                <div
                                                    key={listing.id}
                                                    className="flex items-center justify-between"
                                                >
                                                    <div>
                                                        <p className="font-medium">
                                                            {listing.title}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            by{" "}
                                                            {
                                                                listing.owner
                                                                    .firstName
                                                            }{" "}
                                                            {
                                                                listing.owner
                                                                    .lastName
                                                            }
                                                        </p>
                                                    </div>
                                                    <p className="text-sm font-medium text-green-600">
                                                        ${listing.price}/day
                                                    </p>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === "users" && (
                    <div className="space-y-6">
                        {/* Search */}
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Users Management
                            </h2>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Users Table */}
                        <Card>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    User
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Email
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Listings
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Joined
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {users.map((user) => (
                                                <tr key={user.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {user.firstName}{" "}
                                                            {user.lastName}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500">
                                                            {user.email}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {user._count
                                                                ?.listings || 0}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500">
                                                            {new Date(
                                                                user.createdAt
                                                            ).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    window.open(
                                                                        `/profile/${user.id}`,
                                                                        "_blank"
                                                                    )
                                                                }
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    handleDeleteUser(
                                                                        user.id
                                                                    )
                                                                }
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === "listings" && (
                    <div className="space-y-6">
                        {/* Search */}
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Listings Management
                            </h2>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search listings..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Listings Table */}
                        <Card>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Listing
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Owner
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Category
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Price
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {listings.map((listing) => (
                                                <tr key={listing.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {listing.title}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500">
                                                            {
                                                                listing.owner
                                                                    .firstName
                                                            }{" "}
                                                            {
                                                                listing.owner
                                                                    .lastName
                                                            }
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {listing.category}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            ${listing.price}/day
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    window.open(
                                                                        `/listings/${listing.id}`,
                                                                        "_blank"
                                                                    )
                                                                }
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    handleDeleteListing(
                                                                        listing.id
                                                                    )
                                                                }
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
