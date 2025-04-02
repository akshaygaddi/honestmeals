"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Leaf, Utensils, Clock, Flame, Loader2, AlertTriangle, ChevronLeft } from 'lucide-react';
import Image from "next/image";

type MealDetailViewProps = {
    mealId: string;
    onBack: () => void;
};

export default function MealDetailView({ mealId, onBack }: MealDetailViewProps) {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [meal, setMeal] = useState<any>(null);
    const [ingredients, setIngredients] = useState<any[]>([]);

    useEffect(() => {
        async function fetchMealDetails() {
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

        if (mealId) {
            fetchMealDetails();
        }
    }, [supabase, mealId]);

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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            </div>
        );
    }

    if (!meal) {
        return (
            <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
                <h3 className="text-lg font-medium">Meal not found</h3>
                <p className="text-muted-foreground mb-4">The requested meal could not be found</p>
                <Button onClick={onBack} variant="outline">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Meals
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Button onClick={onBack} variant="outline" className="mb-4">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Meals
            </Button>

            <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                    <Card>
                        <CardContent className="p-0">
                            <div className="aspect-square relative overflow-hidden rounded-t-lg">
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
                                <div className="absolute top-2 right-2">
                                    {meal.is_available ? (
                                        <Badge className="bg-green-500">Available</Badge>
                                    ) : (
                                        <Badge variant="destructive">Unavailable</Badge>
                                    )}
                                </div>
                            </div>

                            <div className="p-4">
                                <h2 className="text-xl font-bold">{meal.name}</h2>
                                <p className="text-muted-foreground text-sm mt-1">{meal.description}</p>

                                <div className="flex flex-wrap gap-2 mt-3">
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        {meal.food_type ? (
                                            <>
                                                <Leaf className="h-3 w-3 text-green-500" />
                                                <span>Vegetarian</span>
                                            </>
                                        ) : (
                                            <>
                                                <Utensils className="h-3 w-3 text-red-500" />
                                                <span>Non-Vegetarian</span>
                                            </>
                                        )}
                                    </Badge>

                                    {meal.meal_categories && (
                                        <Badge variant="secondary">{meal.meal_categories.name}</Badge>
                                    )}

                                    {meal.dietary_types && (
                                        <Badge variant="secondary">{meal.dietary_types.name}</Badge>
                                    )}
                                </div>

                                <div className="flex justify-between items-center mt-4">
                                    <div className="text-2xl font-bold text-green-600">₹{meal.price.toFixed(2)}</div>
                                    <div className="flex items-center gap-3">
                                        {meal.cooking_time_minutes && (
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Clock className="h-4 w-4 mr-1" />
                                                {meal.cooking_time_minutes} min
                                            </div>
                                        )}

                                        {meal.spice_level && (
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Flame className="h-4 w-4 mr-1 text-orange-500" />
                                                {getSpiceLevelLabel(meal.spice_level)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:w-2/3">
                    <Tabs defaultValue="nutrition">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                        </TabsList>

                        <TabsContent value="nutrition" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Nutritional Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                                            <div className="text-2xl font-bold">{meal.calories}</div>
                                            <div className="text-xs text-muted-foreground">Calories</div>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                                            <div className="text-2xl font-bold">{meal.protein}g</div>
                                            <div className="text-xs text-muted-foreground">Protein</div>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                                            <div className="text-2xl font-bold">{meal.carbs}g</div>
                                            <div className="text-xs text-muted-foreground">Carbs</div>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg text-center">
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
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="ingredients" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ingredients</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {ingredients.length === 0 ? (
                                        <div className="text-center py-6 text-muted-foreground">
                                            No ingredients information available
                                        </div>
                                    ) : (
                                        <ScrollArea className="h-[400px]">
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
                                        </ScrollArea>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
