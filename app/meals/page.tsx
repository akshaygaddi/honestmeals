'use client'
// pages/meals.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Phone,
    Mail,
    MessageSquare,
    Clock,
    Calendar,
    Download,
    ChevronDown,
    Check,
    Sun,
    Moon,
    Menu,
    X,
    ArrowRight,
    Instagram,
    FileText,
    UtensilsCrossed,
    Heart,
    Scale,
    Timer
} from 'lucide-react';

// Import your UI components
import { Button } from '@/components/ui/button';
import backgroundVeg from "@/assets/images/homepage/bg-veg.jpg"
import backgroundNonVeg from "@/assets/images/homepage/bg-non-veg.jpg"
import backgroundHealthyDrinks from "@/app/bg-healthyDrinks.avif"
import backgroundCustomizedMeals from "@/app/bg-customizeMeals.jpg"
import mealsCoverPage from "@/assets/images/mealsPage/honestMealsCover.jpg.jpg"

export default function MealsPage() {
    const [isContactFormOpen, setIsContactFormOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
    });
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [expandedFaq, setExpandedFaq] = useState(null);

    // Check system preference for dark mode on initial load
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setDarkMode(isDarkMode);
        }
    }, []);

    // Apply dark mode class to body
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 }
        }
    };

    const staggerChildren = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        // In a real app, you would send this data to your backend
        console.log('Form submitted:', formData);
        setFormSubmitted(true);

        // Reset form after 3 seconds
        setTimeout(() => {
            setFormSubmitted(false);
            setIsContactFormOpen(false);
            setFormData({
                name: '',
                email: '',
                phone: '',
                message: '',
            });
        }, 3000);
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    const toggleFaq = (index) => {
        setExpandedFaq(expandedFaq === index ? null : index);
    };

    // Function to handle PDF download
    const handlePdfDownload = () => {
        window.open('https://mdbgsntbffcomdbvdqrr.supabase.co/storage/v1/object/public/meals//Honest%20Meals%20(May)%20.pdf', '_blank');
    };

    return (
        <>
            <Head>
                <title>Honest Meals - Premium Meal Plans | Air-Fried Goodness</title>
                <meta name="description" content="Explore our premium meal plans with healthy air-fried options. Download our menu and choose from 7, 15, or 30-day plans in both veg and non-veg options." />
            </Head>

            <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-green-50 via-white to-green-100 text-gray-800'}`}>
                {/* Header - Responsive with mobile menu */}
                <header className={`sticky top-0 z-50 ${darkMode ? 'bg-gray-900/95 backdrop-blur-sm border-b border-gray-800' : 'bg-white/95 backdrop-blur-sm shadow-sm'} transition-colors duration-300`}>
                    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                        <div className="flex items-center">
                            <div className={`text-2xl font-bold ${darkMode ? 'text-green-500' : 'text-green-600'}`}>Honest Meals</div>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex space-x-8">
                            <a href="/#about" className={`hover:text-green-600 transition-colors duration-200 ${darkMode ? 'text-gray-300 hover:text-green-500' : 'text-gray-600'}`}>About</a>
                            <a href="/meals" className={`border-b-2 font-medium ${darkMode ? 'text-green-500 border-green-500' : 'text-green-600 border-green-600'}`}>Meals</a>
                            <a href="/#why-us" className={`hover:text-green-600 transition-colors duration-200 ${darkMode ? 'text-gray-300 hover:text-green-500' : 'text-gray-600'}`}>Why Us</a>
                            <a href="/#testimonials" className={`hover:text-green-600 transition-colors duration-200 ${darkMode ? 'text-gray-300 hover:text-green-500' : 'text-gray-600'}`}>Reviews</a>
                        </nav>

                        <div className="flex items-center space-x-4">
                            {/* Dark Mode Toggle */}
                            <button
                                onClick={toggleDarkMode}
                                className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-700'} transition-colors duration-200`}
                                aria-label="Toggle dark mode"
                            >
                                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                            </button>

                            {/* Login Button (Desktop) */}
                            <Button
                                className={`hidden md:block transition duration-200 ${
                                    darkMode
                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                        : 'bg-green-600 hover:bg-green-700 text-white'
                                } rounded-full`}
                            >
                                Login
                            </Button>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2"
                                aria-label="Toggle menu"
                            >
                                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>

                    {/* Contact Banner */}
                    <div className={`w-full py-3 ${darkMode ? 'bg-green-900' : 'bg-green-100'}`}>
                        <div className="container mx-auto px-4">
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8">
                                <a 
                                    href="tel:+918888756746" 
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                                        darkMode 
                                            ? 'hover:bg-green-800 active:bg-green-700' 
                                            : 'hover:bg-green-200 active:bg-green-300'
                                    }`}
                                >
                                    <Phone size={18} className="text-green-600" />
                                    <span className={`${darkMode ? 'text-green-100' : 'text-green-800'} font-medium`}>+91 8888756746</span>
                                </a>
                                <a 
                                    href="https://instagram.com/honestmealsindia" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                                        darkMode 
                                            ? 'hover:bg-green-800 active:bg-green-700' 
                                            : 'hover:bg-green-200 active:bg-green-300'
                                    }`}
                                >
                                    <Instagram size={18} className="text-green-600" />
                                    <span className={`${darkMode ? 'text-green-100' : 'text-green-800'} font-medium`}>@honestmealsindia</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    <AnimatePresence>
                        {mobileMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className={`md:hidden overflow-hidden ${darkMode ? 'bg-gray-900 border-t border-gray-800' : 'bg-white border-t border-gray-100'}`}
                            >
                                <nav className="flex flex-col space-y-4 p-6">
                                    <a href="/#about" className={`hover:text-green-600 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>About</a>
                                    <a href="/meals" className={`font-medium ${darkMode ? 'text-green-500' : 'text-green-600'}`}>Meals</a>
                                    <a href="/#why-us" className={`hover:text-green-600 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Why Us</a>
                                    <a href="/#testimonials" className={`hover:text-green-600 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Reviews</a>
                                    <Button className={`${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600 hover:bg-green-700'} text-white`}>
                                        Login
                                    </Button>
                                </nav>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </header>

                <main>
                    {/* Hero Section with PDF Focus */}
                    <section className={`py-16 ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-green-50 to-green-100'}`}>
                        <div className="container mx-auto px-4">
                            <div className="flex flex-col lg:flex-row items-center gap-10">
                                <div className="w-full lg:w-1/2 text-center lg:text-left">
                                    <motion.div
                                        initial="hidden"
                                        animate="visible"
                                        variants={fadeIn}
                                    >
                                        <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                            Premium <span className={`${darkMode ? 'text-green-500' : 'text-green-600'}`}>Air-Fried</span> Meal Plans
                                        </h1>
                                        <p className={`text-xl mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                            Delicious, healthy, and convenient meal plans delivered right to your door. Choose from 7, 15, or 30-day plans in both veg and non-veg options.
                                        </p>
                                        <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                                            <Button 
                                                onClick={handlePdfDownload}
                                                className={`flex items-center gap-2 px-8 py-4 rounded-full text-lg ${
                                                    darkMode 
                                                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                                                        : 'bg-green-600 hover:bg-green-700 text-white'
                                                } transition-all duration-300 shadow-md hover:shadow-lg`}
                                            >
                                                <FileText size={20} />
                                                <span className="font-medium">View Full Menu</span>
                                            </Button>
                                            <a 
                                                href="tel:+917972279059"
                                                className={`flex items-center justify-center gap-2 px-8 py-4 rounded-full text-lg ${
                                                    darkMode 
                                                        ? 'bg-transparent border-2 border-green-600 text-green-500 hover:bg-green-900/30' 
                                                        : 'bg-transparent border-2 border-green-600 text-green-600 hover:bg-green-50'
                                                } transition-all duration-300`}
                                            >
                                                <Phone size={20} />
                                                <span className="font-medium">Order Now</span>
                                            </a>
                                        </div>
                                    </motion.div>
                                </div>
                                
                                {/* PDF Preview Card */}
                                <motion.div 
                                    className="w-full lg:w-1/2"
                                    initial="hidden"
                                    animate="visible"
                                    variants={fadeIn}
                                >
                                    <div className={`relative overflow-hidden rounded-2xl shadow-2xl ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                                        <div className="p-6">
                                            <div className={`text-center p-8 rounded-xl mb-6 ${darkMode ? 'bg-gray-800' : 'bg-green-50'}`}>
                                                <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Fit N Fab Meal Plan</h2>
                                                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>WEEKLY | 15 DAYS | MONTHLY</p>
                                            </div>
                                            
                                            <div className="space-y-6">
                                                <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-green-50'}`}>
                                                    <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-green-500' : 'text-green-700'}`}>CHICKEN DISH (DEFICIT/SURPLUS)</h3>
                                                    <div className="grid grid-cols-3 gap-4 text-center">
                                                        <div>
                                                            <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>15 MEALS</p>
                                                            <p className={`${darkMode ? 'text-green-500' : 'text-green-600'}`}>₹1,785/-</p>
                                                        </div>
                                                        <div>
                                                            <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>15 DAYS</p>
                                                            <p className={`${darkMode ? 'text-green-500' : 'text-green-600'}`}>₹3,255/-</p>
                                                        </div>
                                                        <div>
                                                            <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>MONTHLY</p>
                                                            <p className={`${darkMode ? 'text-green-500' : 'text-green-600'}`}>₹6,450/-</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-green-50'}`}>
                                                    <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-green-500' : 'text-green-700'}`}>PANEER DISH (AMUL)</h3>
                                                    <div className="grid grid-cols-3 gap-4 text-center">
                                                        <div>
                                                            <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>15 MEALS</p>
                                                            <p className={`${darkMode ? 'text-green-500' : 'text-green-600'}`}>₹2,729/-</p>
                                                        </div>
                                                        <div>
                                                            <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>15 DAYS</p>
                                                            <p className={`${darkMode ? 'text-green-500' : 'text-green-600'}`}>₹2,765/-</p>
                                                        </div>
                                                        <div>
                                                            <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>MONTHLY</p>
                                                            <p className={`${darkMode ? 'text-green-500' : 'text-green-600'}`}>₹6,529/-</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-8 text-center">
                                                <p className={`mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Customized meal available</p>
                                                <Button 
                                                    onClick={handlePdfDownload}
                                                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl ${
                                                        darkMode 
                                                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                                                            : 'bg-green-600 hover:bg-green-700 text-white'
                                                    } transition-all duration-300`}
                                                >
                                                    <FileText size={18} />
                                                    <span className="font-medium">View Complete Menu</span>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </section>
                    
                    {/* Benefits Section */}
                    <section className={`py-16 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                        <div className="container mx-auto px-4">
                            <motion.div
                                className="text-center mb-12"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeIn}
                            >
                                <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                    Why Choose Our <span className={`${darkMode ? 'text-green-500' : 'text-green-600'}`}>Air-Fried</span> Meals?
                                </h2>
                                <p className={`text-xl max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Our meals are prepared with care, using premium ingredients and air-fried for a healthier lifestyle.
                                </p>
                            </motion.div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {[
                                    {
                                        icon: <Heart className={`h-10 w-10 ${darkMode ? 'text-green-500' : 'text-green-600'}`} />,
                                        title: "Healthier Cooking",
                                        description: "Air-fried meals contain up to 80% less oil than traditional fried foods, reducing calories while maintaining taste."
                                    },
                                    {
                                        icon: <UtensilsCrossed className={`h-10 w-10 ${darkMode ? 'text-green-500' : 'text-green-600'}`} />,
                                        title: "Premium Ingredients",
                                        description: "We use only high-quality, fresh ingredients sourced from trusted suppliers for the best nutrition."
                                    },
                                    {
                                        icon: <Scale className={`h-10 w-10 ${darkMode ? 'text-green-500' : 'text-green-600'}`} />,
                                        title: "Balanced Nutrition",
                                        description: "Each meal is carefully balanced with the right amounts of protein, carbs, and healthy fats."
                                    },
                                    {
                                        icon: <Timer className={`h-10 w-10 ${darkMode ? 'text-green-500' : 'text-green-600'}`} />,
                                        title: "Convenient Delivery",
                                        description: "Fresh meals delivered right to your door according to your chosen plan schedule."
                                    }
                                ].map((benefit, i) => (
                                    <motion.div
                                        key={i}
                                        className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-gray-50 hover:bg-white hover:shadow-lg'} transition-all duration-300`}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true }}
                                        variants={{
                                            ...fadeIn,
                                            transition: { delay: i * 0.1 }
                                        }}
                                    >
                                        <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-green-100'}`}>
                                            {benefit.icon}
                                        </div>
                                        <h3 className={`text-xl font-bold mb-4 text-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>{benefit.title}</h3>
                                        <p className={`text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{benefit.description}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                    
                    {/* Call to Action */}
                    <section className={`py-16 ${darkMode ? 'bg-gray-800' : 'bg-green-50'}`}>
                        <div className="container mx-auto px-4">
                            <div className="max-w-4xl mx-auto text-center">
                                <motion.div
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    variants={fadeIn}
                                >
                                    <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        Ready to Start Your Healthy Journey?
                                    </h2>
                                    <p className={`text-xl mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Download our menu to explore all options and contact us to place your order.
                                    </p>
                                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                                        <Button 
                                            onClick={handlePdfDownload}
                                            className={`flex items-center justify-center gap-2 px-8 py-4 rounded-full text-lg ${
                                                darkMode 
                                                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                                                    : 'bg-green-600 hover:bg-green-700 text-white'
                                            } transition-all duration-300 shadow-md hover:shadow-lg`}
                                        >
                                            <FileText size={20} />
                                            <span className="font-medium">View Menu PDF</span>
                                        </Button>
                                        <a 
                                            href="tel:+917972279059"
                                            className={`flex items-center justify-center gap-2 px-8 py-4 rounded-full text-lg ${
                                                darkMode 
                                                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                                                    : 'bg-white hover:bg-gray-100 text-gray-800'
                                            } transition-all duration-300 shadow-md hover:shadow-lg`}
                                        >
                                            <Phone size={20} />
                                            <span className="font-medium">Call to Order: 7972279059</span>
                                        </a>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className={`py-10 ${darkMode ? 'bg-gray-900 border-t border-gray-800' : 'bg-white border-t border-gray-100'}`}>
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <div className={`text-2xl font-bold mb-4 md:mb-0 ${darkMode ? 'text-green-500' : 'text-green-600'}`}>
                                Honest Meals
                            </div>
                            <div className="flex items-center gap-6">
                                <a 
                                    href="tel:+917972279059"
                                    className={`${darkMode ? 'text-gray-400 hover:text-green-500' : 'text-gray-600 hover:text-green-600'} transition-colors duration-200`}
                                >
                                    <Phone size={20} />
                                </a>
                                <a 
                                    href="https://instagram.com/honestmealsindia"
                                    target="_blank"
                                    rel="noopener noreferrer" 
                                    className={`${darkMode ? 'text-gray-400 hover:text-green-500' : 'text-gray-600 hover:text-green-600'} transition-colors duration-200`}
                                >
                                    <Instagram size={20} />
                                </a>
                            </div>
                        </div>
                        <div className={`text-center mt-6 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            <p>&copy; {new Date().getFullYear()} Honest Meals. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}