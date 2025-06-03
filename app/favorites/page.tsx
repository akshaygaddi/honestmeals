"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/hooks/useAuth"
import { useFavorites } from "@/hooks/useFavorites"
import { formatDistanceToNow, format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "react-hot-toast"
import { Heart, ShoppingBag, Clock, ChevronRight, Calendar, BarChart2, ArrowUpRight, Utensils, Ban } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface MealData {
  id: string
  name: string
  price: number
  image_url: string | null
  food_type: boolean | null
  category_id: string
  calories: number
  is_available: boolean
}

interface FavoriteWithHistory {
  id: string
  meal_id: string
  meal: MealData
  created_at: string
  last_ordered: string | null
  order_count: number
}

interface MealCategory {
  id: string
  name: string
}

export default function FavoritesPage() {
  const router = useRouter()
  const supabase = createClient()
  const { user, loading: authLoading } = useAuth()
  const { favorites, toggleFavorite } = useFavorites()
  
  const [favoritesWithHistory, setFavoritesWithHistory] = useState<FavoriteWithHistory[]>([])
  const [categories, setCategories] = useState<MealCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  // Fetch favorites with order history
  useEffect(() => {
    async function fetchFavoritesWithHistory() {
      if (authLoading) return
      if (!user) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        // First, fetch categories for display
        const { data: categoriesData } = await supabase
          .from("meal_categories")
          .select("*")
          .order("name")

        if (categoriesData) {
          setCategories(categoriesData)
        }

        // Fetch favorites with meals and order history using a custom query
        const { data: favoritesData, error } = await supabase
          .from('favorites')
          .select(`
            id,
            meal_id,
            created_at,
            meal:meals(
              id,
              name,
              price,
              image_url,
              food_type,
              category_id,
              calories,
              is_available
            )
          `)
          .eq('user_id', user.id)

        if (error) {
          console.error('Error fetching favorites:', error)
          toast.error('Failed to load favorites')
          return
        }

        if (!favoritesData || favoritesData.length === 0) {
          setFavoritesWithHistory([])
          setLoading(false)
          return
        }
        
        // Type assertion for TypeScript
        type FavoriteRawData = {
          id: string;
          meal_id: string;
          created_at: string;
          meal: any; // This could be an array or object depending on Supabase's response
        };
        
        // Convert to our format and handle any nested data
        const processedFavorites: FavoriteWithHistory[] = (favoritesData as FavoriteRawData[])
          .filter(fav => fav && fav.meal) // Ensure we have valid data
          .map(fav => {
            // Extract meal data - in Supabase it can be returned as an array for nested selects
            let mealData: MealData;
            
            if (Array.isArray(fav.meal) && fav.meal.length > 0) {
              // If meal is an array, take the first item
              mealData = {
                id: fav.meal[0].id || '',
                name: fav.meal[0].name || '',
                price: fav.meal[0].price || 0,
                image_url: fav.meal[0].image_url,
                food_type: fav.meal[0].food_type,
                category_id: fav.meal[0].category_id || '',
                calories: fav.meal[0].calories || 0,
                is_available: fav.meal[0].is_available !== false
              };
            } else {
              // If meal is an object, use it directly
              mealData = {
                id: fav.meal.id || '',
                name: fav.meal.name || '',
                price: fav.meal.price || 0,
                image_url: fav.meal.image_url,
                food_type: fav.meal.food_type,
                category_id: fav.meal.category_id || '',
                calories: fav.meal.calories || 0,
                is_available: fav.meal.is_available !== false
              };
            }
            
            return {
              id: fav.id,
              meal_id: fav.meal_id,
              created_at: fav.created_at,
              meal: mealData,
              last_ordered: null, // Will be populated later
              order_count: 0 // Will be populated later
            };
          });
          
        // Now fetch order history for each favorite meal
        const favsWithHistory = await Promise.all(
          processedFavorites.map(async (fav) => {
            try {
              // Query for the latest order containing this meal
              const { data: orderData } = await supabase
                .from('order_items')
                .select(`
                  id,
                  order_id,
                  orders(created_at)
                `)
                .eq('meal_id', fav.meal_id)
                .eq('orders.customer_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)

              // Get order count for this meal
              const { count } = await supabase
                .from('order_items')
                .select('id', { count: 'exact', head: true })
                .eq('meal_id', fav.meal_id)
                .eq('orders.customer_id', user.id)
                .eq('orders.status', 'delivered') // Only count successfully delivered orders

              let lastOrdered: string | null = null;
              
              // Safely extract the created_at date from the nested orders object
              if (orderData && orderData.length > 0 && orderData[0].orders) {
                const ordersData = orderData[0].orders;
                
                // Handle all possible data shapes from Supabase
                if (Array.isArray(ordersData) && ordersData.length > 0 && ordersData[0] && typeof ordersData[0].created_at === 'string') {
                  lastOrdered = ordersData[0].created_at;
                } else if (typeof ordersData === 'object' && ordersData !== null && 'created_at' in ordersData && typeof ordersData.created_at === 'string') {
                  lastOrdered = ordersData.created_at;
                }
              }

              return {
                ...fav,
                last_ordered: lastOrdered,
                order_count: count || 0
              };
            } catch (error) {
              console.error(`Error fetching order history for meal ${fav.meal_id}:`, error);
              return fav; // Return the favorite without order history in case of error
            }
          })
        );

        setFavoritesWithHistory(favsWithHistory);
      } catch (error) {
        console.error('Error fetching favorites with history:', error)
        toast.error('An error occurred while loading your favorites')
      } finally {
        setLoading(false)
      }
    }

    fetchFavoritesWithHistory()
  }, [supabase, user, authLoading, favorites])

  const removeFavorite = async (mealId: string) => {
    await toggleFavorite(mealId)
    toast.success('Removed from favorites')
    // Update the local state to remove this item
    setFavoritesWithHistory(prev => 
      prev.filter(fav => fav.meal_id !== mealId)
    )
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category ? category.name : 'Other'
  }

  const getFilteredFavorites = () => {
    if (activeTab === 'all') return favoritesWithHistory
    if (activeTab === 'ordered') return favoritesWithHistory.filter(fav => fav.order_count > 0)
    if (activeTab === 'not-ordered') return favoritesWithHistory.filter(fav => fav.order_count === 0)
    if (activeTab === 'frequent') return favoritesWithHistory.filter(fav => fav.order_count >= 3)
    if (activeTab === 'recent') return [...favoritesWithHistory]
      .sort((a, b) => {
        if (!a.last_ordered) return 1
        if (!b.last_ordered) return -1
        return new Date(b.last_ordered).getTime() - new Date(a.last_ordered).getTime()
      })
    return favoritesWithHistory
  }

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-12 w-48 mb-4" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="pb-2">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to view your favorites</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Heart className="h-16 w-16 text-red-200 mb-4" />
            <p className="text-center mb-6">
              You need to be signed in to view and manage your favorite meals. Please sign in or create an account.
            </p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => router.push("/meals")}>
                Browse Meals
              </Button>
              <Button onClick={() => router.push("/sign-in")}>Sign In</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Heart className="mr-2 text-red-500 h-8 w-8" />
          My Favorites
        </h1>
        <p className="text-gray-500">Manage your favorite meals and view your ordering patterns</p>
      </div>

      <Tabs defaultValue="all" className="mb-8" onValueChange={setActiveTab}>
        <TabsList className="mb-4 flex flex-wrap">
          <TabsTrigger value="all" className="mr-2 mb-2">
            All Favorites
          </TabsTrigger>
          <TabsTrigger value="ordered" className="mr-2 mb-2">
            Ordered Before
          </TabsTrigger>
          <TabsTrigger value="not-ordered" className="mr-2 mb-2">
            Never Ordered
          </TabsTrigger>
          <TabsTrigger value="frequent" className="mr-2 mb-2">
            Frequently Ordered
          </TabsTrigger>
          <TabsTrigger value="recent" className="mb-2">
            Recently Ordered
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {getFilteredFavorites().length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <Heart className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No favorites yet</h3>
                <p className="text-gray-500 mb-6 text-center">
                  {activeTab === 'all' 
                    ? "You haven't added any meals to your favorites yet." 
                    : "No meals match the selected filter."}
                </p>
                <Button onClick={() => router.push("/meals")} className="bg-green-500 hover:bg-green-600">
                  Browse Meals
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredFavorites().map((favorite) => (
                <Card key={favorite.id} className="overflow-hidden group">
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    {favorite.meal.image_url ? (
                      <Image
                        src={favorite.meal.image_url}
                        alt={favorite.meal.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-400">
                        <span className="text-white font-bold text-2xl">
                          {favorite.meal.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    {/* Food type badge */}
                    <div className="absolute top-3 left-3">
                      <Badge
                        className={cn(
                          "px-2 py-1 shadow-sm",
                          favorite.meal.food_type
                            ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-100 border-red-200"
                        )}
                      >
                        {favorite.meal.food_type ? "Veg" : "Non-Veg"}
                      </Badge>
                    </div>
                    
                    {/* Category badge */}
                    <div className="absolute top-3 right-3">
                      <Badge variant="outline" className="bg-white/90 shadow-sm backdrop-blur-sm">
                        {getCategoryName(favorite.meal.category_id)}
                      </Badge>
                    </div>
                    
                    {/* Unavailable overlay */}
                    {!favorite.meal.is_available && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                        <Badge variant="destructive" className="text-sm px-3 py-1.5 font-medium">
                          Currently Unavailable
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{favorite.meal.name}</CardTitle>
                      <span className="font-bold text-green-600">₹{favorite.meal.price.toFixed(2)}</span>
                    </div>
                    <CardDescription className="flex items-center">
                      <Utensils className="h-3.5 w-3.5 mr-1 text-gray-400" />
                      <span>{favorite.meal.calories} calories</span>
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pb-4">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">
                          {favorite.last_ordered 
                            ? `Last ordered ${formatDistanceToNow(new Date(favorite.last_ordered))} ago` 
                            : 'Never ordered'}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <BarChart2 className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">
                          {favorite.order_count === 0 
                            ? 'Never ordered' 
                            : `Ordered ${favorite.order_count} ${favorite.order_count === 1 ? 'time' : 'times'}`}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">
                          Added {format(new Date(favorite.created_at), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => removeFavorite(favorite.meal_id)}
                      className="flex-1"
                    >
                      <Heart className="h-4 w-4 mr-2 fill-red-500 text-red-500" />
                      Remove
                    </Button>
                    
                    <Button 
                      className="flex-1 bg-green-500 hover:bg-green-600"
                      onClick={() => router.push(`/meals?meal=${favorite.meal_id}`)}
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Order
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Dashboard section */}
      {favoritesWithHistory.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Your Ordering Patterns</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Most Ordered</CardTitle>
                <CardDescription>Your favorite meal by orders</CardDescription>
              </CardHeader>
              <CardContent>
                {favoritesWithHistory
                  .filter(fav => fav.order_count > 0)
                  .sort((a, b) => b.order_count - a.order_count)
                  .slice(0, 1)
                  .map(fav => (
                    <div key={fav.id} className="flex items-center">
                      <div className="relative h-12 w-12 rounded-md overflow-hidden mr-3 flex-shrink-0">
                        {fav.meal.image_url ? (
                          <Image
                            src={fav.meal.image_url}
                            alt={fav.meal.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-400">
                            <span className="text-white font-bold">
                              {fav.meal.name.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{fav.meal.name}</p>
                        <p className="text-sm text-gray-500">Ordered {fav.order_count} times</p>
                      </div>
                    </div>
                  ))}
                {favoritesWithHistory.filter(fav => fav.order_count > 0).length === 0 && (
                  <p className="text-sm text-gray-500">You haven't ordered any favorites yet</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Recently Ordered</CardTitle>
                <CardDescription>Your latest order from favorites</CardDescription>
              </CardHeader>
              <CardContent>
                {favoritesWithHistory
                  .filter(fav => fav.last_ordered)
                  .sort((a, b) => {
                    if (!a.last_ordered) return 1
                    if (!b.last_ordered) return -1
                    return new Date(b.last_ordered).getTime() - new Date(a.last_ordered).getTime()
                  })
                  .slice(0, 1)
                  .map(fav => (
                    <div key={fav.id} className="flex items-center">
                      <div className="relative h-12 w-12 rounded-md overflow-hidden mr-3 flex-shrink-0">
                        {fav.meal.image_url ? (
                          <Image
                            src={fav.meal.image_url}
                            alt={fav.meal.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-400">
                            <span className="text-white font-bold">
                              {fav.meal.name.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{fav.meal.name}</p>
                        <p className="text-sm text-gray-500">
                          {fav.last_ordered && formatDistanceToNow(new Date(fav.last_ordered))} ago
                        </p>
                      </div>
                    </div>
                  ))}
                {favoritesWithHistory.filter(fav => fav.last_ordered).length === 0 && (
                  <p className="text-sm text-gray-500">You haven't ordered any favorites yet</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Never Ordered</CardTitle>
                <CardDescription>Favorites you haven't tried yet</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{favoritesWithHistory.filter(fav => fav.order_count === 0).length} favorites</p>
                <p className="text-sm text-gray-500">You haven't ordered these meals yet</p>
                {favoritesWithHistory.filter(fav => fav.order_count === 0).length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 w-full"
                    onClick={() => setActiveTab('not-ordered')}
                  >
                    View All <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Order Distribution</CardTitle>
              <CardDescription>How frequently you order your favorite meals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-12 bg-gray-100 rounded-lg overflow-hidden flex">
                {/* Order frequency visualization */}
                {(() => {
                  const totalOrders = favoritesWithHistory.reduce((acc, fav) => acc + fav.order_count, 0)
                  if (totalOrders === 0) {
                    return (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                        <Ban className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-500">No orders yet</span>
                      </div>
                    )
                  }
                  
                  // Group by meals and calculate percentages
                  return favoritesWithHistory
                    .filter(fav => fav.order_count > 0)
                    .sort((a, b) => b.order_count - a.order_count)
                    .map(fav => {
                      const percentage = (fav.order_count / totalOrders) * 100
                      return (
                        <div 
                          key={fav.id}
                          className="h-full flex items-center justify-center text-white text-xs"
                          style={{ 
                            width: `${percentage}%`, 
                            backgroundColor: getColorForIndex(favoritesWithHistory.indexOf(fav)),
                            minWidth: percentage < 5 ? '5%' : undefined
                          }}
                          title={`${fav.meal.name}: ${fav.order_count} orders (${percentage.toFixed(1)}%)`}
                        >
                          {percentage >= 10 && fav.meal.name.substring(0, 3)}
                        </div>
                      )
                    })
                })()}
              </div>
              
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {favoritesWithHistory
                  .filter(fav => fav.order_count > 0)
                  .sort((a, b) => b.order_count - a.order_count)
                  .slice(0, 8)
                  .map((fav, index) => (
                    <div key={fav.id} className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: getColorForIndex(index) }}
                      ></div>
                      <span className="text-xs truncate" title={fav.meal.name}>
                        {fav.meal.name}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="mt-8 text-center">
        <Button 
          variant="outline" 
          onClick={() => router.push('/meals')}
          className="mx-auto"
        >
          Browse more meals <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Helper function to get a color based on index
function getColorForIndex(index: number): string {
  const colors = [
    '#4ade80', // green-400
    '#22c55e', // green-500
    '#16a34a', // green-600
    '#15803d', // green-700
    '#166534', // green-800
    '#14532d', // green-900
    '#059669', // emerald-600
    '#047857'  // emerald-700
  ]
  return colors[index % colors.length]
}
