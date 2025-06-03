"use client"

import { Leaf, Utensils, Flame, Dumbbell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { MealCategory, DietaryType } from "@/types/meals"
import { useState } from "react"

interface FilterSheetProps {
  isOpen: boolean
  onClose: () => void
  categories: MealCategory[]
  dietaryTypes: DietaryType[]
  selectedCategory: string | null
  setSelectedCategory: (value: string | null) => void
  selectedFoodType: boolean | null
  setSelectedFoodType: (value: boolean | null) => void
  selectedDietaryType: string | null
  setSelectedDietaryType: (value: string | null) => void
  calorieType: string
  setCalorieType: (value: string) => void
  priceRange: [number, number]
  setPriceRange: (value: [number, number]) => void
  showOnlyAvailable: boolean
  setShowOnlyAvailable: (value: boolean) => void
  clearFilters: () => void
}

export function FilterSheet({
  isOpen,
  onClose,
  categories,
  dietaryTypes,
  selectedCategory,
  setSelectedCategory,
  selectedFoodType,
  setSelectedFoodType,
  selectedDietaryType,
  setSelectedDietaryType,
  calorieType,
  setCalorieType,
  priceRange = [0, 1000], // Default price range
  setPriceRange,
  showOnlyAvailable,
  setShowOnlyAvailable,
  clearFilters
}: FilterSheetProps) {
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>(priceRange)
  
  const handlePriceChange = (value: number[]) => {
    setLocalPriceRange([value[0], value[1]])
  }
  
  const applyPriceFilter = () => {
    setPriceRange(localPriceRange)
  }
  
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4 border-b flex flex-row items-center justify-between">
          <SheetTitle>Filter Meals</SheetTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>

        <div className="py-6 space-y-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-3 flex items-center">
              <Utensils className="mr-2 h-4 w-4 text-gray-500" />
              Food Type
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                className={cn(
                  "justify-start px-3 font-normal h-auto py-2",
                  selectedFoodType === null && "bg-gray-100 border-gray-300"
                )}
                onClick={() => setSelectedFoodType(null)}
              >
                <span className="mr-2">🍽️</span>
                All Types
              </Button>
              <Button
                variant="outline"
                className={cn(
                  "justify-start px-3 font-normal h-auto py-2",
                  selectedFoodType === true && "bg-green-100 border-green-300 text-green-800"
                )}
                onClick={() => setSelectedFoodType(true)}
              >
                <span className="mr-2">🥗</span>
                Vegetarian
              </Button>
              <Button
                variant="outline"
                className={cn(
                  "justify-start px-3 font-normal h-auto py-2",
                  selectedFoodType === false && "bg-red-100 border-red-300 text-red-800"
                )}
                onClick={() => setSelectedFoodType(false)}
              >
                <span className="mr-2">🍖</span>
                Non-Veg
              </Button>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium text-gray-700 mb-3 flex items-center">
              <Flame className="mr-2 h-4 w-4 text-gray-500" />
              Calorie Range
            </h3>
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
            <h3 className="font-medium text-gray-700 mb-3 flex items-center">
              <span className="mr-2">🏷️</span>
              Meal Category
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant={selectedCategory === null ? "default" : "outline"} 
                className={cn("cursor-pointer px-3 py-1", 
                  selectedCategory === null ? "bg-green-500 hover:bg-green-600" : ""
                )}
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Badge>
              
              {categories.map((category) => (
                <Badge 
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"} 
                  className={cn("cursor-pointer px-3 py-1", 
                    selectedCategory === category.id ? "bg-green-500 hover:bg-green-600" : ""
                  )}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>
          
          {dietaryTypes.length > 0 && (
            <>
              <Separator />
              
              <div>
                <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                  <Leaf className="mr-2 h-4 w-4 text-gray-500" />
                  Dietary Preferences
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant={selectedDietaryType === null ? "default" : "outline"} 
                    className={cn("cursor-pointer px-3 py-1", 
                      selectedDietaryType === null ? "bg-green-500 hover:bg-green-600" : ""
                    )}
                    onClick={() => setSelectedDietaryType(null)}
                  >
                    All
                  </Badge>
                  
                  {dietaryTypes.map((dietType) => (
                    <Badge 
                      key={dietType.id}
                      variant={selectedDietaryType === dietType.id ? "default" : "outline"} 
                      className={cn("cursor-pointer px-3 py-1", 
                        selectedDietaryType === dietType.id ? "bg-green-500 hover:bg-green-600" : ""
                      )}
                      onClick={() => setSelectedDietaryType(dietType.id)}
                    >
                      {dietType.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
          
          <Separator />
          
          <div>
            <h3 className="font-medium text-gray-700 mb-3 flex items-center">
              <span className="mr-2">💰</span>
              Price Range
            </h3>
            <div className="px-2">
              <Slider
                defaultValue={[localPriceRange[0], localPriceRange[1]]}
                max={1000}
                step={50}
                value={[localPriceRange[0], localPriceRange[1]]}
                onValueChange={handlePriceChange}
                className="mb-6"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">₹{localPriceRange[0]}</span>
                <span className="text-sm text-gray-600">₹{localPriceRange[1]}</span>
              </div>
              <Button 
                onClick={applyPriceFilter} 
                variant="outline" 
                className="mt-2 w-full"
                size="sm"
              >
                Apply Price Filter
              </Button>
            </div>
          </div>
          
          <Separator />

          <div className="flex items-center justify-between">
            <Label htmlFor="available-only" className="cursor-pointer text-gray-700 font-medium">
              Show available meals only
            </Label>
            <Switch 
              id="available-only" 
              checked={showOnlyAvailable} 
              onCheckedChange={setShowOnlyAvailable} 
            />
          </div>

          <Separator />
          
          <div className="flex gap-3">
            <Button 
              onClick={clearFilters} 
              variant="outline" 
              className="flex-1 border-gray-200"
            >
              Clear All Filters
            </Button>
            <Button 
              onClick={onClose} 
              className="flex-1 bg-green-500 hover:bg-green-600"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
} 