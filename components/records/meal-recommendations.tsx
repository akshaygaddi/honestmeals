"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Loader2, Plus, ShoppingCart, ArrowRight, Heart } from "lucide-react"

type Meal = {
  id: string
  name: string
  description: string | null
  price: number
  calories: number
  protein: number
  carbs?: number
  fat?: number
  image_url: string | null
  category_id: string
  dietary_type_id: string | null
  food_type: boolean | null
  is_available: boolean
}

export default function MealRecommendations({ userId }: { userId: string | null }) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [healthMetrics, setHealthMetrics] = useState<any>(null)
  const [recommendedMeals, setRecommendedMeals] = useState<Meal[]>([])
  const [allMeals, setAllMeals] = useState<Meal[]>([])
  const [cart, setCart] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (!userId) return

    fetchHealthMetrics()
    fetchMeals()
    fetchCart()
  }, [userId])

  const fetchHealthMetrics = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from("health_metrics")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching health metrics:", error)
      toast.error("Failed to load health metrics")
    } else {
      setHealthMetrics(data)
    }
  }

  const fetchMeals = async () => {
    const { data, error } = await supabase.from("meals").select("*").eq("is_available", true).order("name")

    if (error) {
      console.error("Error fetching meals:", error)
      toast.error("Failed to load meals")
    } else {
      setAllMeals(data || [])
      generateRecommendations(data || [], healthMetrics)
    }

    setLoading(false)
  }

  const fetchCart = async () => {
    // Get cart from localStorage
    const savedCart = localStorage.getItem("honestMealsCart")
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }

  const generateRecommendations = (meals: Meal[], metrics: any) => {
    if (!metrics || !meals.length) {
      setRecommendedMeals(meals)
      return
    }

    // Filter and sort meals based on user's health metrics and goals
    let filtered = [...meals]

    // Apply dietary preference if set (vegetarian/non-vegetarian)
    if (metrics.food_preference === "vegetarian") {
      filtered = filtered.filter((meal) => meal.food_type === true)
    } else if (metrics.food_preference === "non_vegetarian") {
      filtered = filtered.filter((meal) => meal.food_type === false)
    }

    // Sort based on user's goal
    if (metrics.goal === "lose") {
      // For weight loss: prioritize high protein, low calorie meals
      filtered.sort((a, b) => {
        // Calculate protein per calorie ratio
        const aRatio = a.protein / a.calories
        const bRatio = b.protein / b.calories
        return bRatio - aRatio
      })
    } else if (metrics.goal === "gain") {
      // For weight gain: prioritize high calorie, high protein meals
      filtered.sort((a, b) => {
        // Sort by protein content first, then by calories
        if (b.protein !== a.protein) {
          return b.protein - a.protein
        }
        return b.calories - a.calories
      })
    } else {
      // For maintenance: prioritize balanced meals
      filtered.sort((a, b) => {
        // Assume balanced meals have a good protein-to-calorie ratio
        const aRatio = a.protein / a.calories
        const bRatio = b.protein / b.calories
        return Math.abs(0.15 - aRatio) - Math.abs(0.15 - bRatio) // 0.15 is roughly 15% of calories from protein
      })
    }

    setRecommendedMeals(filtered.slice(0, 10)) // Take top 10 recommendations
  }

  const addToCart = (meal: Meal) => {
    const existingItemIndex = cart.findIndex((item) => item.id === meal.id)

    if (existingItemIndex >= 0) {
      const updatedCart = [...cart]
      updatedCart[existingItemIndex].quantity += 1
      setCart(updatedCart)
      localStorage.setItem("honestMealsCart", JSON.stringify(updatedCart))
    } else {
      const updatedCart = [...cart, { ...meal, quantity: 1 }]
      setCart(updatedCart)
      localStorage.setItem("honestMealsCart", JSON.stringify(updatedCart))
    }

    toast.success(`Added ${meal.name} to cart`)
  }

  const getGoalLabel = (goal: string) => {
    if (goal === "lose") return "Weight Loss"
    if (goal === "gain") return "Weight Gain"
    return "Weight Maintenance"
  }

  const getActivityLabel = (level: string) => {
    if (level === "sedentary") return "Sedentary"
    if (level === "light") return "Lightly Active"
    if (level === "moderate") return "Moderately Active"
    if (level === "active") return "Very Active"
    if (level === "very_active") return "Extremely Active"
    return "Moderate Activity"
  }

  const getMealsByCategory = (category: string) => {
    if (category === "all") return recommendedMeals
    if (category === "high_protein") return recommendedMeals.filter((meal) => meal.protein >= 20)
    if (category === "low_calorie") return recommendedMeals.filter((meal) => meal.calories < 500)
    if (category === "high_calorie") return recommendedMeals.filter((meal) => meal.calories > 700)
    if (category === "vegetarian") return recommendedMeals.filter((meal) => meal.food_type === true)
    if (category === "non_vegetarian") return recommendedMeals.filter((meal) => meal.food_type === false)
    return recommendedMeals
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Meal Recommendations</h2>
        <p className="text-gray-500">Personalized meal suggestions based on your health profile</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        </div>
      ) : (
        <>
          {healthMetrics ? (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Your Health Profile</CardTitle>
                <CardDescription>Recommendations are based on these metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Goal</p>
                    <p className="font-medium">{getGoalLabel(healthMetrics.goal || "maintain")}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Daily Calories</p>
                    <p className="font-medium">{healthMetrics.target_calories || "Not set"} cal</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Activity Level</p>
                    <p className="font-medium">{getActivityLabel(healthMetrics.activity_level || "moderate")}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Weight</p>
                    <p className="font-medium">{healthMetrics.weight || "Not set"} kg</p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => router.push("/records?tab=calorie-calculator")}>
                    Update Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="text-center py-4">
                  <Heart className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <h3 className="text-lg font-medium mb-2">No Health Profile Found</h3>
                  <p className="text-gray-500 mb-4">
                    Complete your health profile to get personalized meal recommendations
                  </p>
                  <Button
                    onClick={() => router.push("/records?tab=calorie-calculator")}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Create Health Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All Recommendations</TabsTrigger>
              <TabsTrigger value="high_protein">High Protein</TabsTrigger>
              <TabsTrigger value="low_calorie">Low Calorie</TabsTrigger>
              <TabsTrigger value="high_calorie">High Calorie</TabsTrigger>
              <TabsTrigger value="vegetarian">Vegetarian</TabsTrigger>
              <TabsTrigger value="non_vegetarian">Non-Vegetarian</TabsTrigger>
            </TabsList>
          </Tabs>

          {getMealsByCategory(activeTab).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {getMealsByCategory(activeTab).map((meal) => (
                <Card key={meal.id} className="overflow-hidden h-full flex flex-col">
                  <div className="relative h-48 bg-gray-100">
                    {meal.image_url ? (
                      <Image src={meal.image_url || "/placeholder.svg"} alt={meal.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-400">
                        <span className="text-white font-bold text-xl">{meal.name.substring(0, 2).toUpperCase()}</span>
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
                  </div>
                  <CardContent className="p-4 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-800 line-clamp-1">{meal.name}</h3>
                      <span className="font-bold text-green-600">₹{meal.price.toFixed(2)}</span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">
                      {meal.description || "Delicious and nutritious meal"}
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
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-lg bg-gray-50">
              <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <h3 className="text-lg font-medium mb-2">No meals found</h3>
              <p className="text-gray-500 mb-4">Try selecting a different category or updating your health profile</p>
              <Button onClick={() => router.push("/")} className="bg-green-500 hover:bg-green-600">
                Browse All Meals
              </Button>
            </div>
          )}

          {cart.length > 0 && (
            <div className="fixed bottom-4 right-4 z-10">
              <Button onClick={() => router.push("/")} className="bg-green-500 hover:bg-green-600 shadow-lg">
                View Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

