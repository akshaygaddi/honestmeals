"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Leaf, Utensils, ArrowRight, Clock, Sparkles, DollarSign, ChefHat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import backgroundJpg from "@/assets/images/homepage/bg-image.jpg"
import backgroundVeg from "@/assets/images/homepage/bg-veg.jpg"
import backgroundNonVeg from "@/assets/images/homepage/bg-non-veg.jpg"

export default function LandingPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [selectedOption, setSelectedOption] = useState(null)
    const [showFeaturesSection, setShowFeaturesSection] = useState(false)

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 600)
        return () => clearTimeout(timer)
    }, [])

    const handleOptionSelect = (option) => {
        setSelectedOption(option)
        setTimeout(() => {
            router.push(`/meals?diet=${option}`)
        }, 400)
    }

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 }
        }
    }

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    }

    const cardHover = {
        rest: { scale: 1 },
        hover: {
            scale: 1.02,
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            transition: { duration: 0.3 }
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center"
                >
                    <div className="relative w-20 h-20 mb-6">
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-t-green-500 rounded-full animate-spin"></div>
                    </div>
                    <h2 className="text-2xl font-medium text-gray-700">Honest Meals</h2>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="relative min-h-screen">
            {/* Hero Section with Choice Prompt */}
            <div className="relative min-h-screen flex flex-col">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-white to-green-50 z-0"></div>

                {/* Pattern Overlay */}
                <div className="absolute inset-0 opacity-5 z-0"
                     style={{
                         backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                     }}></div>

                <div className="relative z-10 container mx-auto px-4 pt-8 md:pt-12 flex-1 flex flex-col">
                    {/* Header */}
                    <header className="flex justify-between items-center">
                        <div className="flex items-center">
                            <ChefHat className="h-8 w-8 text-green-600 mr-2" />
                            <h1 className="text-2xl font-bold text-gray-800">Honest Meals</h1>
                        </div>
                        <Button
                            onClick={() => setShowFeaturesSection(!showFeaturesSection)}
                            variant="ghost"
                            size="sm"
                            className="text-gray-700 hover:text-green-600"
                        >
                            {showFeaturesSection ? "Hide Details" : "Why Choose Us"}
                        </Button>
                    </header>

                    {/* Main Content */}
                    <motion.div
                        className="flex-1 flex flex-col justify-center items-center py-10 md:py-0"
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn}
                    >
                        <h1 className="text-4xl md:text-6xl font-bold text-center text-gray-800 mb-4">
                            Choose Your <span className="text-green-600">Meal Preference</span>
                        </h1>
                        <p className="text-xl text-gray-600 text-center max-w-2xl mb-12">
                            Honest portions at fair prices. Real food for busy people.
                        </p>

                        {/* Diet Choice Cards */}
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-4xl"
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                        >
                            {/* Vegetarian Card */}
                            <motion.div
                                variants={fadeIn}
                                whileHover="hover"
                                initial="rest"
                                animate="rest"
                                variants={cardHover}
                                onClick={() => handleOptionSelect("veg")}
                                className={`relative bg-white rounded-2xl overflow-hidden cursor-pointer shadow-lg transition-all duration-300 h-80 md:h-96 ${
                                    selectedOption === "veg" ? "ring-4 ring-green-500" : ""
                                }`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 z-10"></div>
                                <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20">
                                    <div className="bg-green-500/90 text-white px-4 py-2 rounded-full flex items-center">
                                        <Leaf className="h-5 w-5 mr-2" />
                                        <span className="font-medium">Vegetarian</span>
                                    </div>
                                    <div className="bg-white/90 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
                                        From ₹60
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 w-full p-6 z-20 text-white">
                                    <h3 className="text-2xl font-bold mb-2">Plant-Powered Meals</h3>
                                    <p className="text-gray-100 mb-4">Nutrient-rich vegetarian dishes with 100g protein portions</p>
                                    <Button
                                        className="bg-green-500 hover:bg-green-600 text-white rounded-full"
                                        size="lg"
                                    >
                                        Choose Vegetarian
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="absolute inset-0 z-0 bg-green-900">
                                    <div className="w-full h-full relative">
                                        <Image
                                            src={backgroundVeg}
                                            alt="Vegetarian food"
                                            fill
                                            className="object-cover opacity-90"
                                            placeholder="blur"
                                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAADAAQDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAdEAABBAIDAAAAAAAAAAAAAAAAAQIDEQQFBhIh/8QAFQEBAQAAAAAAAAAAAAAAAAAABAX/xAAaEQACAgMAAAAAAAAAAAAAAAABAgADBBEh/9oADAMBAAIRAxEAPwCK3XbibMkjc+auNFkSK1DqGOVURPRYACot7MUez//Z"
                                        />
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
                                className={`relative bg-white rounded-2xl overflow-hidden cursor-pointer shadow-lg transition-all duration-300 h-80 md:h-96 ${
                                    selectedOption === "non-veg" ? "ring-4 ring-red-500" : ""
                                }`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 z-10"></div>
                                <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20">
                                    <div className="bg-red-500/90 text-white px-4 py-2 rounded-full flex items-center">
                                        <Utensils className="h-5 w-5 mr-2" />
                                        <span className="font-medium">Non-Vegetarian</span>
                                    </div>
                                    <div className="bg-white/90 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                                        From ₹85
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 w-full p-6 z-20 text-white">
                                    <h3 className="text-2xl font-bold mb-2">Protein-Rich Meals</h3>
                                    <p className="text-gray-100 mb-4">Hearty non-veg dishes with generous 250g portions</p>
                                    <Button
                                        className="bg-red-500 hover:bg-red-600 text-white rounded-full"
                                        size="lg"
                                    >
                                        Choose Non-Vegetarian
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="absolute inset-0 z-0 bg-red-900">
                                    <div className="w-full h-full relative">
                                        <Image
                                            src={backgroundNonVeg}
                                            alt="Non-vegetarian food"
                                            fill
                                            className="object-cover opacity-90"
                                            placeholder="blur"
                                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAADAAQDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAdEAABBAIDAAAAAAAAAAAAAAAAAQIDEQQFBhIh/8QAFQEBAQAAAAAAAAAAAAAAAAAABAX/xAAaEQACAgMAAAAAAAAAAAAAAAABAgADBBEh/9oADAMBAAIRAxEAPwCK3XbibMkjc+auNFkSK1DqGOVURPRYACot7MUez//Z"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* View All Button */}
                        <motion.div
                            variants={fadeIn}
                            className="mt-8"
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
                    </motion.div>
                </div>
            </div>

            {/* Features Section - Animated In/Out */}
            <AnimatePresence>
                {showFeaturesSection && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white py-16 px-4"
                    >
                        <div className="container mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-600 text-sm font-medium mb-4">
                                    Our Promise
                                </span>
                                <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Honest Meals?</h2>
                                <p className="text-gray-600 max-w-2xl mx-auto">
                                    We're bringing transparency and quality to meal delivery.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Feature 1 */}
                                <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
                                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                        <DollarSign className="h-7 w-7 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Fair Pricing</h3>
                                    <p className="text-gray-600">
                                        Market cost + small fee. Veg meals from ₹60, Non-Veg from ₹85.
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <p className="text-sm text-gray-500">
                                            Example: 250g Chicken Curry = ₹50 (chicken) + ₹20 (making)
                                        </p>
                                    </div>
                                </div>

                                {/* Feature 2 */}
                                <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
                                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                        <Utensils className="h-7 w-7 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Real Portions</h3>
                                    <p className="text-gray-600">
                                        100g paneer or 250g chicken—satisfying meals that keep you full.
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <p className="text-sm text-gray-500">
                                            No more tiny portions. We deliver meals that actually satisfy hunger.
                                        </p>
                                    </div>
                                </div>

                                {/* Feature 3 */}
                                <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
                                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                        <Clock className="h-7 w-7 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Time-Saving</h3>
                                    <p className="text-gray-600">
                                        Skip cooking, save hours. Perfect for busy professionals and students.
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <p className="text-sm text-gray-500">
                                            No meal prep, no cooking, no cleanup—just delicious ready-to-eat food.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Testimonials - Condensed */}
                            <div className="mt-16 text-center">
                                <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-600 text-sm font-medium mb-4">
                                    Customer Love
                                </span>
                                <div className="flex flex-wrap justify-center mt-6 gap-4">
                                    <div className="bg-white px-6 py-4 rounded-lg shadow-sm border border-gray-100 max-w-xs">
                                        <p className="italic text-gray-600">
                                            "Finally, a meal service with real portions! The chicken curry is perfect after gym."
                                        </p>
                                        <p className="mt-2 font-medium">- Aditya S.</p>
                                    </div>
                                    <div className="bg-white px-6 py-4 rounded-lg shadow-sm border border-gray-100 max-w-xs">
                                        <p className="italic text-gray-600">
                                            "As a hostel student, I love the affordable, healthy meals without cooking."
                                        </p>
                                        <p className="mt-2 font-medium">- Priya M.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Final CTA */}
                            <div className="mt-12 text-center">
                                <Button
                                    onClick={() => {
                                        setShowFeaturesSection(false);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8"
                                    size="lg"
                                >
                                    Choose Your Meal Now
                                    <Sparkles className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-6 px-4">
                <div className="container mx-auto text-center text-sm">
                    <p>© {new Date().getFullYear()} Honest Meals. All rights reserved.</p>
                    <p className="mt-2">Healthy, hearty meals without breaking the bank.</p>
                </div>
            </footer>
        </div>
    )
}