import { Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Listings from "./pages/Listings";
import ListingDetail from "./pages/ListingDetail";
import CreateListing from "./pages/CreateListing";
import EditListing from "./pages/EditListing";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/Bookings";
import AdminRoutes from "./pages/AdminRoutes";

function App() {
    return (
        <Routes>
            {/* Admin routes - separate from main layout */}
            <Route path="/admin/*" element={<AdminRoutes />} />

            {/* Main app routes with layout */}
            <Route
                path="*"
                element={
                    <Layout>
                        <Routes>
                            {/* Public routes */}
                            <Route path="/" element={<Home />} />
                            <Route path="/listings" element={<Listings />} />
                            <Route
                                path="/listings/:id"
                                element={<ListingDetail />}
                            />

                            {/* Protected routes */}
                            <Route
                                path="/create-listing"
                                element={
                                    <SignedIn>
                                        <CreateListing />
                                    </SignedIn>
                                }
                            />
                            <Route
                                path="/edit-listing/:id"
                                element={
                                    <SignedIn>
                                        <EditListing />
                                    </SignedIn>
                                }
                            />
                            <Route
                                path="/profile"
                                element={
                                    <SignedIn>
                                        <Profile />
                                    </SignedIn>
                                }
                            />
                            <Route
                                path="/dashboard"
                                element={
                                    <SignedIn>
                                        <Dashboard />
                                    </SignedIn>
                                }
                            />
                            <Route
                                path="/bookings"
                                element={
                                    <SignedIn>
                                        <Bookings />
                                    </SignedIn>
                                }
                            />

                            {/* Catch all route for unauthenticated users trying to access protected routes */}
                            <Route
                                path="/protected/*"
                                element={
                                    <SignedOut>
                                        <RedirectToSignIn />
                                    </SignedOut>
                                }
                            />
                        </Routes>
                    </Layout>
                }
            />
        </Routes>
    );
}

export default App;
