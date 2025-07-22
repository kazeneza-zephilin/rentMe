import { Link } from "react-router-dom";
import {
    Facebook,
    Twitter,
    Instagram,
    Mail,
    Phone,
    MapPin,
} from "lucide-react";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <Link to="/" className="flex items-center mb-4">
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                RentMe
                            </span>
                        </Link>
                        <p className="text-gray-300 mb-4 max-w-md">
                            RentMe is the platform where you can rent anything
                            from electronics to sports equipment. Find what you
                            need or list items to earn money.
                        </p>
                        <div className="flex space-x-4">
                            <a
                                href="#"
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">
                            Quick Links
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/listings"
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    Browse Listings
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/create-listing"
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    List an Item
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/dashboard"
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/bookings"
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    My Bookings
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact</h3>
                        <ul className="space-y-2">
                            <li className="flex items-center text-gray-300">
                                <Mail className="w-4 h-4 mr-2" />
                                support@rentme.com
                            </li>
                            <li className="flex items-center text-gray-300">
                                <Phone className="w-4 h-4 mr-2" />
                                +1 (555) 123-4567
                            </li>
                            <li className="flex items-center text-gray-300">
                                <MapPin className="w-4 h-4 mr-2" />
                                San Francisco, CA
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-400 text-sm">
                        © {currentYear} RentMe. All rights reserved.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link
                            to="/privacy"
                            className="text-gray-400 hover:text-white text-sm transition-colors"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            to="/terms"
                            className="text-gray-400 hover:text-white text-sm transition-colors"
                        >
                            Terms of Service
                        </Link>
                        <Link
                            to="/help"
                            className="text-gray-400 hover:text-white text-sm transition-colors"
                        >
                            Help Center
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
