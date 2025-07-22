import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { useApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ListingDetail = () => {
    const { id } = useParams();
    const api = useApi();

    const {
        data: listing,
        isLoading,
        error,
    } = useQuery(["listing", id], async () => {
        const response = await api.get(`/listings/${id}`);
        return response.data;
    });

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center text-red-600">
                    Error loading listing: {error.message}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <img
                        src={listing?.images?.[0] || "/placeholder-image.jpg"}
                        alt={listing?.title}
                        className="w-full h-96 object-cover rounded-lg"
                    />
                </div>

                <div>
                    <h1 className="text-3xl font-bold mb-4">
                        {listing?.title}
                    </h1>
                    <p className="text-2xl font-semibold text-green-600 mb-4">
                        ${listing?.price}/day
                    </p>
                    <p className="text-gray-600 mb-6">{listing?.description}</p>

                    <Card>
                        <CardHeader>
                            <CardTitle>Book this item</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full">Contact Owner</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ListingDetail;
