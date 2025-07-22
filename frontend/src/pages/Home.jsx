import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { SignUpButton, useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { animations } from "@/lib/animations";
import {
    Search,
    Plus,
    Shield,
    Star,
    ArrowRight,
    Camera,
    Gamepad2,
    Car,
    Home as HomeIcon,
} from "lucide-react";

const Home = () => {
    const { isSignedIn } = useUser();
    const heroRef = useRef(null);
    const featuresRef = useRef(null);
    const categoriesRef = useRef(null);

    useEffect(() => {
        if (heroRef.current) {
            animations.heroAnimation(heroRef.current);
        }

        // Animate features on scroll
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        if (entry.target === featuresRef.current) {
                            animations.staggerFadeIn(
                                entry.target.querySelectorAll(".feature-card"),
                                0.2
                            );
                        }
                        if (entry.target === categoriesRef.current) {
                            animations.staggerFadeIn(
                                entry.target.querySelectorAll(".category-card"),
                                0.15
                            );
                        }
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );

        if (featuresRef.current) observer.observe(featuresRef.current);
        if (categoriesRef.current) observer.observe(categoriesRef.current);

        return () => observer.disconnect();
    }, []);

    const features = [
        {
            icon: Shield,
            title: "Secure & Safe",
            description:
                "Every transaction is protected with secure payment processing and user verification.",
        },
        {
            icon: Search,
            title: "Easy Discovery",
            description:
                "Find exactly what you need with our powerful search and filtering system.",
        },
        {
            icon: Star,
            title: "Trusted Reviews",
            description:
                "Make informed decisions with honest reviews from verified users.",
        },
    ];

    const categories = [
        {
            icon: Camera,
            title: "Electronics",
            description: "Cameras, laptops, phones, and more",
            count: "500+ items",
        },
        {
            icon: Gamepad2,
            title: "Gaming",
            description: "Consoles, games, and accessories",
            count: "200+ items",
        },
        {
            icon: Car,
            title: "Vehicles",
            description: "Cars, bikes, and transportation",
            count: "150+ items",
        },
        {
            icon: HomeIcon,
            title: "Home & Garden",
            description: "Tools, furniture, and appliances",
            count: "300+ items",
        },
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section
                ref={heroRef}
                className="hero-gradient text-white py-20 px-4"
            >
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6">
                        Rent Anything,
                        <br />
                        <span className="text-yellow-300">Anytime</span>
                    </h1>
                    <p className="hero-subtitle text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100">
                        Discover thousands of items available for rent in your
                        area. From electronics to sports equipment, find what
                        you need or earn money by listing your items.
                    </p>
                    <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/listings">
                            <Button
                                size="lg"
                                className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-3"
                            >
                                <Search className="w-5 h-5 mr-2" />
                                Browse Listings
                            </Button>
                        </Link>
                        {isSignedIn ? (
                            <Link to="/create-listing">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-3"
                                >
                                    <Plus className="w-5 h-5 mr-2" />
                                    List an Item
                                </Button>
                            </Link>
                        ) : (
                            <SignUpButton mode="modal">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-3"
                                >
                                    <Plus className="w-5 h-5 mr-2" />
                                    Get Started
                                </Button>
                            </SignUpButton>
                        )}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section ref={featuresRef} className="py-20 px-4 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Why Choose RentMe?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            We make renting safe, simple, and rewarding for
                            everyone
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <Card
                                key={index}
                                className="feature-card text-center hover:shadow-lg transition-shadow"
                            >
                                <CardHeader>
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <feature.icon className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <CardTitle className="text-xl">
                                        {feature.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-base">
                                        {feature.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section ref={categoriesRef} className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Popular Categories
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Explore items across different categories
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categories.map((category, index) => (
                            <Link
                                key={index}
                                to={`/listings?category=${category.title}`}
                            >
                                <Card className="category-card hover:shadow-lg transition-all duration-300 cursor-pointer group">
                                    <CardHeader className="text-center">
                                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 transition-colors">
                                            <category.icon className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <CardTitle className="text-lg">
                                            {category.title}
                                        </CardTitle>
                                        <CardDescription>
                                            {category.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="text-center">
                                        <span className="text-sm text-gray-500">
                                            {category.count}
                                        </span>
                                        <ArrowRight className="w-4 h-4 inline-block ml-2 group-hover:translate-x-1 transition-transform" />
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-blue-600 text-white py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready to Start Renting?
                    </h2>
                    <p className="text-xl mb-8 text-blue-100">
                        Join thousands of users who are already earning and
                        saving with RentMe
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/listings">
                            <Button
                                size="lg"
                                className="bg-white text-blue-600 hover:bg-blue-50"
                            >
                                Start Browsing
                            </Button>
                        </Link>
                        {!isSignedIn && (
                            <SignUpButton mode="modal">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-white text-white hover:bg-white hover:text-blue-600"
                                >
                                    Create Account
                                </Button>
                            </SignUpButton>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
