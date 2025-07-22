const Dashboard = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900">
                        My Listings
                    </h3>
                    <p className="text-3xl font-bold text-blue-600">0</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900">
                        Active Bookings
                    </h3>
                    <p className="text-3xl font-bold text-green-600">0</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900">
                        Total Earnings
                    </h3>
                    <p className="text-3xl font-bold text-purple-600">$0</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                    <h2 className="text-xl font-semibold">Recent Activity</h2>
                </div>
                <div className="p-6">
                    <p className="text-gray-500">No recent activity</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
