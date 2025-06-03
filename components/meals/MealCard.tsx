"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, Heart, Clock, Plus, Star } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Meal } from "@/types/meals"

interface MealCardProps {
  meal: Meal
  isGridView: boolean
  isFavorite: boolean
  onAddToCart: (meal: Meal) => void
  onViewDetails: (meal: Meal) => void
  onToggleFavorite: (mealId: string) => void
  getCategoryName: (categoryId: string) => string
  renderSpiceLevel?: (level: number | null) => React.ReactNode
}

export function MealCard({
  meal,
  isGridView,
  isFavorite,
  onAddToCart,
  onViewDetails,
  onToggleFavorite,
  getCategoryName,
  renderSpiceLevel
}: MealCardProps) {
  const mealRating = 4.5; // Sample rating - this could come from a prop or calculated from reviews
  
  if (isGridView) {
    return (
      <Card className={cn(
        "group overflow-hidden h-full hover:shadow-lg transition-all duration-300 flex flex-col border-gray-100 relative",
        !meal.is_available && "opacity-75"
      )}>
        <div className="relative h-52 overflow-hidden bg-gray-100">
          {meal.image_url ? (
            <Image
              src={meal.image_url || "/placeholder.svg"}
              alt={meal.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-400">
              <span className="text-white font-bold text-xl">
                {meal.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          
          {/* Food type badge */}
          <div className="absolute top-3 left-3">
            <Badge
              className={cn(
                "px-2 py-1 shadow-sm",
                meal.food_type
                  ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
                  : "bg-red-100 text-red-800 hover:bg-red-100 border-red-200"
              )}
            >
              {meal.food_type ? "Veg" : "Non-Veg"}
            </Badge>
          </div>
          
          {/* Favorite button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute bottom-3 right-3 rounded-full shadow-sm transition-all",
              isFavorite
                ? "bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600"
                : "bg-white/80 hover:bg-white text-gray-400 hover:text-gray-500"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(meal.id);
            }}
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-red-500")} />
          </Button>
          
          {/* Unavailable overlay */}
          {!meal.is_available && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
              <Badge variant="destructive" className="text-sm px-3 py-1.5 font-medium">
                Currently Unavailable
              </Badge>
            </div>
          )}
          
          {/* Category badge */}
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className="bg-white/90 shadow-sm backdrop-blur-sm">
              {getCategoryName(meal.category_id)}
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-4 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-gray-800 line-clamp-1 text-lg">{meal.name}</h3>
            <span className="font-bold text-green-600">₹{meal.price.toFixed(2)}</span>
          </div>
          
          {/* Rating */}
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="ml-1 text-sm font-medium text-gray-700">{mealRating}</span>
            </div>
            {meal.cooking_time_minutes && (
              <div className="flex items-center ml-3 text-sm text-gray-500">
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>{meal.cooking_time_minutes} min</span>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">
            {meal.description || `A delicious ${getCategoryName(meal.category_id).toLowerCase()}`}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-4">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50 text-xs">
              {meal.calories} cal
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-50 text-xs">
              {meal.protein}g protein
            </Badge>
            {meal.spice_level && meal.spice_level > 0 && renderSpiceLevel && (
              <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50 text-xs">
                Spice: {renderSpiceLevel(meal.spice_level)}
              </Badge>
            )}
          </div>

          <div className="flex gap-2 mt-auto">
            <Button 
              onClick={() => onViewDetails(meal)} 
              variant="outline" 
              className="flex-1 text-sm border-gray-200 hover:bg-gray-50"
            >
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              Details
            </Button>
            <Button
              onClick={() => onAddToCart(meal)}
              className="flex-1 bg-green-500 hover:bg-green-600 transition-colors text-sm"
              disabled={!meal.is_available}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  // List view
  return (
    <Card className={cn(
      "group overflow-hidden hover:shadow-md transition-all duration-300 border-gray-100",
      !meal.is_available && "opacity-75"
    )}>
      <div className="flex flex-col sm:flex-row">
        <div className="relative w-full sm:w-56 h-44 sm:h-auto bg-gray-100 flex-shrink-0 overflow-hidden">
          {meal.image_url ? (
            <Image
              src={meal.image_url || "/placeholder.svg"}
              alt={meal.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-400">
              <span className="text-white font-bold text-xl">
                {meal.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          
          <div className="absolute top-3 left-3">
            <Badge
              className={cn(
                "px-2 py-1 shadow-sm",
                meal.food_type
                  ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
                  : "bg-red-100 text-red-800 hover:bg-red-100 border-red-200"
              )}
            >
              {meal.food_type ? "Veg" : "Non-Veg"}
            </Badge>
          </div>
          
          {!meal.is_available && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
              <Badge variant="destructive" className="text-sm px-3 py-1.5 font-medium">
                Currently Unavailable
              </Badge>
            </div>
          )}
        </div>
        
        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-800 text-lg">{meal.name}</h3>
                <Badge variant="outline" className="bg-gray-50">
                  {getCategoryName(meal.category_id)}
                </Badge>
              </div>
              
              <div className="flex items-center mt-1">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="ml-1 text-sm font-medium text-gray-700">{mealRating}</span>
                </div>
                {meal.cooking_time_minutes && (
                  <div className="flex items-center ml-3 text-sm text-gray-500">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    <span>{meal.cooking_time_minutes} min</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-green-600 text-lg">₹{meal.price.toFixed(2)}</span>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-full",
                  isFavorite
                    ? "text-red-500 hover:text-red-600 hover:bg-red-50"
                    : "text-gray-400 hover:text-gray-500"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(meal.id);
                }}
              >
                <Heart className={cn("h-4 w-4", isFavorite && "fill-red-500")} />
              </Button>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {meal.description || `A delicious ${getCategoryName(meal.category_id).toLowerCase()}`}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-4">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50 text-xs">
              {meal.calories} cal
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-50 text-xs">
              {meal.protein}g protein
            </Badge>
            {meal.carbs && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50 text-xs">
                {meal.carbs}g carbs
              </Badge>
            )}
            {meal.fat && (
              <Badge variant="outline" className="bg-pink-50 text-pink-700 hover:bg-pink-50 text-xs">
                {meal.fat}g fat
              </Badge>
            )}
            {meal.spice_level && meal.spice_level > 0 && renderSpiceLevel && (
              <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50 text-xs">
                Spice: {renderSpiceLevel(meal.spice_level)}
              </Badge>
            )}
          </div>

          <div className="flex gap-2 mt-auto">
            <Button 
              onClick={() => onViewDetails(meal)} 
              variant="outline" 
              size="sm"
              className="border-gray-200 hover:bg-gray-50"
            >
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              Details
            </Button>
            <Button
              onClick={() => onAddToCart(meal)}
              className="bg-green-500 hover:bg-green-600 transition-colors"
              size="sm"
              disabled={!meal.is_available}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add to Cart
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  )
} 