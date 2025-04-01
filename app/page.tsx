"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Leaf, Utensils, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Image from "next/image"

export default function LandingPage() {
    const router = useRouter()
    const [selectedOption, setSelectedOption] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 800)
        return () => clearTimeout(timer)
    }, [])

    const handleOptionSelect = (option: string) => {
        setSelectedOption(option)
        setTimeout(() => {
            router.push(`/meals?diet=${option}`)
        }, 500)
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
            },
        },
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
                <div className="flex flex-col items-center">
                    <div className="relative w-16 h-16 mb-4">
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-t-green-500 rounded-full animate-spin"></div>
                    </div>
                    <h2 className="text-xl font-medium text-gray-700">Honest Meals</h2>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white flex flex-col text-gray-900">
            {/* Hero Section */}
            <header className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 to-emerald-500/90 z-10"></div>
                <Image src="/food-background.jpg" alt="Food background" fill className="object-cover" priority />
                <div className="relative z-20 container mx-auto px-4 py-16 md:py-24 text-center text-white">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-4">Honest Meals</h1>
                        <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90 mb-8">
                            Healthy, hearty meals without breaking the bank. Real portions at honest prices.
                        </p>
                        <Button
                            onClick={() => router.push("/meals")}
                            size="lg"
                            className="bg-white text-green-600 hover:bg-gray-100 font-medium rounded-full px-8"
                        >
                            View All Meals
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </motion.div>
                </div>
            </header>

            {/* Selection Section */}
            <main className="flex-1">
                <section className="py-16 px-4">
                    <motion.div variants={container} initial="hidden" animate="show" className="container mx-auto max-w-4xl">
                        <motion.div variants={item} className="text-center mb-12">
              <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-600 text-sm font-medium mb-4">
                Choose Your Preference
              </span>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">What would you like today?</h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Select your dietary preference and we'll show you meals that match your needs. All our meals are
                                prepared fresh with quality ingredients.
                            </p>
                        </motion.div>

                        <motion.div variants={item} className="grid md:grid-cols-2 gap-6">
                            <motion.div
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                className={`relative rounded-2xl overflow-hidden cursor-pointer shadow-md transition-all duration-300 ${
                                    selectedOption === "veg" ? "ring-4 ring-green-500" : ""
                                }`}
                                onClick={() => handleOptionSelect("veg")}
                            >
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-900/80 z-10"></div>
                                <Image
                                    src="/veg-food.jpg"
                                    alt="Vegetarian food"
                                    width={600}
                                    height={400}
                                    className="w-full h-64 object-cover"
                                />
                                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
                                    <div className="flex items-center mb-2">
                                        <Leaf className="h-6 w-6 text-green-400 mr-2" />
                                        <h3 className="text-2xl font-bold">Vegetarian</h3>
                                    </div>
                                    <p className="text-gray-100">Plant-based meals packed with nutrients and flavor</p>
                                </div>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                className={`relative rounded-2xl overflow-hidden cursor-pointer shadow-md transition-all duration-300 ${
                                    selectedOption === "non-veg" ? "ring-4 ring-red-500" : ""
                                }`}
                                onClick={() => handleOptionSelect("non-veg")}
                            >
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-red-900/80 z-10"></div>
                                <Image
                                    src="/non-veg-food.jpg"
                                    alt="Non-vegetarian food"
                                    width={600}
                                    height={400}
                                    className="w-full h-64 object-cover"
                                />
                                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
                                    <div className="flex items-center mb-2">
                                        <Utensils className="h-6 w-6 text-red-400 mr-2" />
                                        <h3 className="text-2xl font-bold">Non-Vegetarian</h3>
                                    </div>
                                    <p className="text-gray-100">Protein-rich meals for energy and satisfaction</p>
                                </div>
                            </motion.div>
                        </motion.div>

                        <motion.div variants={item} className="mt-8 text-center">
                            <Button onClick={() => router.push("/meals")} variant="outline" size="lg" className="mt-4 rounded-full">
                                View All Meals
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </motion.div>
                    </motion.div>
                </section>

                {/* Features Section */}
                <section className="py-16 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
              <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-600 text-sm font-medium mb-4">
                Our Promise
              </span>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Honest Meals?</h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                We're committed to providing quality meals with complete transparency. No hidden costs, no tiny portions
                                - just honest food.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                            >
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6 text-green-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold mb-2">Fair Pricing</h3>
                                <p className="text-gray-600">
                                    We charge market cost plus a small working fee. No hidden costs, no surprises.
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                viewport={{ once: true }}
                                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                            >
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6 text-green-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold mb-2">Real Portions</h3>
                                <p className="text-gray-600">100g paneer or 250g chicken—real portions that satisfy your hunger.</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                viewport={{ once: true }}
                                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                            >
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6 text-green-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold mb-2">Time-Saving</h3>
                                <p className="text-gray-600">
                                    Skip cooking, save hours. Get fresh, ready-to-eat meals delivered to you.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="py-16">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
              <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-600 text-sm font-medium mb-4">
                Testimonials
              </span>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Don't just take our word for it. Here's what our customers have to say about Honest Meals.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                            >
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                        <span className="text-green-600 font-bold">A</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold">Aditya S.</h4>
                                        <p className="text-sm text-gray-500">Software Engineer</p>
                                    </div>
                                </div>
                                <p className="text-gray-600">
                                    "Finally, a meal service that doesn't skimp on portions! The chicken curry is my go-to after gym
                                    sessions."
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                viewport={{ once: true }}
                                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                            >
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                        <span className="text-green-600 font-bold">P</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold">Priya M.</h4>
                                        <p className="text-sm text-gray-500">College Student</p>
                                    </div>
                                </div>
                                <p className="text-gray-600">
                                    "As a hostel student, I love that I can get affordable, healthy meals without cooking. The paneer
                                    dishes are amazing!"
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                viewport={{ once: true }}
                                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                            >
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                        <span className="text-green-600 font-bold">R</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold">Rahul K.</h4>
                                        <p className="text-sm text-gray-500">Fitness Trainer</p>
                                    </div>
                                </div>
                                <p className="text-gray-600">
                                    "I recommend Honest Meals to all my clients. High protein, clean ingredients, and transparent
                                    pricing."
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-500 text-white">
                    <div className="container mx-auto px-4 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to try Honest Meals?</h2>
                            <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
                                Delicious, nutritious meals are just a click away. No commitments, no subscriptions.
                            </p>
                            <Button
                                onClick={() => router.push("/meals")}
                                size="lg"
                                className="bg-white text-green-600 hover:bg-gray-100 font-medium rounded-full px-8"
                            >
                                Order Now
                                <Sparkles className="ml-2 h-4 w-4" />
                            </Button>
                        </motion.div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4">Honest Meals</h3>
                            <p className="text-gray-400 mb-4">
                                Healthy, hearty meals without breaking the bank. Real portions at honest prices.
                            </p>
                            <p className="text-gray-400">© {new Date().getFullYear()} Honest Meals. All rights reserved.</p>
                        </div>
                        <div>
                            <h4 className="text-lg font-medium mb-4">Quick Links</h4>
                            <ul className="space-y-2">
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                        About Us
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                        How It Works
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                        FAQs
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                        Contact Us
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-medium mb-4">Contact</h4>
                            <p className="text-gray-400 mb-2">Email: hello@honestmeals.com</p>
                            <p className="text-gray-400 mb-2">Phone: +91 98765 43210</p>
                            <div className="flex space-x-4 mt-4">
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path
                                            fillRule="evenodd"
                                            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path
                                            fillRule="evenodd"
                                            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

