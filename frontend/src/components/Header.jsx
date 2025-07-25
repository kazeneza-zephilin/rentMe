import { useState } from "react";
import { Link } from "react-router-dom";
import {
    SignInButton,
    SignUpButton,
    UserButton,
    useUser,
} from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import {
    Menu,
    X,
    Home,
    Search,
    Plus,
    User,
    Calendar,
    MessageCircle,
} from "lucide-react";
import NotificationBell from "./NotificationBell";

const Header = () => {
    const { isSignedIn } = useUser();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigation = [
        { name: "Home", href: "/", icon: Home },
        { name: "Browse Listings", href: "/listings", icon: Search },
    ];

    const userNavigation = [
        { name: "Create Listing", href: "/create-listing", icon: Plus },
        { name: "Dashboard", href: "/dashboard", icon: User },
        { name: "My Bookings", href: "/bookings", icon: Calendar },
        { name: "Chats", href: "/chats", icon: MessageCircle },
    ];

    return (
        <header className="bg-white shadow-sm border-b">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link
                            to="/"
                            className="flex-shrink-0 flex items-center"
                        >
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                RentMe
                            </span>
                        </Link>

                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                                >
                                    <item.icon className="w-4 h-4 mr-1" />
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
                        {isSignedIn ? (
                            <>
                                {userNavigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                                    >
                                        <item.icon className="w-4 h-4 mr-1" />
                                        {item.name}
                                    </Link>
                                ))}
                                <NotificationBell />
                                <UserButton afterSignOutUrl="/" />
                            </>
                        ) : (
                            <div className="flex space-x-2">
                                <SignInButton mode="modal">
                                    <Button variant="ghost">Sign In</Button>
                                </SignInButton>
                                <SignUpButton mode="modal">
                                    <Button>Sign Up</Button>
                                </SignUpButton>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="sm:hidden flex items-center">
                        <button
                            onClick={() =>
                                setIsMobileMenuOpen(!isMobileMenuOpen)
                            }
                            className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 p-2 rounded-md"
                        >
                            {isMobileMenuOpen ? (
                                <X className="block h-6 w-6" />
                            ) : (
                                <Menu className="block h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="sm:hidden">
                    <div className="pt-2 pb-3 space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <div className="flex items-center">
                                    <item.icon className="w-4 h-4 mr-2" />
                                    {item.name}
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="pt-4 pb-3 border-t border-gray-200">
                        {isSignedIn ? (
                            <div className="space-y-1">
                                {userNavigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className="text-gray-500 hover:bg-gray-50 hover:text-gray-700 block px-4 py-2 text-base font-medium"
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                    >
                                        <div className="flex items-center">
                                            <item.icon className="w-4 h-4 mr-2" />
                                            {item.name}
                                        </div>
                                    </Link>
                                ))}
                                <div className="px-4 py-2 flex items-center justify-between">
                                    <NotificationBell />
                                    <UserButton afterSignOutUrl="/" />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-1 px-4">
                                <SignInButton mode="modal">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start"
                                    >
                                        Sign In
                                    </Button>
                                </SignInButton>
                                <SignUpButton mode="modal">
                                    <Button className="w-full">Sign Up</Button>
                                </SignUpButton>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
