"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
    ShoppingCart,
    Filter,
    ChevronDown,
    Plus,
    Minus,
    X,
    Search,
    Leaf,
    Beef,
    Flame,
    Dumbbell,
    ArrowRight,
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
import { motion, AnimatePresence } from "motion/react"

type Meal = {
    id: string
    name: string
    description: string | null
    price: number
    calories: number
    protein: number
    image_url: string | null
    category_id: string
    dietary_type_id: string
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

export default function MealsPage() {
    const supabase = createClient()
    const router = useRouter()

    const [meals, setMeals] = useState<Meal[]>([])
    const [categories, setCategories] = useState<MealCategory[]>([])
    const [dietaryTypes, setDietaryTypes] = useState<DietaryType[]>([])
    const [filteredMeals, setFilteredMeals] = useState<Meal[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [selectedDietaryType, setSelectedDietaryType] = useState<string | null>(null)
    const [calorieType, setCalorieType] = useState<string>("all")
    const [cart, setCart] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [isCartOpen, setIsCartOpen] = useState(false)

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

        // Apply dietary type filter
        if (selectedDietaryType) {
            filtered = filtered.filter((meal) => meal.dietary_type_id === selectedDietaryType)
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

        setFilteredMeals(filtered)
    }, [meals, selectedCategory, selectedDietaryType, calorieType, searchQuery])

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

    // Calculate total cart items
    const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0)

    // Calculate cart total
    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

    // Get category name
    const getCategoryName = (categoryId: string) => {
        const category = categories.find((cat) => cat.id === categoryId)
        return category ? category.name : "Unknown Category"
    }

    // Get dietary type name
    const getDietaryTypeName = (dietaryTypeId: string) => {
        const dietaryType = dietaryTypes.find((type) => type.id === dietaryTypeId)
        return dietaryType ? dietaryType.name : "Unknown Type"
    }

    // Go to checkout
    const goToCheckout = () => {
        if (cart.length === 0) {
            toast.error("Your cart is empty")
            return
        }
        router.push("/checkout")
    }

    // Clear filters
    const clearFilters = () => {
        setSelectedCategory(null)
        setSelectedDietaryType(null)
        setCalorieType("all")
        setSearchQuery("")
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Header with cart button */}
            <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                        Honest Meals
                    </h1>

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
                                                        </div>

                                                        <div className="ml-4 flex-1">
                                                            <div className="flex justify-between">
                                                                <h4 className="font-medium text-gray-800">{item.name}</h4>
                                                                <span className="font-medium text-green-600">
                                  ₹{(item.price * item.quantity).toFixed(2)}
                                </span>
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

                                        <Button onClick={goToCheckout} className="w-full bg-green-500 hover:bg-green-600 h-12">
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

                    <Sheet>
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

                                <div>
                                    <h3 className="font-medium text-gray-700 mb-3">Dietary Preference</h3>
                                    <RadioGroup
                                        value={selectedDietaryType || "null"}
                                        onValueChange={(value) => setSelectedDietaryType(value === "null" ? null : value)}
                                        className="space-y-2"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="null" id="all-dietary" />
                                            <Label htmlFor="all-dietary">All Types</Label>
                                        </div>
                                        {dietaryTypes.map((type) => (
                                            <div key={type.id} className="flex items-center space-x-2">
                                                <RadioGroupItem value={type.id} id={`dietary-${type.id}`} />
                                                <Label htmlFor={`dietary-${type.id}`} className="flex items-center">
                                                    {type.name === "Veg" && <Leaf className="mr-2 h-4 w-4 text-green-500" />}
                                                    {type.name === "Non-Veg" && <Beef className="mr-2 h-4 w-4 text-red-500" />}
                                                    {type.name}
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
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
                            <DropdownMenuItem>Price: Low to High</DropdownMenuItem>
                            <DropdownMenuItem>Price: High to Low</DropdownMenuItem>
                            <DropdownMenuItem>Calories: Low to High</DropdownMenuItem>
                            <DropdownMenuItem>Protein: High to Low</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Active filters */}
                {(selectedCategory || selectedDietaryType || calorieType !== "all" || searchQuery) && (
                    <div className="mb-6 flex flex-wrap gap-2">
                        {selectedCategory && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                {getCategoryName(selectedCategory)}
                                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory(null)} />
                            </Badge>
                        )}
                        {selectedDietaryType && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                {getDietaryTypeName(selectedDietaryType)}
                                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedDietaryType(null)} />
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {filteredMeals.map((meal, index) => (
                                <motion.div
                                    key={meal.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow duration-300 flex flex-col">
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
                                                        getDietaryTypeName(meal.dietary_type_id) === "Veg"
                                                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                                                            : "bg-red-100 text-red-800 hover:bg-red-100"
                                                    }`}
                                                >
                                                    {getDietaryTypeName(meal.dietary_type_id)}
                                                </Badge>
                                            </div>
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
        </div>
    )
}

