const Bookings = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                    <h2 className="text-xl font-semibold">Upcoming Bookings</h2>
                </div>
                <div className="p-6">
                    <p className="text-gray-500">No upcoming bookings</p>
                </div>
            </div>
        </div>
    );
};

export default Bookings;
