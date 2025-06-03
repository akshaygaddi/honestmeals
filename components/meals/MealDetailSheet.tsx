"use client"

import { useState } from "react"
import Image from "next/image"
import { 
  Heart, X, Clock, Dumbbell, Leaf, Flame, 
  Plus, Minus, Share2, ChevronLeft, ChevronRight, Star
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Meal } from "@/types/meals"

interface MealDetailSheetProps {
  meal: Meal | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (meal: Meal) => void
  onRemoveFromCart: (mealId: string) => void
  getCartQuantity: (mealId: string) => number
  getCategoryName: (categoryId: string) => string
  isFavorite: boolean
  onToggleFavorite: (mealId: string) => void
  renderSpiceLevel?: (level: number | null) => React.ReactNode
}

export function MealDetailSheet({
  meal,
  isOpen,
  onClose,
  onAddToCart,
  onRemoveFromCart,
  getCartQuantity,
  getCategoryName,
  isFavorite,
  onToggleFavorite,
  renderSpiceLevel
}: MealDetailSheetProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const mealRating = 4.5 // Sample rating
  
  if (!meal) return null
  
  // For demo, we'll use the same image for multiple slides
  const images = [
    meal.image_url || "/placeholder.svg",
    meal.image_url || "/placeholder.svg",
    meal.image_url || "/placeholder.svg"
  ]
  
  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length)
  }
  
  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }
  
  const cartQuantity = getCartQuantity(meal.id)
  
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 overflow-y-auto">
        <div className="flex flex-col h-full">
          {/* Image gallery */}
          <div className="relative h-72 sm:h-96 bg-gray-100">
            {meal.image_url ? (
              <div className="relative w-full h-full">
                <Image
                  src={images[activeImageIndex]}
                  alt={meal.name}
                  fill
                  className="object-cover"
                />
                
                {images.length > 1 && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        prevImage()
                      }}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        nextImage()
                      }}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                    
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          className={cn(
                            "w-2 h-2 rounded-full transition-all",
                            i === activeImageIndex ? "bg-white w-4" : "bg-white/60"
                          )}
                          onClick={() => setActiveImageIndex(i)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-400">
                <span className="text-white font-bold text-4xl">
                  {meal.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-white/80 hover:bg-white rounded-full shadow-sm z-10"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="absolute top-4 left-4 z-10">
              <Badge
                className={cn(
                  "px-2 py-1 shadow-sm",
                  meal.food_type
                    ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
                    : "bg-red-100 text-red-800 hover:bg-red-100 border-red-200"
                )}
              >
                {meal.food_type ? "Vegetarian" : "Non-Vegetarian"}
              </Badge>
            </div>
            
            <div className="absolute bottom-4 right-4 flex gap-2 z-10">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-full shadow-sm transition-all backdrop-blur-sm",
                  isFavorite
                    ? "bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600"
                    : "bg-white/80 hover:bg-white text-gray-400 hover:text-gray-500"
                )}
                onClick={() => meal && onToggleFavorite(meal.id)}
              >
                <Heart className={cn("h-5 w-5", isFavorite && "fill-red-500")} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-white/80 hover:bg-white shadow-sm"
                onClick={() => {
                  navigator.share({
                    title: meal.name,
                    text: meal.description || `Check out this ${getCategoryName(meal.category_id)}!`,
                    url: window.location.href,
                  }).catch(() => {
                    // Fallback if Web Share API is not supported
                    navigator.clipboard.writeText(window.location.href)
                    alert("Link copied to clipboard!")
                  })
                }}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="p-6 flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{meal.name}</h2>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <Badge variant="outline" className="mr-2 bg-gray-50">
                    {getCategoryName(meal.category_id)}
                  </Badge>
                  {meal.cooking_time_minutes && (
                    <div className="flex items-center mr-3">
                      <Clock className="h-4 w-4 mr-1" />
                      {meal.cooking_time_minutes} min
                    </div>
                  )}
                  {meal.spice_level && renderSpiceLevel && (
                    <div className="flex items-center">
                      <span className="mr-1">Spice:</span>
                      {renderSpiceLevel(meal.spice_level)}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-xl font-bold text-green-600">₹{meal.price.toFixed(2)}</div>
            </div>
            
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 opacity-50" />
                <span className="ml-2 text-sm font-medium">{mealRating}</span>
              </div>
              <span className="text-xs text-gray-500 ml-2">(124 reviews)</span>
            </div>
            
            <Tabs defaultValue="details" className="mb-6">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                <TabsTrigger value="benefits">Benefits</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                {meal.description && (
                  <div>
                    <p className="text-gray-700 leading-relaxed">{meal.description}</p>
                  </div>
                )}
                
                <div className="bg-amber-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-amber-800 mb-2">Allergen Information</h3>
                  <p className="text-sm text-amber-700">
                    May contain traces of nuts, dairy, and gluten. Please check with our staff if you have specific allergies.
                  </p>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Ingredients</h3>
                  <p className="text-sm text-gray-600">
                    Fresh local produce, premium quality protein, whole grains, and house-made sauces.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="nutrition" className="space-y-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-700">{meal.calories}</div>
                    <div className="text-xs text-blue-600">Calories</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-700">{meal.protein}g</div>
                    <div className="text-xs text-purple-600">Protein</div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-amber-700">{meal.carbs}g</div>
                    <div className="text-xs text-amber-600">Carbs</div>
                  </div>
                  <div className="bg-pink-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-pink-700">{meal.fat}g</div>
                    <div className="text-xs text-pink-600">Fat</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Fiber</span>
                    <span className="text-sm font-medium">{meal.fiber || 0}g</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sugar</span>
                    <span className="text-sm font-medium">3g</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sodium</span>
                    <span className="text-sm font-medium">420mg</span>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="benefits" className="space-y-4">
                <div className="space-y-3">
                  {meal.protein > 20 && (
                    <div className="flex items-start p-3 bg-green-50 rounded-lg">
                      <div className="bg-green-100 p-2 rounded-full mr-3 mt-0.5">
                        <Dumbbell className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-green-800">High in protein</h4>
                        <p className="text-sm text-green-700 mt-1">
                          Supports muscle recovery and growth. Great for active lifestyles and fitness goals.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {meal.fiber && meal.fiber > 5 && (
                    <div className="flex items-start p-3 bg-green-50 rounded-lg">
                      <div className="bg-green-100 p-2 rounded-full mr-3 mt-0.5">
                        <Leaf className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-green-800">High in fiber</h4>
                        <p className="text-sm text-green-700 mt-1">
                          Supports digestive health and helps you feel fuller for longer.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {meal.calories < 500 && (
                    <div className="flex items-start p-3 bg-green-50 rounded-lg">
                      <div className="bg-green-100 p-2 rounded-full mr-3 mt-0.5">
                        <Flame className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-green-800">Low calorie</h4>
                        <p className="text-sm text-green-700 mt-1">
                          Great for weight management and calorie-conscious diets.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Default benefit if none of the above apply */}
                  {!(meal.protein > 20 || (meal.fiber && meal.fiber > 5) || meal.calories < 500) && (
                    <div className="flex items-start p-3 bg-green-50 rounded-lg">
                      <div className="bg-green-100 p-2 rounded-full mr-3 mt-0.5">
                        <Leaf className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-green-800">Balanced nutrition</h4>
                        <p className="text-sm text-green-700 mt-1">
                          Provides a good balance of macronutrients for a healthy diet.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-auto pt-4 border-t">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Button
                    variant={cartQuantity > 0 ? "default" : "outline"}
                    size="icon"
                    className={cn(
                      "h-10 w-10 rounded-full",
                      cartQuantity > 0 && "bg-green-500 hover:bg-green-600"
                    )}
                    onClick={() => {
                      if (cartQuantity > 0) {
                        onRemoveFromCart(meal.id)
                      }
                    }}
                    disabled={cartQuantity === 0 || !meal.is_available}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="mx-5 font-medium text-lg">{cartQuantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-green-50 border-green-200 hover:bg-green-100"
                    onClick={() => onAddToCart(meal)}
                    disabled={!meal.is_available}
                  >
                    <Plus className="h-4 w-4 text-green-600" />
                  </Button>
                </div>
                <Button
                  className={cn(
                    "bg-green-500 hover:bg-green-600 transition-colors px-6",
                    cartQuantity > 0 ? "bg-green-500" : "bg-green-500"
                  )}
                  size="lg"
                  onClick={() => onAddToCart(meal)}
                  disabled={!meal.is_available}
                >
                  {cartQuantity > 0 ? "Update Cart" : "Add to Cart"}
                </Button>
              </div>
              {!meal.is_available && (
                <div className="text-center text-red-500 font-medium">Currently unavailable</div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
} 