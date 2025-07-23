import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    MapPin,
    DollarSign,
    Edit,
    Trash2,
    Eye,
    Calendar,
    User,
} from "lucide-react";

const ListingCard = ({
    listing,
    onDelete,
    onEdit,
    showOwnerActions = false,
    className = "",
}) => {
    const navigate = useNavigate();
    const { user } = useUser();

    const isOwner = user && listing.owner && user.id === listing.ownerId;
    const showActions = showOwnerActions && isOwner;

    const handleView = () => {
        navigate(`/listings/${listing.id}`);
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        if (onEdit) {
            onEdit(listing);
        } else {
            navigate(`/listings/${listing.id}/edit`);
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this listing?")) {
            onDelete(listing.id);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <Card
            className={`group hover:shadow-lg transition-all duration-300 cursor-pointer ${className}`}
        >
            <div className="relative">
                {/* Image Section */}
                <div className="aspect-[4/3] overflow-hidden rounded-t-lg bg-gray-100">
                    {listing.images && listing.images.length > 0 ? (
                        <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                                e.target.src =
                                    "https://via.placeholder.com/400x300?text=No+Image";
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <span className="text-gray-500">No Image</span>
                        </div>
                    )}

                    {/* Availability Badge */}
                    <div className="absolute top-3 left-3">
                        <Badge
                            variant={
                                listing.available ? "default" : "secondary"
                            }
                            className={
                                listing.available
                                    ? "bg-green-500"
                                    : "bg-gray-500"
                            }
                        >
                            {listing.available ? "Available" : "Unavailable"}
                        </Badge>
                    </div>

                    {/* Action Buttons */}
                    {showActions && (
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={handleEdit}
                                    className="w-8 h-8 p-0"
                                >
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={handleDelete}
                                    className="w-8 h-8 p-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <CardContent className="p-4" onClick={handleView}>
                    {/* Title and Category */}
                    <div className="mb-2">
                        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
                            {listing.title}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                            {listing.category}
                        </Badge>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {listing.description}
                    </p>

                    {/* Location */}
                    <div className="flex items-center text-gray-500 text-sm mb-3">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="line-clamp-1">{listing.location}</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="text-lg font-bold text-green-600">
                                {formatPrice(listing.price)}
                            </span>
                            <span className="text-gray-500 text-sm ml-1">
                                /day
                            </span>
                        </div>
                    </div>

                    {/* Owner Info */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            <span>
                                {(() => {
                                    const firstName =
                                        listing.owner?.firstName || "";
                                    const lastName =
                                        listing.owner?.lastName || "";

                                    // Handle the case where both names are "User" or empty
                                    if (
                                        firstName === "User" &&
                                        lastName === "User"
                                    ) {
                                        return "Owner";
                                    }

                                    // Handle empty names
                                    if (!firstName && !lastName) {
                                        return "Anonymous Owner";
                                    }

                                    // Handle duplicate names (firstName === lastName)
                                    if (firstName === lastName && firstName) {
                                        return firstName;
                                    }

                                    // Normal case
                                    return `${firstName} ${lastName}`.trim();
                                })()}
                            </span>
                        </div>
                        <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{formatDate(listing.createdAt)}</span>
                        </div>
                    </div>

                    {/* View Button */}
                    <Button
                        className="w-full mt-4"
                        variant="outline"
                        onClick={handleView}
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                    </Button>
                </CardContent>
            </div>
        </Card>
    );
};

export default ListingCard;
