"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';

import {
    Leaf,
    Utensils,
    ArrowRight,
    DollarSign,
    Clock,
    Heart,
    Coffee,
    Settings,
    CreditCard
} from 'lucide-react';
import Image from 'next/image';
import mainLogo from "@/assets/images/homepage/honesMealLogo(png).png"
import backgroundVeg from "@/assets/images/homepage/bg-veg.jpg"
import backgroundNonVeg from "@/assets/images/homepage/bg-non-veg.jpg"
import {Button} from "@/components/ui/button";

const HomePage = () => {
    const [selectedOption, setSelectedOption] = useState(null);
    const router = { push: (path) => console.log(`Navigating to: ${path}`) };

    const handleOptionSelect = (option) => {
        setSelectedOption(option);
    };

    // Animation variants
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const cardHover = {
        rest: { scale: 1 },
        hover: { scale: 1.03, transition: { duration: 0.3 } }
    };

    return (
        <div className="relative min-h-screen">
            {/* Hero Section with About Us */}
            <div className="relative min-h-screen flex flex-col">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-white to-green-50 z-0"></div>

                {/* Pattern Overlay */}
                <div className="absolute inset-0 opacity-5 z-0"
                     style={{
                         backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                     }}></div>

                <div className="relative z-10 container mx-auto px-4 flex-1 flex flex-col">
                    {/* Header */}
                    <header className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <div className="text-2xl font-bold text-green-600">Honest Meals</div>
                        </div>
                        <nav className="hidden md:flex space-x-8">
                            <a href="#about" className="text-gray-600 hover:text-green-600 font-medium">About</a>
                            <a href="#meals" className="text-gray-600 hover:text-green-600 font-medium">Meals</a>
                            <a href="#why-us" className="text-gray-600 hover:text-green-600 font-medium">Why Us</a>
                            <a href="#testimonials" className="text-gray-600 hover:text-green-600 font-medium">Reviews</a>
                        </nav>
                        <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full">
                            Login
                        </Button>
                    </header>

                    {/* About Us Section */}
                    <motion.section
                        id="about"
                        className="py-10 md:py-16"
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn}
                    >
                        <div className="max-w-4xl mx-auto text-center">
                            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
                                Real Food for <span className="text-green-600">Real People</span>
                            </h1>
                            <p className="text-xl text-gray-600 mb-8">
                                We're different because we believe in honest portions, fair prices, and real ingredients.
                                No hidden charges, no tiny servings - just quality meals that satisfy hunger and fit your lifestyle.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-center">
                                <div className="bg-white p-6 rounded-xl shadow-md">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CreditCard className="h-6 w-6 text-green-600" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">Fair Pricing</h3>
                                    <p className="text-gray-600">Market cost + small fee. No hidden markups.</p>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-md">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Utensils className="h-6 w-6 text-green-600" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">Real Portions</h3>
                                    <p className="text-gray-600">Meals that actually satisfy with proper nutrition.</p>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-md">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Clock className="h-6 w-6 text-green-600" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">Quick Delivery</h3>
                                    <p className="text-gray-600">30-minute delivery to save you valuable time.</p>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* What do you want to eat today? Section */}
                    <motion.section
                        id="meals"
                        className="py-12 md:py-20"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeIn}
                    >
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                                What Would You Like To <span className="text-green-600">Eat Today?</span>
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Choose from our delicious meal options crafted with fresh ingredients and honest portions.
                            </p>
                        </div>

                        {/* Food Choice Cards */}
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            {/* Vegetarian Card */}
                            <motion.div
                                variants={fadeIn}
                                whileHover="hover"
                                initial="rest"
                                animate="rest"
                                variants={cardHover}
                                onClick={() => handleOptionSelect("veg")}
                                className={`relative bg-white rounded-2xl overflow-hidden cursor-pointer shadow-lg transition-all duration-300 h-80 ${
                                    selectedOption === "veg" ? "ring-4 ring-green-500" : ""
                                }`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 z-10"></div>
                                <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-20">
                                    <div className="bg-green-500/90 text-white px-3 py-1 rounded-full flex items-center">
                                        <Leaf className="h-4 w-4 mr-1" />
                                        <span className="font-medium">Vegetarian</span>
                                    </div>
                                    <div className="bg-white/90 text-green-600 px-2 py-1 rounded-full text-sm font-medium">
                                        From ₹60
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 w-full p-4 z-20 text-white">
                                    <h3 className="text-xl font-bold mb-1">Plant-Powered Meals</h3>
                                    <p className="text-gray-100 text-sm mb-3">Nutrient-rich vegetarian dishes with 100g protein portions</p>
                                    <Button
                                        className="bg-green-500 hover:bg-green-600 text-white rounded-full text-sm"
                                        size="sm"
                                    >
                                        Choose Vegetarian
                                        <ArrowRight className="ml-1 h-3 w-3" />
                                    </Button>
                                </div>
                                <div className="absolute inset-0 z-0 bg-green-900">
                                    <div className="w-full h-full relative">
                                        <div className="w-full h-full bg-green-800"></div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Non-Vegetarian Card */}
                            <motion.div
                                variants={fadeIn}
                                whileHover="hover"
                                initial="rest"
                                animate="rest"
                                variants={cardHover}
                                onClick={() => handleOptionSelect("non-veg")}
                                className={`relative bg-white rounded-2xl overflow-hidden cursor-pointer shadow-lg transition-all duration-300 h-80 ${
                                    selectedOption === "non-veg" ? "ring-4 ring-red-500" : ""
                                }`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 z-10"></div>
                                <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-20">
                                    <div className="bg-red-500/90 text-white px-3 py-1 rounded-full flex items-center">
                                        <Utensils className="h-4 w-4 mr-1" />
                                        <span className="font-medium">Non-Vegetarian</span>
                                    </div>
                                    <div className="bg-white/90 text-red-600 px-2 py-1 rounded-full text-sm font-medium">
                                        From ₹85
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 w-full p-4 z-20 text-white">
                                    <h3 className="text-xl font-bold mb-1">Protein-Rich Meals</h3>
                                    <p className="text-gray-100 text-sm mb-3">Hearty non-veg dishes with generous 250g portions</p>
                                    <Button
                                        className="bg-red-500 hover:bg-red-600 text-white rounded-full text-sm"
                                        size="sm"
                                    >
                                        Choose Non-Vegetarian
                                        <ArrowRight className="ml-1 h-3 w-3" />
                                    </Button>
                                </div>
                                <div className="absolute inset-0 z-0 bg-red-900">
                                    <div className="w-full h-full relative">
                                        <div className="w-full h-full bg-red-800"></div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Healthy Drinks Card */}
                            <motion.div
                                variants={fadeIn}
                                whileHover="hover"
                                initial="rest"
                                animate="rest"
                                variants={cardHover}
                                onClick={() => handleOptionSelect("drinks")}
                                className={`relative bg-white rounded-2xl overflow-hidden cursor-pointer shadow-lg transition-all duration-300 h-80 ${
                                    selectedOption === "drinks" ? "ring-4 ring-blue-500" : ""
                                }`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 z-10"></div>
                                <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-20">
                                    <div className="bg-blue-500/90 text-white px-3 py-1 rounded-full flex items-center">
                                        <Coffee className="h-4 w-4 mr-1" />
                                        <span className="font-medium">Healthy Drinks</span>
                                    </div>
                                    <div className="bg-white/90 text-blue-600 px-2 py-1 rounded-full text-sm font-medium">
                                        From ₹40
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 w-full p-4 z-20 text-white">
                                    <h3 className="text-xl font-bold mb-1">Fresh Juices & Smoothies</h3>
                                    <p className="text-gray-100 text-sm mb-3">Natural refreshments packed with vitamins and nutrients</p>
                                    <Button
                                        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm"
                                        size="sm"
                                    >
                                        Choose Drinks
                                        <ArrowRight className="ml-1 h-3 w-3" />
                                    </Button>
                                </div>
                                <div className="absolute inset-0 z-0 bg-blue-900">
                                    <div className="w-full h-full relative">
                                        <div className="w-full h-full bg-blue-800"></div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Customized Meals Card */}
                            <motion.div
                                variants={fadeIn}
                                whileHover="hover"
                                initial="rest"
                                animate="rest"
                                variants={cardHover}
                                onClick={() => handleOptionSelect("custom")}
                                className={`relative bg-white rounded-2xl overflow-hidden cursor-pointer shadow-lg transition-all duration-300 h-80 ${
                                    selectedOption === "custom" ? "ring-4 ring-purple-500" : ""
                                }`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 z-10"></div>
                                <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-20">
                                    <div className="bg-purple-500/90 text-white px-3 py-1 rounded-full flex items-center">
                                        <Settings className="h-4 w-4 mr-1" />
                                        <span className="font-medium">Customize</span>
                                    </div>
                                    <div className="bg-white/90 text-purple-600 px-2 py-1 rounded-full text-sm font-medium">
                                        You Decide!
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 w-full p-4 z-20 text-white">
                                    <h3 className="text-xl font-bold mb-1">Build Your Own Meal</h3>
                                    <p className="text-gray-100 text-sm mb-3">Create your perfect meal with our selection of ingredients</p>
                                    <Button
                                        className="bg-purple-500 hover:bg-purple-600 text-white rounded-full text-sm"
                                        size="sm"
                                    >
                                        Customize Meal
                                        <ArrowRight className="ml-1 h-3 w-3" />
                                    </Button>
                                </div>
                                <div className="absolute inset-0 z-0 bg-purple-900">
                                    <div className="w-full h-full relative">
                                        <div className="w-full h-full bg-purple-800"></div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* View All Button */}
                        <motion.div
                            variants={fadeIn}
                            className="mt-8 text-center"
                        >
                            <Button
                                onClick={() => router.push("/meals")}
                                variant="outline"
                                size="lg"
                                className="border-green-500 text-green-600 hover:bg-green-50 rounded-full px-8"
                            >
                                View All Meals
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </motion.div>
                    </motion.section>
                </div>
            </div>

            {/* Why Choose Us Section */}
            <section id="why-us" className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
            <span className="inline-block px-4 py-1 rounded-full bg-green-100 text-green-600 text-sm font-medium mb-4">
              Our Promise
            </span>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Choose <span className="text-green-600">Honest Meals</span>?</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            We're bringing transparency and quality to meal delivery with honest portions and fair pricing.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {/* Feature Cards */}
                        <motion.div
                            className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1, duration: 0.6 }}
                        >
                            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                                <DollarSign className="h-7 w-7 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Fair Pricing</h3>
                            <p className="text-gray-600 mb-6">
                                Market cost + small fee. No hidden charges or markups. We believe quality food shouldn't break the bank.
                            </p>
                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Veg meals from</span>
                                    <span className="text-lg font-bold text-green-600">₹60</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm text-gray-500">Non-veg meals from</span>
                                    <span className="text-lg font-bold text-green-600">₹85</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm text-gray-500">Healthy drinks from</span>
                                    <span className="text-lg font-bold text-green-600">₹40</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                        >
                            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                                <Utensils className="h-7 w-7 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Real Portions</h3>
                            <p className="text-gray-600 mb-6">
                                No more tiny portions. We serve meals that actually satisfy hunger and provide the nutrition you need.
                            </p>
                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Protein in veg meals</span>
                                    <span className="text-lg font-bold text-green-600">100g</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm text-gray-500">Protein in non-veg meals</span>
                                    <span className="text-lg font-bold text-green-600">250g</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm text-gray-500">Fresh fruit in smoothies</span>
                                    <span className="text-lg font-bold text-green-600">200g</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                        >
                            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                                <Clock className="h-7 w-7 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Time-Saving</h3>
                            <p className="text-gray-600 mb-6">
                                Skip cooking, save hours. Perfect for busy professionals and students who value their time.
                            </p>
                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Average delivery time</span>
                                    <span className="text-lg font-bold text-green-600">30 min</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm text-gray-500">Time saved per meal</span>
                                    <span className="text-lg font-bold text-green-600">~1 hour</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm text-gray-500">Weekly time savings</span>
                                    <span className="text-lg font-bold text-green-600">7+ hours</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
            <span className="inline-block px-4 py-1 rounded-full bg-green-100 text-green-600 text-sm font-medium mb-4">
              Customer Love
            </span>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">What Our <span className="text-green-600">Customers</span> Say</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Don't just take our word for it. Here's what our happy customers have to say.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Testimonial Cards */}
                        <motion.div
                            className="bg-gray-50 p-6 rounded-xl shadow-sm"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1, duration: 0.6 }}
                        >
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-600 font-bold text-lg mr-3">
                                    A
                                </div>
                                <div>
                                    <h4 className="font-bold">Aditya Singh</h4>
                                    <p className="text-gray-500 text-sm">Regular Customer</p>
                                </div>
                            </div>
                            <p className="text-gray-600 italic mb-4">
                                "Finally, a meal service with real portions! The chicken curry is perfect after my gym sessions. Great value for money."
                            </p>
                            <div className="flex text-yellow-400">
                                <Heart className="fill-current h-4 w-4" />
                                <Heart className="fill-current h-4 w-4" />
                                <Heart className="fill-current h-4 w-4" />
                                <Heart className="fill-current h-4 w-4" />
                                <Heart className="fill-current h-4 w-4" />
                            </div>
                        </motion.div>

                        <motion.div
                            className="bg-gray-50 p-6 rounded-xl shadow-sm"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                        >
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-600 font-bold text-lg mr-3">
                                    P
                                </div>
                                <div>
                                    <h4 className="font-bold">Priya Mehta</h4>
                                    <p className="text-gray-500 text-sm">Hostel Student</p>
                                </div>
                            </div>
                            <p className="text-gray-600 italic mb-4">
                                "As a hostel student, I love the affordable, healthy meals without cooking. The paneer tikka masala is my favorite!"
                            </p>
                            <div className="flex text-yellow-400">
                                <Heart className="fill-current h-4 w-4" />
                                <Heart className="fill-current h-4 w-4" />
                                <Heart className="fill-current h-4 w-4" />
                                <Heart className="fill-current h-4 w-4" />
                                <Heart className="fill-current h-4 w-4" />
                            </div>
                        </motion.div>

                        <motion.div
                            className="bg-gray-50 p-6 rounded-xl shadow-sm"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                        >
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-600 font-bold text-lg mr-3">
                                    R
                                </div>
                                <div>
                                    <h4 className="font-bold">Rahul Verma</h4>
                                    <p className="text-gray-500 text-sm">IT Professional</p>
                                </div>
                            </div>
                            <p className="text-gray-600 italic mb-4">
                                "Their smoothies are perfect with my lunch. I've been ordering the protein shake with my meals every day for months."
                            </p>
                            <div className="flex text-yellow-400">
                                <Heart className="fill-current h-4 w-4" />
                                <Heart className="fill-current h-4 w-4" />
                                <Heart className="fill-current h-4 w-4" />
                                <Heart className="fill-current h-4 w-4" />
                                <Heart className="fill-current h-4 w-4" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 bg-green-600 text-white">
                <div className="container mx-auto px-4">
                    <motion.div
                        className="flex flex-col md:flex-row items-center justify-between"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="text-center md:text-left mb-6 md:mb-0">
                            <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to Enjoy Honest Meals?</h2>
                            <p className="text-lg opacity-90 max-w-lg">
                                Download our app or order online for quick, healthy meals delivered to your doorstep.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                            <Button
                                className="bg-white hover:bg-opacity-90 text-green-600 rounded-full font-medium px-6 py-3"
                                size="lg"
                            >
                                Order Online
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button
                                className="bg-green-700 hover:bg-green-800 text-white rounded-full font-medium px-6 py-3"
                                size="lg"
                            >
                                Download App
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-800 text-gray-300 py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4">Honest Meals</h3>
                            <p className="mb-4">Real food for real people. Honest portions, fair prices, and quality ingredients.</p>
                            <div className="flex space-x-4">
                                <a href="#" className="text-gray-300 hover:text-white">
                                    <span className="sr-only">Facebook</span>
                                    {/* Facebook icon would go here */}
                                </a>
                                <a href="#" className="text-gray-300 hover:text-white">
                                    <span className="sr-only">Instagram</span>
                                    {/* Instagram icon would go here */}
                                </a>
                                <a href="#" className="text-gray-300 hover:text-white">
                                    <span className="sr-only">Twitter</span>
                                    {/* Twitter icon would go here */}
                                </a>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
                            <ul className="space-y-2">
                                <li><a href="#about" className="hover:text-white">About Us</a></li>
                                <li><a href="#meals" className="hover:text-white">Our Meals</a></li>
                                <li><a href="#why-us" className="hover:text-white">Why Choose Us</a></li>
                                <li><a href="#testimonials" className="hover:text-white">Reviews</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-white mb-4">Meal Categories</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="hover:text-white">Vegetarian</a></li>
                                <li><a href="#" className="hover:text-white">Non-Vegetarian</a></li>
                                <li><a href="#" className="hover:text-white">Healthy Drinks</a></li>
                                <li><a href="#" className="hover:text-white">Custom Meals</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
                            <ul className="space-y-2">
                                <li>Email: info@honestmeals.com</li>
                                <li>Phone: +91 9876543210</li>
                                <li>Address: 123 Healthy Street, Food City</li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-700 mt-8 pt-8 text-sm text-center">
                        <p>&copy; {new Date().getFullYear()} Honest Meals. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;