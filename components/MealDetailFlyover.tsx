"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetClose
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Leaf, Utensils, Clock, Flame, Loader2, AlertTriangle, X, Plus, ShoppingCart, Dumbbell, Heart, Info, Zap, Minus } from 'lucide-react';
import Image from "next/image";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

type MealDetailFlyoverProps = {
    mealId: string | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onAddToCart: (meal: any) => void;
};

export default function MealDetailFlyover({
                                              mealId,
                                              isOpen,
                                              onOpenChange,
                                              onAddToCart
                                          }: MealDetailFlyoverProps) {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [meal, setMeal] = useState<any>(null);
    const [ingredients, setIngredients] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState("overview");
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        async function fetchMealDetails() {
            if (!mealId) return;

            setLoading(true);
            try {
                // Fetch meal details
                const { data: mealData, error: mealError } = await supabase
                    .from("meals")
                    .select(`
            *,
            meal_categories(name),
            dietary_types(name)
          `)
                    .eq("id", mealId)
                    .single();

                if (mealError) throw mealError;
                setMeal(mealData);

                // Fetch meal ingredients
                const { data: ingredientsData, error: ingredientsError } = await supabase
                    .from("meal_ingredients")
                    .select(`
            id,
            quantity_grams,
            ingredients (
              id,
              name,
              calories_per_100g,
              protein_per_100g,
              carbs_per_100g,
              fat_per_100g,
              is_allergen
            )
          `)
                    .eq("meal_id", mealId);

                if (ingredientsError) throw ingredientsError;
                setIngredients(ingredientsData || []);
            } catch (error) {
                console.error("Error fetching meal details:", error);
                toast.error("Failed to load meal details");
            } finally {
                setLoading(false);
            }
        }

        if (isOpen && mealId) {
            fetchMealDetails();
            setQuantity(1); // Reset quantity when opening a new meal
        }
    }, [supabase, mealId, isOpen]);

    const getSpiceLevelLabel = (level: number) => {
        switch (level) {
            case 1: return "Very Mild";
            case 2: return "Mild";
            case 3: return "Medium";
            case 4: return "Spicy";
            case 5: return "Very Spicy";
            default: return "Medium";
        }
    };

    const renderNutritionBar = (value: number, max: number, color: string) => {
        const percentage = Math.min((value / max) * 100, 100);
        return (
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className={`h-2 rounded-full ${color}`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        );
    };

    const handleAddToCart = () => {
        if (meal) {
            // Add the meal to cart with the selected quantity
            for (let i = 0; i < quantity; i++) {
                onAddToCart(meal);
            }
            toast.success(`Added ${quantity} ${meal.name} to cart`);
            onOpenChange(false);
        }
    };

    const incrementQuantity = () => setQuantity(prev => prev + 1);
    const decrementQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col h-full">
                <SheetHeader className="p-4 border-b">
                    <div className="flex justify-between items-center">
                        <SheetTitle>Meal Details</SheetTitle>
                        <SheetClose className="rounded-full h-8 w-8 flex items-center justify-center">
                            <X className="h-4 w-4" />
                        </SheetClose>
                    </div>
                </SheetHeader>

                {loading ? (
                    <div className="flex-1 flex justify-center items-center">
                        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                    </div>
                ) : !meal ? (
                    <div className="flex-1 flex flex-col justify-center items-center p-6 text-center">
                        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
                        <h3 className="text-lg font-medium">Meal not found</h3>
                        <p className="text-muted-foreground mt-2">The requested meal could not be found</p>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="relative h-56 bg-gray-100">
                            {meal.image_url ? (
                                <Image
                                    src={meal.image_url || "/placeholder.svg"}
                                    alt={meal.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-400">
                                    <span className="text-white text-3xl font-bold">{meal.name.substring(0, 2).toUpperCase()}</span>
                                </div>
                            )}
                            <div className="absolute top-2 right-2 flex flex-col gap-2">
                                {meal.food_type !== null && (
                                    <Badge className={meal.food_type ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                        {meal.food_type ? "Vegetarian" : "Non-Vegetarian"}
                                    </Badge>
                                )}
                                {!meal.is_available && (
                                    <Badge variant="destructive">Currently Unavailable</Badge>
                                )}
                            </div>
                        </div>

                        <div className="p-4">
                            <div className="flex justify-between items-start">
                                <h2 className="text-xl font-bold">{meal.name}</h2>
                                <div className="text-xl font-bold text-green-600">₹{meal.price.toFixed(2)}</div>
                            </div>

                            <p className="text-muted-foreground mt-1 mb-3">{meal.description}</p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {meal.meal_categories && (
                                    <Badge variant="outline">{meal.meal_categories.name}</Badge>
                                )}
                                {meal.dietary_types && (
                                    <Badge variant="outline">{meal.dietary_types.name}</Badge>
                                )}
                                {meal.spice_level && (
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        <Flame className="h-3 w-3 text-orange-500" />
                                        {getSpiceLevelLabel(meal.spice_level)}
                                    </Badge>
                                )}
                                {meal.cooking_time_minutes && (
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {meal.cooking_time_minutes} min
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                            <TabsList className="px-4 justify-start border-b rounded-none">
                                <TabsTrigger value="overview" className="flex items-center gap-1">
                                    <Info className="h-4 w-4" />
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger value="nutrition" className="flex items-center gap-1">
                                    <Dumbbell className="h-4 w-4" />
                                    Nutrition
                                </TabsTrigger>
                                <TabsTrigger value="ingredients" className="flex items-center gap-1">
                                    <Leaf className="h-4 w-4" />
                                    Ingredients
                                </TabsTrigger>
                            </TabsList>

                            <ScrollArea className="flex-1">
                                <TabsContent value="overview" className="p-4 mt-0">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                                                <div className="text-2xl font-bold">{meal.calories}</div>
                                                <div className="text-xs text-muted-foreground">Calories</div>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                                                <div className="text-2xl font-bold">{meal.protein}g</div>
                                                <div className="text-xs text-muted-foreground">Protein</div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="font-medium mb-2 flex items-center gap-2">
                                                <Heart className="h-4 w-4 text-red-500" />
                                                Health Benefits
                                            </h3>
                                            <ul className="space-y-2 text-sm">
                                                <li className="flex items-start gap-2">
                                                    <Zap className="h-4 w-4 text-amber-500 mt-0.5" />
                                                    <span>
                            {meal.protein > 20
                                ? "High in protein, great for muscle recovery and growth"
                                : "Contains essential proteins for daily nutrition"}
                          </span>
                                                </li>
                                                {meal.carbs < 30 && (
                                                    <li className="flex items-start gap-2">
                                                        <Zap className="h-4 w-4 text-amber-500 mt-0.5" />
                                                        <span>Low in carbohydrates, suitable for low-carb diets</span>
                                                    </li>
                                                )}
                                                {meal.fiber > 5 && (
                                                    <li className="flex items-start gap-2">
                                                        <Zap className="h-4 w-4 text-amber-500 mt-0.5" />
                                                        <span>Good source of dietary fiber for digestive health</span>
                                                    </li>
                                                )}
                                                {meal.calories < 500 && (
                                                    <li className="flex items-start gap-2">
                                                        <Zap className="h-4 w-4 text-amber-500 mt-0.5" />
                                                        <span>Low calorie option, ideal for weight management</span>
                                                    </li>
                                                )}
                                            </ul>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="font-medium mb-2">Recommended For</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {meal.calories < 500 && (
                                                    <Badge className="bg-blue-100 text-blue-800">Weight Loss</Badge>
                                                )}
                                                {meal.protein > 25 && (
                                                    <Badge className="bg-purple-100 text-purple-800">Muscle Building</Badge>
                                                )}
                                                {meal.calories >= 500 && meal.calories <= 700 && (
                                                    <Badge className="bg-green-100 text-green-800">Maintenance</Badge>
                                                )}
                                                {meal.calories > 700 && (
                                                    <Badge className="bg-amber-100 text-amber-800">Bulking</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="nutrition" className="p-4 mt-0">
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                                                <div className="text-2xl font-bold">{meal.calories}</div>
                                                <div className="text-xs text-muted-foreground">Calories</div>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                                                <div className="text-2xl font-bold">{meal.protein}g</div>
                                                <div className="text-xs text-muted-foreground">Protein</div>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                                                <div className="text-2xl font-bold">{meal.carbs}g</div>
                                                <div className="text-xs text-muted-foreground">Carbs</div>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                                                <div className="text-2xl font-bold">{meal.fat}g</div>
                                                <div className="text-xs text-muted-foreground">Fat</div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-sm font-medium">Protein</span>
                                                    <span className="text-sm text-muted-foreground">{meal.protein}g</span>
                                                </div>
                                                {renderNutritionBar(meal.protein, 50, "bg-blue-500")}
                                            </div>

                                            <div>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-sm font-medium">Carbohydrates</span>
                                                    <span className="text-sm text-muted-foreground">{meal.carbs}g</span>
                                                </div>
                                                {renderNutritionBar(meal.carbs, 100, "bg-amber-500")}
                                            </div>

                                            <div>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-sm font-medium">Fat</span>
                                                    <span className="text-sm text-muted-foreground">{meal.fat}g</span>
                                                </div>
                                                {renderNutritionBar(meal.fat, 50, "bg-red-500")}
                                            </div>

                                            {meal.fiber && (
                                                <div>
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-sm font-medium">Fiber</span>
                                                        <span className="text-sm text-muted-foreground">{meal.fiber}g</span>
                                                    </div>
                                                    {renderNutritionBar(meal.fiber, 25, "bg-green-500")}
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="font-medium mb-2">Macronutrient Ratio</h3>
                                            <div className="flex h-4 rounded-md overflow-hidden">
                                                {meal.protein && meal.carbs && meal.fat && (
                                                    <>
                                                        <div
                                                            className="bg-blue-500 h-full"
                                                            style={{
                                                                width: `${(meal.protein * 4) / ((meal.protein * 4) + (meal.carbs * 4) + (meal.fat * 9)) * 100}%`
                                                            }}
                                                        ></div>
                                                        <div
                                                            className="bg-amber-500 h-full"
                                                            style={{
                                                                width: `${(meal.carbs * 4) / ((meal.protein * 4) + (meal.carbs * 4) + (meal.fat * 9)) * 100}%`
                                                            }}
                                                        ></div>
                                                        <div
                                                            className="bg-red-500 h-full"
                                                            style={{
                                                                width: `${(meal.fat * 9) / ((meal.protein * 4) + (meal.carbs * 4) + (meal.fat * 9)) * 100}%`
                                                            }}
                                                        ></div>
                                                    </>
                                                )}
                                            </div>
                                            <div className="flex justify-between text-xs mt-1">
                                                <span className="text-blue-500">Protein</span>
                                                <span className="text-amber-500">Carbs</span>
                                                <span className="text-red-500">Fat</span>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="ingredients" className="p-4 mt-0">
                                    {ingredients.length === 0 ? (
                                        <div className="text-center py-6 text-muted-foreground">
                                            No ingredients information available
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {ingredients.map((item) => (
                                                <div key={item.id} className="flex items-start p-3 bg-gray-50 rounded-md">
                                                    <div className="flex-1">
                                                        <div className="font-medium flex items-center">
                                                            {item.ingredients.name}
                                                            {item.ingredients.is_allergen && (
                                                                <Badge className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100">
                                                                    Allergen
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground mt-1">
                                                            {item.quantity_grams}g
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm font-medium">
                                                            {((item.ingredients.calories_per_100g * item.quantity_grams) / 100).toFixed(0)} kcal
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            P: {((item.ingredients.protein_per_100g * item.quantity_grams) / 100).toFixed(1)}g |
                                                            C: {((item.ingredients.carbs_per_100g * item.quantity_grams) / 100).toFixed(1)}g |
                                                            F: {((item.ingredients.fat_per_100g * item.quantity_grams) / 100).toFixed(1)}g
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>
                            </ScrollArea>
                        </Tabs>

                        {meal.is_available && (
                            <div className="p-4 border-t bg-gray-50">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 rounded-full"
                                            onClick={decrementQuantity}
                                        >
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="mx-3 font-medium">{quantity}</span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 rounded-full"
                                            onClick={incrementQuantity}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <div className="font-medium">
                                        Total: ₹{(meal.price * quantity).toFixed(2)}
                                    </div>
                                </div>

                                <Button
                                    onClick={handleAddToCart}
                                    className="w-full bg-green-500 hover:bg-green-600 h-12"
                                >
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    Add to Cart
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
