"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "react-hot-toast"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Grid, 
  List, 
  ChevronUp, 
  SlidersHorizontal, 
  X,
  Filter,
  Home,
  ShoppingCart
} from "lucide-react"
import { cn } from "@/lib/utils"

// Import our types
import { Meal, MealCategory, DietaryType, CartItem, SortOption } from "@/types/meals"

// Import our components
import { MealCard } from "./meals/MealCard"
import { MealDetailSheet } from "./meals/MealDetailSheet"
import { CartSheet } from "./meals/CartSheet"
import { FilterSheet } from "./meals/FilterSheet"
import { MealsHeader } from "./meals/MealsHeader"
import { CategoryTabs } from "./meals/CategoryTabs"
import { AuthModal } from "./meals/AuthModal"

// Import custom hooks
import { useAuth } from "@/hooks/useAuth"
import { useFavorites } from "@/hooks/useFavorites"

export default function MealsPage() {
    const searchParams = useSearchParams()
    const diet = searchParams.get("diet")

    const supabase = createClient()
    const router = useRouter()
    const { user } = useAuth()
    const { 
        favorites, 
        toggleFavorite, 
        syncFavoritesToSupabase, 
        isFavorite 
    } = useFavorites()

    // State
    const [meals, setMeals] = useState<Meal[]>([])
    const [categories, setCategories] = useState<MealCategory[]>([])
    const [dietaryTypes, setDietaryTypes] = useState<DietaryType[]>([])
    const [filteredMeals, setFilteredMeals] = useState<Meal[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [selectedFoodType, setSelectedFoodType] = useState<boolean | null>(
        diet === "veg" ? true : diet === "non-veg" ? false : null
    )
    const [selectedDietaryType, setSelectedDietaryType] = useState<string | null>(null)
    const [activeCategory, setActiveCategory] = useState<string | null>(null)
    const [calorieType, setCalorieType] = useState<string>("all")
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
    const [cart, setCart] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [sortOption, setSortOption] = useState<string>("default")
    const [showScrollTop, setShowScrollTop] = useState(false)
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(true)
    const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null)
    const [isMealDetailOpen, setIsMealDetailOpen] = useState(false)
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [isScrolled, setIsScrolled] = useState(false)
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const [pendingFavoriteMeal, setPendingFavoriteMeal] = useState<string | null>(null)

    // Sort options
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

    // Handle scroll events
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300)
            setIsScrolled(window.scrollY > 50)
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    // Scroll to top function
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    // Load data from localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem("honestMealsCart")
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart))
            } catch (e) {
                console.error("Failed to parse cart from localStorage")
            }
        }

        const savedViewMode = localStorage.getItem("honestMealsViewMode")
        if (savedViewMode) {
            setViewMode(savedViewMode as "grid" | "list")
        }
    }, [])

    // Fetch data from Supabase
    useEffect(() => {
        async function fetchData() {
            setLoading(true)

            // Fetch meals
            const { data: mealsData, error: mealsError } = await supabase
                .from("meals")
                .select("*")
                .order("name")
            
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

                // Check if diet param is "healthy-drinks" or "soups"
                if (diet && diet !== "veg" && diet !== "non-veg") {
                    const matchedDietaryType = dietaryTypesData?.find(
                        (type) => type.name.toLowerCase() === diet.toLowerCase()
                    )
                    if (matchedDietaryType) {
                        setSelectedDietaryType(matchedDietaryType.id)
                    }
                }
            }

            setLoading(false)
        }

        fetchData()
    }, [supabase, diet])

    // Filter meals
    useEffect(() => {
        let filtered = [...meals]

        // Apply dietary type filter
        if (selectedDietaryType) {
            filtered = filtered.filter((meal) => meal.dietary_type_id === selectedDietaryType)
        }

        // Apply search filter
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(
                (meal) =>
                    meal.name.toLowerCase().includes(query) ||
                    (meal.description && meal.description.toLowerCase().includes(query))
            )
        }

        // Apply category filter
        if (selectedCategory) {
            filtered = filtered.filter((meal) => meal.category_id === selectedCategory)
        }

        // Apply active category filter (for horizontal category tabs)
        if (activeCategory) {
            filtered = filtered.filter((meal) => meal.category_id === activeCategory)
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

        // Apply price range filter
        filtered = filtered.filter(
            (meal) => meal.price >= priceRange[0] && meal.price <= priceRange[1]
        )

        // Apply sorting
        const currentSortOption = sortOptions.find((option) => option.value === sortOption)
        if (currentSortOption) {
            filtered.sort(currentSortOption.sortFn)
        }

        setFilteredMeals(filtered)
    }, [
        meals,
        selectedCategory,
        selectedFoodType,
        selectedDietaryType,
        calorieType,
        priceRange,
        searchQuery,
        sortOption,
        showOnlyAvailable,
        activeCategory,
    ])

    // Update cart in localStorage
    useEffect(() => {
        localStorage.setItem("honestMealsCart", JSON.stringify(cart))
    }, [cart])

    // Update view mode in localStorage
    useEffect(() => {
        localStorage.setItem("honestMealsViewMode", viewMode)
    }, [viewMode])

    // Sync favorites when user logs in
    useEffect(() => {
        if (user) {
            syncFavoritesToSupabase()
        }
    }, [user, syncFavoritesToSupabase])

    // Add to cart function
    const addToCart = useCallback((meal: Meal) => {
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
    }, [])

    // Remove from cart function
    const removeFromCart = useCallback((mealId: string) => {
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
    }, [])

    // Remove item completely from cart
    const removeItemCompletely = useCallback((mealId: string) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== mealId))
        toast.success("Item removed from cart")
    }, [])

    // Handle toggle favorite with auth check
    const handleToggleFavorite = useCallback(async (mealId: string) => {
        const result = await toggleFavorite(mealId)
        
        if (result.requiresAuth && !user) {
            // If the user needs to auth, store the meal ID and show the auth modal
            setPendingFavoriteMeal(mealId)
            setIsAuthModalOpen(true)
        }
    }, [toggleFavorite, user])

    // Handle auth success
    const handleAuthSuccess = useCallback(() => {
        // If there was a pending favorite action, complete it now
        if (pendingFavoriteMeal) {
            toggleFavorite(pendingFavoriteMeal)
            setPendingFavoriteMeal(null)
        }
    }, [pendingFavoriteMeal, toggleFavorite])

    // Get cart quantity for a meal
    const getCartQuantity = useCallback((mealId: string) => {
        const item = cart.find((item) => item.id === mealId)
        return item ? item.quantity : 0
    }, [cart])

    // Calculate total cart items
    const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0)

    // Get category name
    const getCategoryName = useCallback((categoryId: string) => {
        const category = categories.find((cat) => cat.id === categoryId)
        return category ? category.name : "Other"
    }, [categories])

    // Clear filters
    const clearFilters = useCallback(() => {
        setSelectedCategory(null)
        setSelectedFoodType(null)
        setSelectedDietaryType(null)
        setCalorieType("all")
        setPriceRange([0, 1000])
        setSearchQuery("")
        setSortOption("default")
        setShowOnlyAvailable(true)
        setActiveCategory(null)
    }, [])

    // Open meal detail
    const openMealDetail = useCallback((meal: Meal) => {
        setSelectedMeal(meal)
        setIsMealDetailOpen(true)
    }, [])

    // Render spice level
    const renderSpiceLevel = useCallback((level: number | null) => {
        if (!level) return null

        return (
            <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div 
                        key={i} 
                        className={`w-1.5 h-3 rounded-sm mx-0.5 ${i < level ? "bg-red-500" : "bg-gray-200"}`} 
                    />
                ))}
            </div>
        )
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Auth Modal */}
            <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={handleAuthSuccess}
                mode="favorites"
            />

            {/* Header */}
            <MealsHeader
                cartItemsCount={cartItemsCount}
                onCartOpen={() => setIsCartOpen(true)}
                onFilterOpen={() => setIsFilterOpen(true)}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isScrolled={isScrolled}
            />

            {/* Main content */}
            <div className="container mx-auto px-4 py-6">
                {/* Category tabs */}
                <div className="mb-6">
                    <CategoryTabs
                        categories={categories}
                        activeCategory={activeCategory}
                        onCategoryChange={setActiveCategory}
                    />
                </div>

                {/* Active filters */}
                {(selectedCategory ||
                    selectedFoodType !== null ||
                    selectedDietaryType !== null ||
                    calorieType !== "all" ||
                    searchQuery ||
                    !showOnlyAvailable ||
                    priceRange[0] > 0 ||
                    priceRange[1] < 1000) && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-500">Active Filters:</h3>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={clearFilters} 
                                className="text-xs h-7 text-gray-500 hover:text-gray-700"
                            >
                                Clear All
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {selectedCategory && (
                                <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1">
                                    Category: {getCategoryName(selectedCategory)}
                                    <X 
                                        className="h-3 w-3 ml-1 cursor-pointer" 
                                        onClick={() => setSelectedCategory(null)} 
                                    />
                                </Badge>
                            )}
                            {selectedFoodType !== null && (
                                <Badge
                                    variant="secondary"
                                    className={`flex items-center gap-1 px-2 py-1 ${
                                        selectedFoodType ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                    }`}
                                >
                                    {selectedFoodType ? "Vegetarian" : "Non-Vegetarian"}
                                    <X 
                                        className="h-3 w-3 ml-1 cursor-pointer" 
                                        onClick={() => setSelectedFoodType(null)} 
                                    />
                                </Badge>
                            )}
                            {selectedDietaryType && (
                                <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1">
                                    {dietaryTypes.find(dt => dt.id === selectedDietaryType)?.name || "Special Diet"}
                                    <X 
                                        className="h-3 w-3 ml-1 cursor-pointer" 
                                        onClick={() => setSelectedDietaryType(null)} 
                                    />
                                </Badge>
                            )}
                            {calorieType !== "all" && (
                                <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1">
                                    {calorieType === "deficit"
                                        ? "Weight Loss"
                                        : calorieType === "maintenance"
                                            ? "Maintenance"
                                            : "Muscle Gain"}
                                    <X 
                                        className="h-3 w-3 ml-1 cursor-pointer" 
                                        onClick={() => setCalorieType("all")} 
                                    />
                                </Badge>
                            )}
                            {(priceRange[0] > 0 || priceRange[1] < 1000) && (
                                <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1">
                                    Price: ₹{priceRange[0]} - ₹{priceRange[1]}
                                    <X 
                                        className="h-3 w-3 ml-1 cursor-pointer" 
                                        onClick={() => setPriceRange([0, 1000])} 
                                    />
                                </Badge>
                            )}
                            {searchQuery && (
                                <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1">
                                    Search: {searchQuery}
                                    <X 
                                        className="h-3 w-3 ml-1 cursor-pointer" 
                                        onClick={() => setSearchQuery("")} 
                                    />
                                </Badge>
                            )}
                            {!showOnlyAvailable && (
                                <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1">
                                    Including unavailable items
                                    <X 
                                        className="h-3 w-3 ml-1 cursor-pointer" 
                                        onClick={() => setShowOnlyAvailable(true)} 
                                    />
                                </Badge>
                            )}
                        </div>
                    </div>
                )}

                {/* Sort and view toggle */}
                <div className="mb-6 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 hidden sm:inline">Sort by:</span>
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="text-sm border border-gray-200 rounded-md px-2 py-1"
                        >
                            {sortOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setIsFilterOpen(true)}
                            className="md:hidden flex items-center gap-1 border-gray-200"
                        >
                            <SlidersHorizontal className="h-3.5 w-3.5" />
                            <span>Filters</span>
                        </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 hidden sm:inline">
                            {filteredMeals.length} {filteredMeals.length === 1 ? 'meal' : 'meals'}
                        </span>
                        <div className="bg-gray-100 rounded-lg p-1 flex">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "rounded-md h-8 w-8 p-0", 
                                    viewMode === "grid" && "bg-white shadow-sm"
                                )}
                                onClick={() => setViewMode("grid")}
                                title="Grid view"
                            >
                                <Grid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "rounded-md h-8 w-8 p-0", 
                                    viewMode === "list" && "bg-white shadow-sm"
                                )}
                                onClick={() => setViewMode("list")}
                                title="List view"
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Meals Grid/List */}
                {loading ? (
                    <div className="py-12">
                        <div className="flex justify-center items-center">
                            <div className="relative w-20 h-20">
                                <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
                                <div className="absolute top-0 left-0 w-full h-full border-4 border-t-green-500 rounded-full animate-spin"></div>
                            </div>
                        </div>
                        <p className="text-center text-gray-500 mt-4">Loading meals...</p>
                    </div>
                ) : filteredMeals.length > 0 ? (
                    <div 
                        className={cn(
                            viewMode === "grid" 
                                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                                : "space-y-5"
                        )}
                    >
                        <AnimatePresence>
                            {filteredMeals.map((meal, index) => (
                                <motion.div
                                    key={meal.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.03 }}
                                >
                                    <MealCard
                                        meal={meal}
                                        isGridView={viewMode === "grid"}
                                        isFavorite={isFavorite(meal.id)}
                                        onAddToCart={addToCart}
                                        onViewDetails={openMealDetail}
                                        onToggleFavorite={handleToggleFavorite}
                                        getCategoryName={getCategoryName}
                                        renderSpiceLevel={renderSpiceLevel}
                                    />
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
                            <Badge className="absolute top-2 right-1/3 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {cartItemsCount}
                            </Badge>
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

            {/* Modal Sheets */}
            <MealDetailSheet
                meal={selectedMeal}
                isOpen={isMealDetailOpen}
                onClose={() => setIsMealDetailOpen(false)}
                onAddToCart={addToCart}
                onRemoveFromCart={removeFromCart}
                getCartQuantity={getCartQuantity}
                getCategoryName={getCategoryName}
                isFavorite={selectedMeal ? isFavorite(selectedMeal.id) : false}
                onToggleFavorite={handleToggleFavorite}
                renderSpiceLevel={renderSpiceLevel}
            />

            <CartSheet
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cartItems={cart}
                onAddToCart={addToCart}
                onRemoveFromCart={removeFromCart}
                onRemoveItemCompletely={removeItemCompletely}
            />

            <FilterSheet
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                categories={categories}
                dietaryTypes={dietaryTypes}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedFoodType={selectedFoodType}
                setSelectedFoodType={setSelectedFoodType}
                selectedDietaryType={selectedDietaryType}
                setSelectedDietaryType={setSelectedDietaryType}
                calorieType={calorieType}
                setCalorieType={setCalorieType}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                showOnlyAvailable={showOnlyAvailable}
                setShowOnlyAvailable={setShowOnlyAvailable}
                clearFilters={clearFilters}
            />

            {/* Add padding for mobile bottom nav */}
            <div className="h-16 md:h-0"></div>
        </div>
    )
}

