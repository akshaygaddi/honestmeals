"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/utils/supabase/client"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import {
    ShoppingCart,
    Filter,
    ChevronDown,
    Plus,
    Minus,
    X,
    Search,
    Leaf,
    Utensils,
    Flame,
    Dumbbell,
    ArrowRight,
    Home,
    ChevronUp,
    Check,
    Loader2,
    Send,
    User,
} from "lucide-react"
import { toast } from "react-hot-toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

type Meal = {
    id: string
    name: string
    description: string | null
    price: number
    calories: number
    protein: number
    image_url: string | null
    category_id: string
    dietary_type_id: string | null
    food_type: boolean | null
    is_available: boolean
}

type MealCategory = {
    id: string
    name: string
}

type DietaryType = {
    id: string
    name: string
}

type CartItem = Meal & {
    quantity: number
}

type SortOption = {
    label: string
    value: string
    sortFn: (a: Meal, b: Meal) => number
}

export default function MealsPage() {
    const searchParams = useSearchParams()
    const diet = searchParams.get("diet")

    const supabase = createClient()
    const router = useRouter()
    const scrollRef = useRef<HTMLDivElement>(null)

    const [meals, setMeals] = useState<Meal[]>([])
    const [categories, setCategories] = useState<MealCategory[]>([])
    const [dietaryTypes, setDietaryTypes] = useState<DietaryType[]>([])
    const [filteredMeals, setFilteredMeals] = useState<Meal[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [selectedFoodType, setSelectedFoodType] = useState<boolean | null>(
        diet === "veg" ? true : diet === "non-veg" ? false : null,
    )
    const [calorieType, setCalorieType] = useState<string>("all")
    const [cart, setCart] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [sortOption, setSortOption] = useState<string>("default")
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
    const [customerName, setCustomerName] = useState("")
    const [customerPhone, setCustomerPhone] = useState("")
    const [customerAddress, setCustomerAddress] = useState("")
    const [customerNote, setCustomerNote] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showScrollTop, setShowScrollTop] = useState(false)
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(true)

    const sortOptions: SortOption[] = [
        {
            label: "Default",
            value: "default",
            sortFn: (a, b) => a.name.localeCompare(b.name),
        },
        {
            label: "Price: Low to High",
            value: "price_asc",
            sortFn: (a, b) => a.price - b.price,
        },
        {
            label: "Price: High to Low",
            value: "price_desc",
            sortFn: (a, b) => b.price - a.price,
        },
        {
            label: "Calories: Low to High",
            value: "calories_asc",
            sortFn: (a, b) => a.calories - b.calories,
        },
        {
            label: "Protein: High to Low",
            value: "protein_desc",
            sortFn: (a, b) => b.protein - a.protein,
        },
    ]

    // Handle scroll to top button visibility
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300)
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    // Scroll to top function
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    // Fetch data
    useEffect(() => {
        async function fetchData() {
            setLoading(true)

            // Fetch meals
            const { data: mealsData, error: mealsError } = await supabase.from("meals").select("*").order("name")

            if (mealsError) {
                console.error("Error fetching meals:", mealsError)
                toast.error("Failed to load meals")
            } else {
                setMeals(mealsData || [])
                setFilteredMeals(mealsData || [])
            }

            // Fetch categories
            const { data: categoriesData, error: categoriesError } = await supabase
                .from("meal_categories")
                .select("*")
                .order("name")

            if (categoriesError) {
                console.error("Error fetching categories:", categoriesError)
            } else {
                setCategories(categoriesData || [])
            }

            // Fetch dietary types
            const { data: dietaryTypesData, error: dietaryTypesError } = await supabase
                .from("dietary_types")
                .select("*")
                .order("name")

            if (dietaryTypesError) {
                console.error("Error fetching dietary types:", dietaryTypesError)
            } else {
                setDietaryTypes(dietaryTypesData || [])
            }

            // Get cart from localStorage
            const savedCart = localStorage.getItem("honestMealsCart")
            if (savedCart) {
                setCart(JSON.parse(savedCart))
            }

            // Get user data from localStorage
            const userData = localStorage.getItem("honestMealsUser")
            if (userData) {
                const user = JSON.parse(userData)
                setCustomerName(user.name || "")
                setCustomerPhone(user.phone || "")
                setCustomerAddress(user.address || "")
            }

            setLoading(false)
        }

        fetchData()
    }, [supabase])

    // Filter meals
    useEffect(() => {
        let filtered = [...meals]

        // Apply search filter
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(
                (meal) =>
                    meal.name.toLowerCase().includes(query) ||
                    (meal.description && meal.description.toLowerCase().includes(query)),
            )
        }

        // Apply category filter
        if (selectedCategory) {
            filtered = filtered.filter((meal) => meal.category_id === selectedCategory)
        }

        // Apply food type filter (veg/non-veg)
        if (selectedFoodType !== null) {
            filtered = filtered.filter((meal) => meal.food_type === selectedFoodType)
        }

        // Apply availability filter
        if (showOnlyAvailable) {
            filtered = filtered.filter((meal) => meal.is_available)
        }

        // Apply calorie filter
        if (calorieType !== "all") {
            if (calorieType === "deficit") {
                filtered = filtered.filter((meal) => meal.calories < 500)
            } else if (calorieType === "maintenance") {
                filtered = filtered.filter((meal) => meal.calories >= 500 && meal.calories <= 700)
            } else if (calorieType === "surplus") {
                filtered = filtered.filter((meal) => meal.calories > 700)
            }
        }

        // Apply sorting
        const currentSortOption = sortOptions.find((option) => option.value === sortOption)
        if (currentSortOption) {
            filtered.sort(currentSortOption.sortFn)
        }

        setFilteredMeals(filtered)
    }, [meals, selectedCategory, selectedFoodType, calorieType, searchQuery, sortOption, showOnlyAvailable])

    // Update cart in localStorage
    useEffect(() => {
        localStorage.setItem("honestMealsCart", JSON.stringify(cart))
    }, [cart])

    // Add to cart function
    const addToCart = (meal: Meal) => {
        setCart((prevCart) => {
            const existingItemIndex = prevCart.findIndex((item) => item.id === meal.id)

            if (existingItemIndex >= 0) {
                const updatedCart = [...prevCart]
                updatedCart[existingItemIndex].quantity += 1
                return updatedCart
            } else {
                return [...prevCart, { ...meal, quantity: 1 }]
            }
        })

        toast.success(`Added ${meal.name} to cart`)
    }

    // Remove from cart function
    const removeFromCart = (mealId: string) => {
        setCart((prevCart) => {
            const existingItemIndex = prevCart.findIndex((item) => item.id === mealId)

            if (existingItemIndex >= 0) {
                const updatedCart = [...prevCart]
                if (updatedCart[existingItemIndex].quantity > 1) {
                    updatedCart[existingItemIndex].quantity -= 1
                    return updatedCart
                } else {
                    return prevCart.filter((item) => item.id !== mealId)
                }
            }

            return prevCart
        })
    }

    // Remove item completely from cart
    const removeItemCompletely = (mealId: string) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== mealId))
        toast.success("Item removed from cart")
    }

    // Calculate total cart items
    const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0)

    // Calculate cart total
    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

    // Get category name
    const getCategoryName = (categoryId: string) => {
        const category = categories.find((cat) => cat.id === categoryId)
        return category ? category.name : "Unknown Category"
    }

    // Get food type name
    const getFoodTypeName = (foodType: boolean | null) => {
        if (foodType === true) return "Veg"
        if (foodType === false) return "Non-Veg"
        return "Unknown"
    }

    // Clear filters
    const clearFilters = () => {
        setSelectedCategory(null)
        setSelectedFoodType(null)
        setCalorieType("all")
        setSearchQuery("")
        setSortOption("default")
        setShowOnlyAvailable(true)
    }

    // Handle WhatsApp checkout
    const handleWhatsAppCheckout = async () => {
        if (cart.length === 0) {
            toast.error("Your cart is empty")
            return
        }

        setIsSubmitting(true)

        try {
            // Get user ID from Supabase auth
            const {
                data: { user },
            } = await supabase.auth.getUser()

            // Try to fetch profile data if user is authenticated
            if (user) {
                const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

                if (profile) {
                    // Update form with profile data if available
                    setCustomerName(profile.full_name || customerName)
                    setCustomerPhone(profile.phone_number || customerPhone)
                    setCustomerAddress(profile.address || customerAddress)
                }
            }

            // Save user data to localStorage
            const updatedUserData = {
                name: customerName,
                phone: customerPhone,
                address: customerAddress,
            }
            localStorage.setItem("honestMealsUser", JSON.stringify(updatedUserData))

            // Continue with the rest of the checkout process...

            if (!customerName || !customerPhone || !customerAddress) {
                toast.error("Please fill in all required fields")
                return
            }

            // Save user data to localStorage
            // const userData = {
            //   name: customerName,
            //   phone: customerPhone,
            //   address: customerAddress,
            // }
            // localStorage.setItem("honestMealsUser", JSON.stringify(userData))

            try {
                // Get user ID from Supabase auth
                const {
                    data: { user },
                } = await supabase.auth.getUser()

                if (!user) {
                    // If no authenticated user, create a guest order
                    createWhatsAppOrder()
                    return
                }

                // Check if profile exists
                const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

                // If profile doesn't exist, create it
                if (!profile) {
                    await supabase.from("profiles").insert({
                        id: user.id,
                        full_name: customerName,
                        phone_number: customerPhone,
                        address: customerAddress,
                        updated_at: new Date().toISOString(),
                    })
                } else {
                    // Update profile if it exists
                    await supabase
                        .from("profiles")
                        .update({
                            full_name: customerName,
                            phone_number: customerPhone,
                            address: customerAddress,
                            updated_at: new Date().toISOString(),
                        })
                        .eq("id", user.id)
                }

                // Create order in database
                const { data: order, error: orderError } = await supabase
                    .from("orders")
                    .insert({
                        user_id: user.id,
                        total_amount: cartTotal + 40,
                        status: "pending",
                        delivery_address: customerAddress,
                        notes: customerNote || null,
                        payment_method: "COD",
                    })
                    .select()

                if (orderError) {
                    console.error("Error creating order:", orderError)
                    toast.error("Failed to create order")
                    setIsSubmitting(false)
                    return
                }

                // Create order items
                const orderItems = cart.map((item) => ({
                    order_id: order[0].id,
                    meal_id: item.id,
                    quantity: item.quantity,
                    unit_price: item.price,
                    total_price: item.price * item.quantity,
                }))

                const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

                if (itemsError) {
                    console.error("Error creating order items:", itemsError)
                }

                // Send WhatsApp message
                createWhatsAppOrder()
            } catch (error) {
                console.error("Error during checkout:", error)
                toast.error("An error occurred during checkout")
                setIsSubmitting(false)
            }
        } catch (error) {
            console.error("Error during checkout:", error)
            toast.error("An error occurred during checkout")
            setIsSubmitting(false)
        }
    }

    const createWhatsAppOrder = () => {
        // Format the order message
        let message = `*New Order from Honest Meals*\n\n`

        message += `*Name:* ${customerName}\n`
        message += `*Phone:* ${customerPhone}\n`
        message += `*Address:* ${customerAddress}\n`

        message += `\n*Order Details:*\n`

        cart.forEach((item, index) => {
            message += `${index + 1}. ${item.name} x ${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}\n`
        })

        message += `\n*Subtotal:* ₹${cartTotal.toFixed(2)}\n`
        message += `*Delivery Fee:* ₹40.00\n`
        message += `*Total:* ₹${(cartTotal + 40).toFixed(2)}\n`

        if (customerNote) {
            message += `\n*Note:* ${customerNote}\n`
        }

        // Encode the message for WhatsApp
        const encodedMessage = encodeURIComponent(message)

        // Create WhatsApp link (replace with your actual phone number)
        const whatsappLink = `https://wa.me/919876543210?text=${encodedMessage}`

        // Open WhatsApp in a new tab
        window.open(whatsappLink, "_blank")

        setIsSubmitting(false)
        setIsCheckoutOpen(false)
        setIsCartOpen(false)

        // Clear cart after successful order
        setCart([])
        toast.success("Order sent to WhatsApp!")
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Header with cart button */}
            <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => router.push("/")}>
                            <Home className="h-5 w-5" />
                        </Button>
                        <h1
                            className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent cursor-pointer"
                            onClick={() => router.push("/")}
                        >
                            Honest Meals
                        </h1>
                    </div>

                    <div className="hidden md:flex items-center space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
                            Home
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => router.push("/profile")}>
                            Profile
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => router.push("/orders")}>
                            Orders
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon" className="relative">
                                    <ShoppingCart className="h-5 w-5" />
                                    {cartItemsCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                                    )}
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full">
                                <SheetHeader className="p-4 border-b">
                                    <SheetTitle className="flex items-center justify-between">
                                        Your Cart ({cartItemsCount} items)
                                        <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </SheetTitle>
                                </SheetHeader>

                                <div className="flex-1 overflow-y-auto p-4">
                                    {cart.length === 0 ? (
                                        <div className="text-center py-10">
                                            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                <ShoppingCart size={32} className="text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-700 mb-2">Your cart is empty</h3>
                                            <p className="text-gray-500 mb-4">Add some delicious and healthy meals to get started!</p>
                                            <Button onClick={() => setIsCartOpen(false)} className="bg-green-500 hover:bg-green-600">
                                                Browse Meals
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <AnimatePresence>
                                                {cart.map((item) => (
                                                    <motion.div
                                                        key={item.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, x: -10 }}
                                                        className="flex border-b border-gray-100 pb-4"
                                                    >
                                                        <div className="w-20 h-20 bg-gray-200 rounded-lg relative flex-shrink-0 overflow-hidden">
                                                            {item.image_url ? (
                                                                <Image
                                                                    src={item.image_url || "/placeholder.svg"}
                                                                    alt={item.name}
                                                                    fill
                                                                    className="object-cover rounded-lg"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-400 rounded-lg">
                                  <span className="text-white font-bold">
                                    {item.name.substring(0, 2).toUpperCase()}
                                  </span>
                                                                </div>
                                                            )}
                                                            <div className="absolute top-0 left-0 w-6 h-6 flex items-center justify-center">
                                                                {item.food_type ? (
                                                                    <div className="bg-green-500 rounded-full w-3 h-3 border border-white"></div>
                                                                ) : (
                                                                    <div className="bg-red-500 rounded-full w-3 h-3 border border-white"></div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="ml-4 flex-1">
                                                            <div className="flex justify-between">
                                                                <h4 className="font-medium text-gray-800">{item.name}</h4>
                                                                <div className="flex items-center">
                                  <span className="font-medium text-green-600 mr-2">
                                    ₹{(item.price * item.quantity).toFixed(2)}
                                  </span>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-6 w-6 text-gray-400 hover:text-red-500"
                                                                        onClick={() => removeItemCompletely(item.id)}
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center mt-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-8 w-8 rounded-full"
                                                                    onClick={() => removeFromCart(item.id)}
                                                                >
                                                                    <Minus className="h-3 w-3" />
                                                                </Button>
                                                                <span className="mx-3 font-medium">{item.quantity}</span>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-8 w-8 rounded-full"
                                                                    onClick={() => addToCart(item)}
                                                                >
                                                                    <Plus className="h-3 w-3" />
                                                                </Button>
                                                            </div>

                                                            <div className="flex gap-2 mt-2">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {item.calories} cal
                                                                </Badge>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {item.protein}g protein
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>

                                {cart.length > 0 && (
                                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                                        <div className="space-y-3 mb-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Subtotal</span>
                                                <span>₹{cartTotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Delivery Fee</span>
                                                <span>₹40.00</span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between font-medium">
                                                <span>Total</span>
                                                <span>₹{(cartTotal + 40).toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={() => {
                                                setIsCheckoutOpen(true)
                                                setIsCartOpen(false)
                                            }}
                                            className="w-full bg-green-500 hover:bg-green-600 h-12"
                                        >
                                            Proceed to Checkout
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </header>

            {/* Checkout Dialog */}
            <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Complete Your Order</DialogTitle>
                        <DialogDescription>
                            Fill in your details to complete your order. We'll send it to WhatsApp for confirmation.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="Your name"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                placeholder="Your phone number"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Delivery Address</Label>
                            <Textarea
                                id="address"
                                placeholder="Your delivery address"
                                value={customerAddress}
                                onChange={(e) => setCustomerAddress(e.target.value)}
                                className="resize-none"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="note">Special Instructions (Optional)</Label>
                            <Textarea
                                id="note"
                                placeholder="Any special instructions for your order"
                                value={customerNote}
                                onChange={(e) => setCustomerNote(e.target.value)}
                                className="resize-none"
                                rows={2}
                            />
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                            <h4 className="font-medium mb-2">Order Summary</h4>
                            <div className="space-y-1 mb-3">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-medium">
                                <span>Total</span>
                                <span>₹{(cartTotal + 40).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsCheckoutOpen(false)
                                setIsCartOpen(true)
                            }}
                        >
                            Back to Cart
                        </Button>
                        <Button
                            onClick={handleWhatsAppCheckout}
                            className="bg-green-500 hover:bg-green-600"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send to WhatsApp
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="container mx-auto px-4 py-6">
                {/* Search and filter bar */}
                <div className="mb-8 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            type="text"
                            placeholder="Search meals..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-white border-gray-200"
                        />
                    </div>

                    <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="md:w-auto w-full">
                                <Filter className="mr-2 h-4 w-4" />
                                Filters
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-full sm:max-w-md">
                            <SheetHeader className="mb-6">
                                <SheetTitle>Filter Meals</SheetTitle>
                            </SheetHeader>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-medium text-gray-700 mb-3">Food Type</h3>
                                    <RadioGroup
                                        value={selectedFoodType === null ? "all" : selectedFoodType ? "veg" : "non-veg"}
                                        onValueChange={(value) => {
                                            if (value === "all") setSelectedFoodType(null)
                                            else if (value === "veg") setSelectedFoodType(true)
                                            else setSelectedFoodType(false)
                                        }}
                                        className="space-y-2"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="all" id="all-food-types" />
                                            <Label htmlFor="all-food-types">All Types</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="veg" id="veg" />
                                            <Label htmlFor="veg" className="flex items-center">
                                                <Leaf className="mr-2 h-4 w-4 text-green-500" />
                                                Vegetarian
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="non-veg" id="non-veg" />
                                            <Label htmlFor="non-veg" className="flex items-center">
                                                <Utensils className="mr-2 h-4 w-4 text-red-500" />
                                                Non-Vegetarian
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="font-medium text-gray-700 mb-3">Calorie Type</h3>
                                    <RadioGroup value={calorieType} onValueChange={setCalorieType} className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="all" id="all-calories" />
                                            <Label htmlFor="all-calories">All Meals</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="deficit" id="deficit" />
                                            <Label htmlFor="deficit" className="flex items-center">
                                                <Flame className="mr-2 h-4 w-4 text-orange-500" />
                                                Weight Loss (&lt;500 cal)
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="maintenance" id="maintenance" />
                                            <Label htmlFor="maintenance">Maintenance (500-700 cal)</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="surplus" id="surplus" />
                                            <Label htmlFor="surplus" className="flex items-center">
                                                <Dumbbell className="mr-2 h-4 w-4 text-blue-500" />
                                                Muscle Gain (&gt;700 cal)
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="font-medium text-gray-700 mb-3">Meal Type</h3>
                                    <RadioGroup
                                        value={selectedCategory || "null"}
                                        onValueChange={(value) => setSelectedCategory(value === "null" ? null : value)}
                                        className="space-y-2"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="null" id="all-categories" />
                                            <Label htmlFor="all-categories">All Categories</Label>
                                        </div>
                                        {categories.map((category) => (
                                            <div key={category.id} className="flex items-center space-x-2">
                                                <RadioGroupItem value={category.id} id={`category-${category.id}`} />
                                                <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="available-only" className="cursor-pointer">
                                        Show available meals only
                                    </Label>
                                    <Switch id="available-only" checked={showOnlyAvailable} onCheckedChange={setShowOnlyAvailable} />
                                </div>

                                <Button onClick={clearFilters} variant="outline" className="w-full">
                                    Clear All Filters
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="md:w-auto w-full">
                                Sort By
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {sortOptions.map((option) => (
                                <DropdownMenuItem
                                    key={option.value}
                                    onClick={() => setSortOption(option.value)}
                                    className={cn("flex items-center", sortOption === option.value && "font-medium bg-gray-100")}
                                >
                                    {sortOption === option.value && <Check className="mr-2 h-4 w-4" />}
                                    {option.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Active filters */}
                {(selectedCategory ||
                    selectedFoodType !== null ||
                    calorieType !== "all" ||
                    searchQuery ||
                    !showOnlyAvailable) && (
                    <div className="mb-6 flex flex-wrap gap-2">
                        {selectedCategory && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                {getCategoryName(selectedCategory)}
                                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory(null)} />
                            </Badge>
                        )}
                        {selectedFoodType !== null && (
                            <Badge
                                variant="secondary"
                                className={`flex items-center gap-1 ${selectedFoodType ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                            >
                                {selectedFoodType ? "Vegetarian" : "Non-Vegetarian"}
                                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedFoodType(null)} />
                            </Badge>
                        )}
                        {calorieType !== "all" && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                {calorieType === "deficit"
                                    ? "Weight Loss"
                                    : calorieType === "maintenance"
                                        ? "Maintenance"
                                        : "Muscle Gain"}
                                <X className="h-3 w-3 cursor-pointer" onClick={() => setCalorieType("all")} />
                            </Badge>
                        )}
                        {searchQuery && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                Search: {searchQuery}
                                <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                            </Badge>
                        )}
                        {!showOnlyAvailable && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                Including unavailable items
                                <X className="h-3 w-3 cursor-pointer" onClick={() => setShowOnlyAvailable(true)} />
                            </Badge>
                        )}
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-6">
                            Clear All
                        </Button>
                    </div>
                )}

                {/* Meals Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="relative w-20 h-20">
                            <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-full h-full border-4 border-t-green-500 rounded-full animate-spin"></div>
                        </div>
                    </div>
                ) : filteredMeals.length > 0 ? (
                    <div ref={scrollRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {filteredMeals.map((meal, index) => (
                                <motion.div
                                    key={meal.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card
                                        className={cn(
                                            "overflow-hidden h-full hover:shadow-lg transition-shadow duration-300 flex flex-col",
                                            !meal.is_available && "opacity-70",
                                        )}
                                    >
                                        <div className="relative h-48 bg-gray-100">
                                            {meal.image_url ? (
                                                <Image
                                                    src={meal.image_url || "/placeholder.svg"}
                                                    alt={meal.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-400">
                          <span className="text-white font-bold text-xl">
                            {meal.name.substring(0, 2).toUpperCase()}
                          </span>
                                                </div>
                                            )}
                                            <div className="absolute top-2 right-2">
                                                <Badge
                                                    className={`${
                                                        meal.food_type
                                                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                                                            : "bg-red-100 text-red-800 hover:bg-red-100"
                                                    }`}
                                                >
                                                    {meal.food_type ? "Veg" : "Non-Veg"}
                                                </Badge>
                                            </div>
                                            {!meal.is_available && (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                    <Badge variant="destructive" className="text-sm px-3 py-1">
                                                        Currently Unavailable
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                        <CardContent className="p-4 flex flex-col flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-gray-800 line-clamp-1">{meal.name}</h3>
                                                <span className="font-bold text-green-600">₹{meal.price.toFixed(2)}</span>
                                            </div>

                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">
                                                {meal.description || getCategoryName(meal.category_id)}
                                            </p>

                                            <div className="flex gap-2 mb-4">
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                                                    {meal.calories} cal
                                                </Badge>
                                                <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-50">
                                                    {meal.protein}g protein
                                                </Badge>
                                            </div>

                                            <Button
                                                onClick={() => addToCart(meal)}
                                                className="w-full bg-green-500 hover:bg-green-600 transition-colors"
                                                disabled={!meal.is_available}
                                            >
                                                <Plus className="mr-1 h-4 w-4" />
                                                Add to Cart
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-100">
                        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Filter className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">No meals found</h3>
                        <p className="text-gray-600 mb-4">Try adjusting your filters to see more options.</p>
                        <Button onClick={clearFilters} className="bg-green-500 hover:bg-green-600">
                            Clear Filters
                        </Button>
                    </div>
                )}
            </div>

            {/* Mobile bottom navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
                <div className="flex justify-around items-center h-16">
                    <Button
                        variant="ghost"
                        className="flex flex-col items-center justify-center h-full w-full rounded-none"
                        onClick={() => router.push("/")}
                    >
                        <Home className="h-5 w-5" />
                        <span className="text-xs mt-1">Home</span>
                    </Button>
                    <Button
                        variant="ghost"
                        className="flex flex-col items-center justify-center h-full w-full rounded-none"
                        onClick={() => setIsFilterOpen(true)}
                    >
                        <Filter className="h-5 w-5" />
                        <span className="text-xs mt-1">Filter</span>
                    </Button>
                    <Button
                        variant="ghost"
                        className="flex flex-col items-center justify-center h-full w-full rounded-none relative"
                        onClick={() => setIsCartOpen(true)}
                    >
                        <ShoppingCart className="h-5 w-5" />
                        {cartItemsCount > 0 && (
                            <span className="absolute top-2 right-1/3 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemsCount}
              </span>
                        )}
                        <span className="text-xs mt-1">Cart</span>
                    </Button>
                    <Button
                        variant="ghost"
                        className="flex flex-col items-center justify-center h-full w-full rounded-none"
                        onClick={() => router.push("/profile")}
                    >
                        <User className="h-5 w-5" />
                        <span className="text-xs mt-1">Profile</span>
                    </Button>
                </div>
            </div>

            {/* Scroll to top button */}
            <AnimatePresence>
                {showScrollTop && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="fixed bottom-20 right-4 md:bottom-8 md:right-8 bg-green-500 text-white rounded-full p-3 shadow-lg z-40"
                        onClick={scrollToTop}
                    >
                        <ChevronUp className="h-5 w-5" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Add padding for mobile bottom nav */}
            <div className="h-16 md:h-0"></div>
        </div>
    )
}

