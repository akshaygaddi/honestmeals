// // #app/meals/page.tsx
//
// import { Suspense } from "react"
// import MealsPage from "@/components/MealsPage" // Adjust the import path as needed
// import { Skeleton } from "@/components/ui/skeleton" // Optional: for fallback UI
//
// // Optional fallback component for loading state
// function MealsPageSkeleton() {
//     return (
//         <div className="container mx-auto px-4 py-6">
//             <div className="mb-8 flex flex-col md:flex-row gap-4">
//                 <Skeleton className="h-10 flex-1" />
//                 <Skeleton className="h-10 w-32" />
//                 <Skeleton className="h-10 w-32" />
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                 {Array.from({ length: 8 }).map((_, i) => (
//                     <Skeleton key={i} className="h-64 w-full rounded-lg" />
//                 ))}
//             </div>
//         </div>
//     )
// }
//
// export default function MealsPageWrapper() {
//     return (
//         <Suspense fallback={<MealsPageSkeleton />}>
//             <MealsPage />
//         </Suspense>
//     )
// }
//














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
    Instagram
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

    return (
        <>
            <Head>
                <title>Our Meals - Coming Soon | Honest Meals</title>
                <meta name="description" content="We're cooking up our menu and prices. Stay tuned for delicious, honest portions at fair prices." />
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
                    <div className={`w-full py-2 ${darkMode ? 'bg-green-900' : 'bg-green-100'}`}>
                        <div className="container mx-auto px-4 flex justify-center items-center space-x-6 text-sm">
                            <div className="flex items-center space-x-2">
                                <Phone size={16} className="text-green-600" />
                                <span className={darkMode ? 'text-green-100' : 'text-green-800'}>Call us: +91 8888756746</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Instagram size={16} className="text-green-600" />
                                <span className={darkMode ? 'text-green-100' : 'text-green-800'}>@honestmealsindia</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Clock size={16} className="text-green-600" />
                                <span className={darkMode ? 'text-green-100' : 'text-green-800'}>Hours: 9:00 AM - 10:00 PM</span>
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
                                className={`md:hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}
                            >
                                <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
                                    <a href="/#about" className={`py-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>About</a>
                                    <a href="/meals" className={`py-2 font-medium ${darkMode ? 'text-green-500' : 'text-green-600'}`}>Meals</a>
                                    <a href="/#why-us" className={`py-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Why Us</a>
                                    <a href="/#testimonials" className={`py-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Reviews</a>
                                    <Button
                                        className={`w-full transition duration-200 ${
                                            darkMode
                                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                                : 'bg-green-600 hover:bg-green-700 text-white'
                                        } rounded-full`}
                                    >
                                        Login
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </header>

                <main className="container mx-auto px-4 py-6 md:py-12">
                    {/* Hero Section */}
                    <motion.section
                        className="text-center mb-12 md:mb-24 pt-6 md:pt-12"
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn}
                    >
            <span className={`inline-block px-4 py-1 rounded-full text-sm font-medium mb-4 ${
                darkMode ? 'bg-green-900/30 text-green-500' : 'bg-green-100 text-green-600'
            }`}>
              Coming Soon
            </span>
                        <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            We're Cooking Up Something <span className={darkMode ? 'text-green-500' : 'text-green-600'}>Special</span>
                        </h1>
                        <p className={`text-xl max-w-2xl mx-auto mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Our team is finalizing our meal prices and menu options. We promise honest portions, fair prices, and real ingredients worth waiting for.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
                            <div className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                <Clock className={`h-5 w-5 mr-2 ${darkMode ? 'text-green-500' : 'text-green-600'}`} />
                                <span>Coming on 19th April 2025</span>
                            </div>
                        </div>
                    </motion.section>

                    {/* Featured Preview */}
                    <motion.section
                        className="mb-16 md:mb-24"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeIn}
                    >
                        {/*<div className={`rounded-2xl overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-gray-800 shadow-xl shadow-green-950/10' : 'bg-white shadow-xl'}`}>*/}
                        {/*    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">*/}
                        {/*        <div className="order-2 md:order-1 p-6 md:p-10 flex flex-col justify-center">*/}
                        {/*            <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>*/}
                        {/*                Download Our Meal Plan Preview*/}
                        {/*            </h2>*/}
                        {/*            <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>*/}
                        {/*                While we finalize our prices, we've prepared a detailed meal plan document that showcases our commitment to:*/}
                        {/*            </p>*/}

                        {/*/!*            <motion.ul*!/*/}
                        {/*/!*                className="space-y-4 mb-8"*!/*/}
                        {/*/!*                variants={staggerChildren}*!/*/}
                        {/*/!*            >*!/*/}
                        {/*/!*                {[*!/*/}
                        {/*/!*                    'Real portions that satisfy hunger',*!/*/}
                        {/*/!*                    'Fresh, quality ingredients sourced locally',*!/*/}
                        {/*/!*                    'Nutritionally balanced meals for all diets',*!/*/}
                        {/*/!*                    'Transparent pricing with no hidden fees'*!/*/}
                        {/*/!*                ].map((item, i) => (*!/*/}
                        {/*/!*                    <motion.li*!/*/}
                        {/*/!*                        key={i}*!/*/}
                        {/*/!*                        className="flex items-start"*!/*/}
                        {/*/!*                        variants={fadeIn}*!/*/}
                        {/*/!*                    >*!/*/}
                        {/*/!*<span className={`h-6 w-6 rounded-full flex items-center justify-center mr-3 mt-0.5 ${*!/*/}
                        {/*/!*    darkMode ? 'bg-green-900/50 text-green-500' : 'bg-green-100 text-green-600'*!/*/}
                        {/*/!*}`}>*!/*/}
                        {/*/!*  <Check size={14} />*!/*/}
                        {/*/!*</span>*!/*/}
                        {/*/!*                        <span className={darkMode ? 'text-gray-300' : ''}>{item}</span>*!/*/}
                        {/*/!*                    </motion.li>*!/*/}
                        {/*/!*                ))}*!/*/}
                        {/*/!*            </motion.ul>*!/*/}

                        {/*/!*            <a*!/*/}
                        {/*/!*                href="/app/mealPdf.pdf"*!/*/}
                        {/*/!*                download*!/*/}
                        {/*/!*            >*!/*/}
                        {/*/!*                <Button*!/*/}
                        {/*/!*                    className={`transition duration-200 w-full sm:w-auto ${*!/*/}
                        {/*/!*                        darkMode*!/*/}
                        {/*/!*                            ? 'bg-green-600 hover:bg-green-700 text-white'*!/*/}
                        {/*/!*                            : 'bg-green-600 hover:bg-green-700 text-white'*!/*/}
                        {/*/!*                    } rounded-full px-8 py-3 flex items-center justify-center sm:justify-start`}*!/*/}
                        {/*/!*                >*!/*/}
                        {/*/!*                    <Download size={18} className="mr-2" />*!/*/}
                        {/*/!*                    Download Meal Plan PDF*!/*/}
                        {/*/!*                </Button>*!/*/}
                        {/*/!*            </a>*!/*/}


                        {/*        </div>*/}

                        {/*        /!*<div className="order-1 md:order-2 md:flex md:items-center">*!/*/}
                        {/*        /!*    <div className="relative w-full aspect-[3/4] overflow-hidden">*!/*/}
                        {/*        /!*        <Image*!/*/}
                        {/*        /!*            src={mealsCoverPage}*!/*/}
                        {/*        /!*            alt="Honest Meals Food Plan Preview"*!/*/}
                        {/*        /!*            fill*!/*/}
                        {/*        /!*            className="object-cover"*!/*/}
                        {/*        /!*        />*!/*/}
                        {/*        /!*        <div className={`absolute inset-0 ${darkMode ? 'bg-gradient-to-br from-green-900/30 to-gray-900/70' : 'bg-gradient-to-br from-green-500/10 to-green-800/20'}`}></div>*!/*/}
                        {/*        /!*        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">*!/*/}
                        {/*        /!*            <h3 className="text-2xl font-bold text-white mb-2">Honest Meals Plan</h3>*!/*/}
                        {/*        /!*            <p className="text-gray-100">Preview of our upcoming meal options</p>*!/*/}
                        {/*        /!*        </div>*!/*/}
                        {/*        /!*    </div>*!/*/}
                        {/*        /!*</div>*!/*/}
                        {/*    </div>*/}
                        {/*</div>*/}
                    </motion.section>

                    {/* Sample Meals Showcase */}
                    <motion.section
                        className="mb-16 md:mb-24"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeIn}
                    >
                        <div className="text-center mb-12">
              <span className={`inline-block px-4 py-1 rounded-full text-sm font-medium mb-4 ${
                  darkMode ? 'bg-green-900/30 text-green-500' : 'bg-green-100 text-green-600'
              }`}>
                Sneak Peek
              </span>
                            <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                Sample Meals Coming Soon
                            </h2>
                            <p className={`text-lg max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                Here's a preview of what you can expect from our diverse menu options.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                {
                                    name: "Garden Fresh Salad",
                                    description: "Mixed greens with seasonal vegetables and balsamic dressing",
                                    type: "Vegetarian",
                                    calories: "250 kcal",
                                    image: backgroundVeg,
                                },
                                {
                                    name: "Tropical Protein Smoothie",
                                    description: "Mango, banana, Greek yogurt, and flax seeds blended into a creamy smoothie",
                                    type: "Healthy Drink",
                                    calories: "200 kcal",
                                    image: backgroundHealthyDrinks,
                                },
                                {
                                    name: "Egg Power Protein Bowl",
                                    description: "Boiled eggs served with sautéed veggies, brown rice, and a light dressing",
                                    type: "Non-Vegetarian",
                                    calories: "420 kcal",
                                    image: backgroundNonVeg,
                                }
                            ].map((meal, i) => (
                                <motion.div
                                    key={i}
                                    className={`rounded-xl overflow-hidden transition-colors duration-300 ${
                                        darkMode ? 'bg-gray-800 hover:bg-gray-750 border border-gray-700' : 'bg-white hover:shadow-lg'
                                    }`}
                                    whileHover={{ y: -5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <div className="relative aspect-[4/3]">
                                        <Image
                                            src={meal.image}
                                            alt={meal.name}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          meal.type === "Vegetarian"
                              ? 'bg-green-100 text-green-800'
                              : meal.type === "Vegan"
                                  ? 'bg-teal-100 text-teal-800'
                                  : 'bg-amber-100 text-amber-800'
                      }`}>
                        {meal.type}
                      </span>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{meal.name}</h3>
                                        <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{meal.description}</p>
                                        <div className="flex justify-between items-center">
                                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{meal.calories}</span>
                                            <span className={`font-medium ${darkMode ? 'text-green-500' : 'text-green-600'}`}>Coming soon</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Contact Us Section */}
                    <motion.section
                        className={`mb-16 md:mb-24 rounded-2xl p-6 md:p-10 ${
                            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'
                        }`}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeIn}
                    >
                        <div className="text-center mb-10">
              <span className={`inline-block px-4 py-1 rounded-full text-sm font-medium mb-4 ${
                  darkMode ? 'bg-green-900/30 text-green-500' : 'bg-green-100 text-green-600'
              }`}>
                Get In Touch
              </span>
                            <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                Want to Know More?
                            </h2>
                            <p className={`text-lg max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                Contact us for more information about our upcoming meal plans, corporate catering, or special dietary requests.
                            </p>
                        </div>

                        {/* Contact Methods */}
                        <div className="flex items-center justify-center w-full">
                            {[
                                {
                                    icon: <Phone className={`h-6 w-6 ${darkMode ? 'text-green-500' : 'text-green-600'}`} />,
                                    title: "Call Us",
                                    description: "We're available Mon-Sat, 9am-8pm",
                                    action: "+91 7972279059",
                                    link: "tel:+917972279059"
                                },
                            ].map((contact, i) => (
                                <motion.div
                                    key={i}
                                    className={`rounded-xl p-6 text-center transition-colors duration-300 ${
                                        darkMode ? 'bg-gray-750 hover:bg-gray-700 border border-gray-700' : 'bg-gray-50 hover:bg-white hover:shadow-md'
                                    }`}
                                    whileHover={{ y: -5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <div className={`w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center ${
                                        darkMode ? 'bg-green-900/30' : 'bg-green-100'
                                    }`}>
                                        {contact.icon}
                                    </div>
                                    <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{contact.title}</h3>
                                    <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{contact.description}</p>
                                    <a
                                        href={contact.link}
                                        className={`inline-flex items-center font-medium ${
                                            darkMode ? 'text-green-500 hover:text-green-400' : 'text-green-600 hover:text-green-700'
                                        }`}
                                        onClick={i === 2 ? () => setIsContactFormOpen(true) : undefined}
                                    >
                                        {contact.action}
                                        <ArrowRight size={16} className="ml-1" />
                                    </a>
                                </motion.div>
                            ))}
                        </div>

                        {/* Contact Form */}
                        <AnimatePresence>
                            {isContactFormOpen && (
                                <motion.div
                                    className="max-w-2xl mx-auto"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {!formSubmitted ? (
                                        <form
                                            onSubmit={handleFormSubmit}
                                            className={`rounded-2xl p-6 md:p-8 ${
                                                darkMode ? 'bg-gray-750 border border-gray-700' : 'bg-white shadow-md'
                                            }`}
                                        >
                                            <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Send us a message</h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                <div>
                                                    <label htmlFor="name" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Your Name</label>
                                                    <input
                                                        type="text"
                                                        id="name"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleFormChange}
                                                        className={`w-full px-4 py-2 rounded-lg outline-none focus:ring-2 transition-colors duration-200 ${
                                                            darkMode
                                                                ? 'bg-gray-700 text-white border-gray-600 focus:ring-green-500'
                                                                : 'border border-gray-300 focus:ring-green-500'
                                                        }`}
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="email" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                                                    <input
                                                        type="email"
                                                        id="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleFormChange}
                                                        className={`w-full px-4 py-2 rounded-lg outline-none focus:ring-2 transition-colors duration-200 ${
                                                            darkMode
                                                                ? 'bg-gray-700 text-white border-gray-600 focus:ring-green-500'
                                                                : 'border border-gray-300 focus:ring-green-500'
                                                        }`}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="mb-6">
                                                <label htmlFor="phone" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone (Optional)</label>
                                                <input
                                                    type="tel"
                                                    id="phone"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleFormChange}
                                                    className={`w-full px-4 py-2 rounded-lg outline-none focus:ring-2 transition-colors duration-200 ${
                                                        darkMode
                                                            ? 'bg-gray-700 text-white border-gray-600 focus:ring-green-500'
                                                            : 'border border-gray-300 focus:ring-green-500'
                                                    }`}
                                                />
                                            </div>

                                            <div className="mb-6">
                                                <label htmlFor="message" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Message</label>
                                                <textarea
                                                    id="message"
                                                    name="message"
                                                    value={formData.message}
                                                    onChange={handleFormChange}
                                                    rows="4"
                                                    className={`w-full px-4 py-2 rounded-lg outline-none focus:ring-2 transition-colors duration-200 ${
                                                        darkMode
                                                            ? 'bg-gray-700 text-white border-gray-600 focus:ring-green-500'
                                                            : 'border border-gray-300 focus:ring-green-500'
                                                    } resize-none`}
                                                    required
                                                ></textarea>
                                            </div>

                                            <Button
                                                type="submit"
                                                className={`w-full transition duration-200 ${
                                                    darkMode
                                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                                        : 'bg-green-600 hover:bg-green-700 text-white'
                                                } rounded-full py-3`}
                                            >
                                                Send Message
                                            </Button>
                                        </form>
                                    ) : (
                                        <div className={`rounded-2xl p-6 md:p-8 text-center ${
                                            darkMode ? 'bg-green-900/20 border border-green-900/30' : 'bg-green-50 border border-green-200'
                                        }`}>
                                            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                                                darkMode ? 'bg-green-900/30' : 'bg-green-100'
                                            }`}>
                                                <Check size={32} className={darkMode ? 'text-green-500' : 'text-green-600'} />
                                            </div>
                                            <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-green-500' : 'text-green-600'}`}>Message Sent!</h3>
                                            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                                Thank you for contacting us. We'll get back to you shortly.
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.section>

                    {/* FAQ Section */}
                    {/* FAQ Section */}
                    <motion.section
                        className="mb-16 md:mb-24"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeIn}
                    >
                        <div className="text-center mb-12">
    <span className={`inline-block px-4 py-1 rounded-full text-sm font-medium mb-4 ${
        darkMode ? 'bg-green-900/30 text-green-500' : 'bg-green-100 text-green-600'
    }`}>
      FAQ
    </span>
                            <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                Frequently Asked Questions
                            </h2>
                            <p className={`text-lg max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                Everything you need to know about our upcoming meal service
                            </p>
                        </div>

                        <div className="max-w-3xl mx-auto space-y-6">
                            {[
                                {
                                    q: "When will meal ordering be available?",
                                    a: "We're planning to launch our meal ordering service in May 2025. Sign up for our newsletter to get notified when we go live."
                                },
                                {
                                    q: "What types of meals will you offer?",
                                    a: "We'll offer vegetarian, non-vegetarian, healthy drinks, and customizable meals. All our options feature honest portions and quality ingredients."
                                },
                                {
                                    q: "How much will the meals cost?",
                                    a: "Our pricing will be transparent and fair. While we're finalizing exact costs, vegetarian meals will start around ₹60, non-vegetarian meals around ₹85, and healthy drinks from ₹40."
                                },
                                {
                                    q: "Do you cater to dietary restrictions?",
                                    a: "Yes! We'll offer options for various dietary needs including gluten-free, dairy-free, high-protein, and low-carb meals."
                                },
                                {
                                    q: "What areas will you serve?",
                                    a: "Initially, we'll serve major metro areas with plans to expand quickly. Download our meal plan PDF for more details on service areas."
                                }
                            ].map((faq, i) => (
                                <motion.div
                                    key={i}
                                    className={`rounded-xl p-6 transition-colors duration-300 ${
                                        darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-md'
                                    }`}
                                    variants={fadeIn}
                                    whileHover={{ y: -2 }}
                                    transition={{ type: "spring", stiffness: 400 }}
                                >
                                    <div
                                        className="flex justify-between items-center cursor-pointer"
                                        onClick={() => toggleFaq(i)}
                                    >
                                        <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>{faq.q}</h3>
                                        <ChevronDown
                                            size={20}
                                            className={`transition-transform duration-200 ${expandedFaq === i ? 'rotate-180' : ''} ${
                                                darkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}
                                        />
                                    </div>
                                    <AnimatePresence>
                                        {expandedFaq === i && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{faq.a}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>
                    {/* FAQ Section code you already have */}

                </main>

                {/* Footer */}
            </div>
        </>
    );
}