"use client"

import { Switch } from "@/components/ui/switch"

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
    Eye,
    Heart,
    Clock,
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
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

type Meal = {
    id: string
    name: string
    description: string | null
    price: number
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number | null
    image_url: string | null
    category_id: string
    dietary_type_id: string | null
    food_type: boolean | null
    is_available: boolean
    spice_level: number | null
    cooking_time_minutes: number | null
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

    const [meals, setMeals] = useState<Meal[]>([]);
    const [categories, setCategories] = useState<MealCategory[]>([]);
    const [dietaryTypes, setDietaryTypes] = useState<DietaryType[]>([]);
    const [filteredMeals, setFilteredMeals] = useState<Meal[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedFoodType, setSelectedFoodType] = useState<boolean | null>(
        diet === "veg" ? true : diet === "non-veg" ? false : null
    );
    const [selectedDietaryType, setSelectedDietaryType] = useState<string | null>(null); // New state for dietary type
    const [calorieType, setCalorieType] = useState<string>("all");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [sortOption, setSortOption] = useState<string>("default");
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);
    const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
    const [isMealDetailOpen, setIsMealDetailOpen] = useState(false);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const sortOptions: SortOption[] = [
        {
            label: "Default",
            value: "default",
            sortFn: (a: Meal, b: Meal) => a.name.localeCompare(b.name),
        },
        {
            label: "Price: Low to High",
            value: "price_asc",
            sortFn: (a: Meal, b: Meal) => a.price - b.price,
        },
        {
            label: "Price: High to Low",
            value: "price_desc",
            sortFn: (a: Meal, b: Meal) => b.price - a.price,
        },
        {
            label: "Calories: Low to High",
            value: "calories_asc",
            sortFn: (a: Meal, b: Meal) => a.calories - b.calories,
        },
        {
            label: "Protein: High to Low",
            value: "protein_desc",
            sortFn: (a: Meal, b: Meal) => b.protein - a.protein,
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

    // Fetch data and set dietary type if applicable
    useEffect(() => {
        async function fetchData() {
            setLoading(true);

            // Fetch meals
            const { data: mealsData, error: mealsError } = await supabase.from("meals").select("*").order("name");
            if (mealsError) {
                console.error("Error fetching meals:", mealsError);
                toast.error("Failed to load meals");
            } else {
                setMeals(mealsData || []);
                setFilteredMeals(mealsData || []);
            }

            // Fetch categories
            const { data: categoriesData, error: categoriesError } = await supabase
                .from("meal_categories")
                .select("*")
                .order("name");
            if (categoriesError) {
                console.error("Error fetching categories:", categoriesError);
            } else {
                setCategories(categoriesData || []);
            }

            // Fetch dietary types
            const { data: dietaryTypesData, error: dietaryTypesError } = await supabase
                .from("dietary_types")
                .select("*")
                .order("name");
            if (dietaryTypesError) {
                console.error("Error fetching dietary types:", dietaryTypesError);
            } else {
                setDietaryTypes(dietaryTypesData || []);

                // Check if diet param is "healthy-drinks" or "soups"
                if (diet && diet !== "veg" && diet !== "non-veg") {
                    const matchedDietaryType = dietaryTypesData?.find(
                        (type) => type.name.toLowerCase() === diet.toLowerCase()
                    );
                    if (matchedDietaryType) {
                        setSelectedDietaryType(matchedDietaryType.id);
                    }
                }
            }

            // ... (rest of the fetchData function remains unchanged)
            setLoading(false);
        }

        fetchData();
    }, [supabase, diet]);

    // Filter meals
    useEffect(() => {
        let filtered = [...meals];

        // Apply dietary type filter if set (e.g., "healthy-drinks" or "soups")
        if (selectedDietaryType) {
            filtered = filtered.filter((meal) => meal.dietary_type_id === selectedDietaryType);
        }

        // Apply search filter
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (meal) =>
                    meal.name.toLowerCase().includes(query) ||
                    (meal.description && meal.description.toLowerCase().includes(query))
            );
        }

        // Apply category filter
        if (selectedCategory) {
            filtered = filtered.filter((meal) => meal.category_id === selectedCategory);
        }

        // Apply active category filter (for horizontal category tabs)
        if (activeCategory) {
            filtered = filtered.filter((meal) => meal.category_id === activeCategory);
        }

        // Apply food type filter (veg/non-veg)
        if (selectedFoodType !== null) {
            filtered = filtered.filter((meal) => meal.food_type === selectedFoodType);
        }

        // Apply availability filter
        if (showOnlyAvailable) {
            filtered = filtered.filter((meal) => meal.is_available);
        }

        // Apply calorie filter
        if (calorieType !== "all") {
            if (calorieType === "deficit") {
                filtered = filtered.filter((meal) => meal.calories < 500);
            } else if (calorieType === "maintenance") {
                filtered = filtered.filter((meal) => meal.calories >= 500 && meal.calories <= 700);
            } else if (calorieType === "surplus") {
                filtered = filtered.filter((meal) => meal.calories > 700);
            }
        }

        // Apply sorting
        const currentSortOption = sortOptions.find((option) => option.value === sortOption);
        if (currentSortOption) {
            filtered.sort(currentSortOption.sortFn);
        }

        setFilteredMeals(filtered);
    }, [
        meals,
        selectedCategory,
        selectedFoodType,
        selectedDietaryType, // Added to dependencies
        calorieType,
        searchQuery,
        sortOption,
        showOnlyAvailable,
        activeCategory,
    ]);



    // Update cart in localStorage
    useEffect(() => {
        localStorage.setItem("honestMealsCart", JSON.stringify(cart))
    }, [cart])

    // Update favorites in localStorage
    useEffect(() => {
        localStorage.setItem("honestMealsFavorites", JSON.stringify(favorites))
    }, [favorites])

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

    // Toggle favorite
    const toggleFavorite = (mealId: string) => {
        setFavorites((prevFavorites) => {
            if (prevFavorites.includes(mealId)) {
                return prevFavorites.filter((id) => id !== mealId)
            } else {
                return [...prevFavorites, mealId]
            }
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

    // Clear filters (updated to include dietary type)
    const clearFilters = () => {
        setSelectedCategory(null);
        setSelectedFoodType(null);
        setSelectedDietaryType(null); // Clear dietary type filter
        setCalorieType("all");
        setSearchQuery("");
        setSortOption("default");
        setShowOnlyAvailable(true);
        setActiveCategory(null);
    };

    // Open meal detail
    const openMealDetail = (meal: Meal) => {
        setSelectedMeal(meal)
        setIsMealDetailOpen(true)
    }

    // Render spice level
    const renderSpiceLevel = (level: number | null) => {
        if (!level) return null

        return (
            <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`w-1.5 h-3 rounded-sm mx-0.5 ${i < level ? "bg-red-500" : "bg-gray-200"}`} />
                ))}
            </div>
        )
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
                                                router.push("/checkout")
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

            {/* Meal Detail Dialog */}
            <Sheet open={isMealDetailOpen} onOpenChange={setIsMealDetailOpen} modal={true}>
                <SheetContent side="right" className="w-full sm:max-w-xl p-0 overflow-y-auto">
                    {selectedMeal && (
                        <div className="flex flex-col h-full">
                            <div className="relative h-64 sm:h-80">
                                {selectedMeal.image_url ? (
                                    <Image
                                        src={selectedMeal.image_url || "/placeholder.svg"}
                                        alt={selectedMeal.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-400">
                    <span className="text-white font-bold text-3xl">
                      {selectedMeal.name.substring(0, 2).toUpperCase()}
                    </span>
                                    </div>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-4 right-4 bg-white/80 hover:bg-white rounded-full"
                                    onClick={() => setIsMealDetailOpen(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                                <div className="absolute top-4 left-4">
                                    <Badge
                                        className={`${
                                            selectedMeal.food_type
                                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                                : "bg-red-100 text-red-800 hover:bg-red-100"
                                        }`}
                                    >
                                        {selectedMeal.food_type ? "Veg" : "Non-Veg"}
                                    </Badge>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`absolute bottom-4 right-4 rounded-full ${
                                        favorites.includes(selectedMeal.id)
                                            ? "bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600"
                                            : "bg-white/80 hover:bg-white"
                                    }`}
                                    onClick={() => toggleFavorite(selectedMeal.id)}
                                >
                                    <Heart className={`h-5 w-5 ${favorites.includes(selectedMeal.id) ? "fill-red-500" : ""}`} />
                                </Button>
                            </div>

                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="text-2xl font-bold">{selectedMeal.name}</h2>
                                    <div className="text-xl font-bold text-green-600">₹{selectedMeal.price.toFixed(2)}</div>
                                </div>

                                <div className="flex items-center gap-3 mb-4">
                                    <Badge variant="outline" className="bg-gray-100">
                                        {getCategoryName(selectedMeal.category_id)}
                                    </Badge>
                                    {selectedMeal.cooking_time_minutes && (
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Clock className="h-4 w-4 mr-1" />
                                            {selectedMeal.cooking_time_minutes} min
                                        </div>
                                    )}
                                    {selectedMeal.spice_level && (
                                        <div className="flex items-center">
                                            <span className="text-sm text-gray-500 mr-1">Spice:</span>
                                            {renderSpiceLevel(selectedMeal.spice_level)}
                                        </div>
                                    )}
                                </div>

                                {selectedMeal.description && (
                                    <div className="mb-6">
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                                        <p className="text-gray-700">{selectedMeal.description}</p>
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-gray-500 mb-3">Nutritional Information</h3>
                                    <div className="grid grid-cols-4 gap-2">
                                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                                            <div className="text-lg font-bold text-blue-700">{selectedMeal.calories}</div>
                                            <div className="text-xs text-blue-600">Calories</div>
                                        </div>
                                        <div className="bg-purple-50 rounded-lg p-3 text-center">
                                            <div className="text-lg font-bold text-purple-700">{selectedMeal.protein}g</div>
                                            <div className="text-xs text-purple-600">Protein</div>
                                        </div>
                                        <div className="bg-amber-50 rounded-lg p-3 text-center">
                                            <div className="text-lg font-bold text-amber-700">{selectedMeal.carbs}g</div>
                                            <div className="text-xs text-amber-600">Carbs</div>
                                        </div>
                                        <div className="bg-pink-50 rounded-lg p-3 text-center">
                                            <div className="text-lg font-bold text-pink-700">{selectedMeal.fat}g</div>
                                            <div className="text-xs text-pink-600">Fat</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-gray-500 mb-3">Health Benefits</h3>
                                    <div className="space-y-2">
                                        {selectedMeal.protein > 20 && (
                                            <div className="flex items-start">
                                                <div className="bg-green-100 p-1 rounded-full mr-2">
                                                    <Dumbbell className="h-4 w-4 text-green-600" />
                                                </div>
                                                <div className="text-sm">
                                                    <span className="font-medium">High in protein</span> - Helps with muscle recovery and growth
                                                </div>
                                            </div>
                                        )}
                                        {selectedMeal.fiber && selectedMeal.fiber > 5 && (
                                            <div className="flex items-start">
                                                <div className="bg-green-100 p-1 rounded-full mr-2">
                                                    <Leaf className="h-4 w-4 text-green-600" />
                                                </div>
                                                <div className="text-sm">
                                                    <span className="font-medium">High in fiber</span> - Supports digestive health
                                                </div>
                                            </div>
                                        )}
                                        {selectedMeal.calories < 500 && (
                                            <div className="flex items-start">
                                                <div className="bg-green-100 p-1 rounded-full mr-2">
                                                    <Flame className="h-4 w-4 text-green-600" />
                                                </div>
                                                <div className="text-sm">
                                                    <span className="font-medium">Low calorie</span> - Great for weight management
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 border-t">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-9 w-9 rounded-full"
                                                onClick={() => {
                                                    const item = cart.find((item) => item.id === selectedMeal.id)
                                                    if (item && item.quantity > 0) {
                                                        removeFromCart(selectedMeal.id)
                                                    }
                                                }}
                                                disabled={!cart.some((item) => item.id === selectedMeal.id)}
                                            >
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <span className="mx-4 font-medium">
                        {cart.find((item) => item.id === selectedMeal.id)?.quantity || 0}
                      </span>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-9 w-9 rounded-full"
                                                onClick={() => addToCart(selectedMeal)}
                                                disabled={!selectedMeal.is_available}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <Button
                                            className="bg-green-500 hover:bg-green-600"
                                            size="lg"
                                            onClick={() => {
                                                addToCart(selectedMeal)
                                                toast.success(`Added ${selectedMeal.name} to cart`)
                                            }}
                                            disabled={!selectedMeal.is_available}
                                        >
                                            Add to Cart
                                        </Button>
                                    </div>
                                    {!selectedMeal.is_available && (
                                        <div className="text-center text-red-500 font-medium">Currently unavailable</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            <div className="container mx-auto px-4 py-6">
                {/* Search and filter bar */}
                <div className="mb-6 flex flex-col md:flex-row gap-4">
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

                {/* Category tabs */}
                <div className="mb-6 overflow-x-auto pb-2 hide-scrollbar">
                    <div className="flex space-x-2">
                        <Button
                            variant={activeCategory === null ? "default" : "outline"}
                            size="sm"
                            className={activeCategory === null ? "bg-green-500 hover:bg-green-600" : ""}
                            onClick={() => setActiveCategory(null)}
                        >
                            All Categories
                        </Button>
                        {categories.map((category) => (
                            <Button
                                key={category.id}
                                variant={activeCategory === category.id ? "default" : "outline"}
                                size="sm"
                                className={activeCategory === category.id ? "bg-green-500 hover:bg-green-600" : ""}
                                onClick={() => setActiveCategory(category.id)}
                            >
                                {category.name}
                            </Button>
                        ))}
                    </div>
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

                {/* View mode toggle */}
                <div className="mb-6 flex justify-end">
                    <div className="bg-gray-100 rounded-lg p-1 flex">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn("rounded-md px-3 py-1", viewMode === "grid" && "bg-white shadow-sm")}
                            onClick={() => setViewMode("grid")}
                        >
                            <div className="grid grid-cols-2 gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
                            </div>
                            <span className="ml-2">Grid</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn("rounded-md px-3 py-1", viewMode === "list" && "bg-white shadow-sm")}
                            onClick={() => setViewMode("list")}
                        >
                            <div className="flex flex-col gap-1">
                                <div className="w-6 h-1 bg-gray-400 rounded-sm"></div>
                                <div className="w-6 h-1 bg-gray-400 rounded-sm"></div>
                                <div className="w-6 h-1 bg-gray-400 rounded-sm"></div>
                            </div>
                            <span className="ml-2">List</span>
                        </Button>
                    </div>
                </div>

                {/* Meals Grid/List */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="relative w-20 h-20">
                            <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-full h-full border-4 border-t-green-500 rounded-full animate-spin"></div>
                        </div>
                    </div>
                ) : filteredMeals.length > 0 ? (
                    viewMode === "grid" ? (
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
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={`absolute bottom-2 right-2 rounded-full ${
                                                        favorites.includes(meal.id)
                                                            ? "bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600"
                                                            : "bg-white/80 hover:bg-white"
                                                    }`}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        toggleFavorite(meal.id)
                                                    }}
                                                >
                                                    <Heart className={`h-4 w-4 ${favorites.includes(meal.id) ? "fill-red-500" : ""}`} />
                                                </Button>
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

                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                                                        {meal.calories} cal
                                                    </Badge>
                                                    <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-50">
                                                        {meal.protein}g protein
                                                    </Badge>
                                                    {meal.cooking_time_minutes && (
                                                        <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                                                            <Clock className="mr-1 h-3 w-3" />
                                                            {meal.cooking_time_minutes} min
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button onClick={() => openMealDetail(meal)} variant="outline" className="flex-1">
                                                        <Eye className="mr-1 h-4 w-4" />
                                                        Details
                                                    </Button>
                                                    <Button
                                                        onClick={() => addToCart(meal)}
                                                        className="flex-1 bg-green-500 hover:bg-green-600 transition-colors"
                                                        disabled={!meal.is_available}
                                                    >
                                                        <Plus className="mr-1 h-4 w-4" />
                                                        Add
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredMeals.map((meal, index) => (
                                <motion.div
                                    key={meal.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ delay: index * 0.03 }}
                                >
                                    <Card
                                        className={cn(
                                            "overflow-hidden hover:shadow-md transition-shadow duration-300",
                                            !meal.is_available && "opacity-70",
                                        )}
                                    >
                                        <div className="flex flex-col sm:flex-row">
                                            <div className="relative w-full sm:w-48 h-40 sm:h-auto bg-gray-100 flex-shrink-0">
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
                                                <div className="absolute top-2 left-2">
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
                                            <CardContent className="p-4 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="font-bold text-gray-800">{meal.name}</h3>
                                                        <p className="text-sm text-gray-500">{getCategoryName(meal.category_id)}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-green-600">₹{meal.price.toFixed(2)}</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className={`rounded-full ${
                                                                favorites.includes(meal.id)
                                                                    ? "text-red-500 hover:text-red-600"
                                                                    : "text-gray-400 hover:text-gray-500"
                                                            }`}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                toggleFavorite(meal.id)
                                                            }}
                                                        >
                                                            <Heart className={`h-4 w-4 ${favorites.includes(meal.id) ? "fill-red-500" : ""}`} />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                    {meal.description || "No description available"}
                                                </p>

                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                                                        {meal.calories} cal
                                                    </Badge>
                                                    <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-50">
                                                        {meal.protein}g protein
                                                    </Badge>
                                                    {meal.cooking_time_minutes && (
                                                        <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                                                            <Clock className="mr-1 h-3 w-3" />
                                                            {meal.cooking_time_minutes} min
                                                        </Badge>
                                                    )}
                                                    {meal.spice_level && meal.spice_level > 0 && (
                                                        <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                                                            Spice: {renderSpiceLevel(meal.spice_level)}
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="flex gap-2 mt-auto">
                                                    <Button onClick={() => openMealDetail(meal)} variant="outline" size="sm">
                                                        <Eye className="mr-1 h-4 w-4" />
                                                        Details
                                                    </Button>
                                                    <Button
                                                        onClick={() => addToCart(meal)}
                                                        className="bg-green-500 hover:bg-green-600 transition-colors"
                                                        size="sm"
                                                        disabled={!meal.is_available}
                                                    >
                                                        <Plus className="mr-1 h-4 w-4" />
                                                        Add to Cart
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )
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
                        <Home className="h-5 w-5" />
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

