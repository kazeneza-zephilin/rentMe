import { useUser } from "@clerk/clerk-react";

const Profile = () => {
    const { user } = useUser();

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Profile</h1>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-4 mb-6">
                    <img
                        src={user?.imageUrl || "/placeholder-avatar.jpg"}
                        alt={user?.fullName}
                        className="w-20 h-20 rounded-full"
                    />
                    <div>
                        <h2 className="text-2xl font-semibold">
                            {user?.fullName}
                        </h2>
                        <p className="text-gray-600">
                            {user?.primaryEmailAddress?.emailAddress}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-lg font-medium mb-2">
                            Account Information
                        </h3>
                        <p className="text-gray-600">
                            Member since:{" "}
                            {new Date(user?.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
