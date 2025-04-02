"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "react-hot-toast"
import { Plus, Search, Edit, Trash2, Loader2, Filter, Leaf, Utensils, Eye } from "lucide-react"
import Image from "next/image"
import AddMealForm from "@/components/admin/add-meal-form"
import MealDetailView from "@/components/admin/meal-detail-view"

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

export default function AdminMeals() {
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(true);
    const [meals, setMeals] = useState<Meal[]>([]);
    const [filteredMeals, setFilteredMeals] = useState<Meal[]>([]);
    const [categories, setCategories] = useState<MealCategory[]>([]);
    const [dietaryTypes, setDietaryTypes] = useState<DietaryType[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedFoodType, setSelectedFoodType] = useState<boolean | null>(null);
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentMeal, setCurrentMeal] = useState<Meal | null>(null);
    const [selectedMealId, setSelectedMealId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // Fetch meals
                const { data: mealsData, error: mealsError } = await supabase
                    .from("meals")
                    .select("*")
                    .order("name");

                if (mealsError) throw mealsError;
                setMeals(mealsData || []);


                // Fetch categories
                const { data: categoriesData, error: categoriesError } = await supabase
                    .from("meal_categories")
                    .select("*")
                    .order("name");


                if (categoriesError) throw categoriesError;
                setCategories(categoriesData || []);

                // Fetch dietary types
                const { data: dietaryTypesData, error: dietaryTypesError } = await supabase
                    .from("dietary_types")
                    .select("*")
                    .order("name");

                if (dietaryTypesError) throw dietaryTypesError;
                setDietaryTypes(dietaryTypesData || []);

                // Log to debug
                console.log("Fetched Meals:", mealsData);
                console.log("Fetched Categories:", categoriesData);
                console.log("Fetched Dietary Types:", dietaryTypesData);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("An error occurred while loading data");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [supabase]);

    useEffect(() => {
        let filtered = [...meals]
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(
                (meal) =>
                    meal.name.toLowerCase().includes(query) ||
                    (meal.description && meal.description.toLowerCase().includes(query)),
            )
        }
        if (selectedCategory) {
            filtered = filtered.filter((meal) => meal.category_id === selectedCategory)
        }
        if (selectedFoodType !== null) {
            filtered = filtered.filter((meal) => meal.food_type === selectedFoodType)
        }
        if (showOnlyAvailable) {
            filtered = filtered.filter((meal) => meal.is_available)
        }
        setFilteredMeals(filtered)
    }, [meals, searchQuery, selectedCategory, selectedFoodType, showOnlyAvailable])

    const handleAddMeal = async (formData: any) => {
        setIsSubmitting(true);
        try {
            const { data: mealData, error: mealError } = await supabase
                .from("meals")
                .insert({
                    name: formData.name,
                    description: formData.description || null,
                    price: formData.price,
                    calories: formData.calories,
                    protein: formData.protein,
                    carbs: formData.carbs || null,
                    fat: formData.fat || null,
                    fiber: formData.fiber || null,
                    image_url: formData.image_url || null,
                    category_id: formData.category_id,
                    dietary_type_id: formData.dietary_type_id || null,
                    food_type: formData.food_type,
                    is_available: formData.is_available ?? true,
                    spice_level: formData.spice_level || null,
                    cooking_time_minutes: formData.cooking_time_minutes || null,
                })
                .select()
                .single();

            if (mealError) throw mealError;

            toast.success("Meal added successfully");
            setIsAddDialogOpen(false);

            const { data: mealsData } = await supabase.from("meals").select("*").order("name");
            setMeals(mealsData || []);
        } catch (error) {
            console.error("Error adding meal:", error);
            toast.error("An error occurred while adding the meal");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditMeal = (meal: Meal) => {
        setCurrentMeal(meal);
        setIsEditDialogOpen(true);
    };

    const handleUpdateMeal = async (formData: any) => {
        if (!currentMeal) return

        setIsSubmitting(true)

        try {
            // Update the meal
            const { error: mealError } = await supabase
                .from("meals")
                .update({
                    name: formData.name,
                    description: formData.description || null,
                    price: formData.price,
                    calories: formData.calories,
                    protein: formData.protein,
                    carbs: formData.carbs,
                    fat: formData.fat,
                    fiber: formData.fiber || null,
                    image_url: formData.image_url || null,
                    category_id: formData.category_id,
                    dietary_type_id: formData.dietary_type_id || null,
                    food_type: formData.food_type,
                    is_available: formData.is_available,
                    spice_level: formData.spice_level || null,
                    cooking_time_minutes: formData.cooking_time_minutes || null,
                })
                .eq("id", currentMeal.id)

            if (mealError) {
                throw mealError
            }

            // Delete existing meal ingredients
            const { error: deleteError } = await supabase.from("meal_ingredients").delete().eq("meal_id", currentMeal.id)

            if (deleteError) {
                throw deleteError
            }

            // Insert new meal ingredients
            if (formData.ingredients && formData.ingredients.length > 0) {
                const mealIngredients = formData.ingredients.map((item: any) => ({
                    meal_id: currentMeal.id,
                    ingredient_id: item.ingredient_id,
                    quantity_grams: item.quantity_grams,
                }))

                const { error: ingredientsError } = await supabase.from("meal_ingredients").insert(mealIngredients)

                if (ingredientsError) {
                    throw ingredientsError
                }
            }

            toast.success("Meal updated successfully")
            setIsEditDialogOpen(false)

            // Refresh meals list
            const { data: mealsData } = await supabase.from("meals").select("*").order("name")
            setMeals(mealsData || [])
        } catch (error) {
            console.error("Error updating meal:", error)
            toast.error("An error occurred while updating the meal")
        } finally {
            setIsSubmitting(false)
            setCurrentMeal(null)
        }
    }

    const handleDeleteClick = (meal: Meal) => {
        setCurrentMeal(meal)
        setIsDeleteDialogOpen(true)
    }

    const handleDeleteMeal = async () => {
        if (!currentMeal) return

        setIsSubmitting(true)

        try {
            // Delete meal ingredients first (due to foreign key constraints)
            const { error: ingredientsError } = await supabase.from("meal_ingredients").delete().eq("meal_id", currentMeal.id)

            if (ingredientsError) {
                throw ingredientsError
            }

            // Then delete the meal
            const { error: mealError } = await supabase.from("meals").delete().eq("id", currentMeal.id)

            if (mealError) {
                throw mealError
            }

            toast.success("Meal deleted successfully")
            setIsDeleteDialogOpen(false)

            // Refresh meals list
            const { data: mealsData } = await supabase.from("meals").select("*").order("name")
            setMeals(mealsData || [])
        } catch (error) {
            console.error("Error deleting meal:", error)
            toast.error("An error occurred while deleting the meal")
        } finally {
            setIsSubmitting(false)
            setCurrentMeal(null)
        }
    }

    const handleViewMeal = (mealId: string) => {
        setSelectedMealId(mealId)
        setIsDetailViewOpen(true)
    }

    const getCategoryName = (categoryId: string) => {
        const category = categories.find((cat) => cat.id === categoryId)
        return category ? category.name : "Unknown Category"
    }

    if (isDetailViewOpen && selectedMealId) {
        return (
            <MealDetailView
                mealId={selectedMealId}
                onBack={() => {
                    setIsDetailViewOpen(false)
                    setSelectedMealId(null)
                }}
            />
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Meals Management</h1>
                    <p className="text-muted-foreground">Manage your menu items with detailed nutritional information</p>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)} className="bg-green-500 hover:bg-green-600">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Meal
                </Button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
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
                        <Select
                            value={selectedCategory || "all"}
                            onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)}
                        >
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={selectedFoodType === null ? "" : selectedFoodType ? "veg" : "non-veg"}
                            onValueChange={(value) => {
                                if (value === "") setSelectedFoodType(null)
                                else if (value === "veg") setSelectedFoodType(true)
                                else setSelectedFoodType(false)
                            }}
                        >
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="veg">Vegetarian</SelectItem>
                                <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="flex items-center space-x-2">
                            <Switch id="available-only" checked={showOnlyAvailable} onCheckedChange={setShowOnlyAvailable} />
                            <Label htmlFor="available-only">Available Only</Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="relative w-16 h-16">
                                <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
                                <div className="absolute top-0 left-0 w-full h-full border-4 border-t-green-500 rounded-full animate-spin"></div>
                            </div>
                        </div>
                    ) : filteredMeals.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Filter className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-700 mb-2">No meals found</h3>
                            <p className="text-gray-500 mb-4">Try adjusting your filters or add a new meal</p>
                            <Button onClick={() => setIsAddDialogOpen(true)} className="bg-green-500 hover:bg-green-600">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Meal
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">Image</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-right">Calories</TableHead>
                                        <TableHead className="text-right">Protein</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredMeals.map((meal) => (
                                        <TableRow key={meal.id}>
                                            <TableCell>
                                                <div className="w-12 h-12 bg-gray-200 rounded-md relative flex-shrink-0 overflow-hidden">
                                                    {meal.image_url ? (
                                                        <Image
                                                            src={meal.image_url || "/placeholder.svg"}
                                                            alt={meal.name}
                                                            fill
                                                            className="object-cover rounded-md"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-400 rounded-md">
                                                            <span className="text-white font-bold">{meal.name.substring(0, 2).toUpperCase()}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{meal.name}</TableCell>
                                            <TableCell>{getCategoryName(meal.category_id)}</TableCell>
                                            <TableCell>
                                                {meal.food_type ? (
                                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center w-fit">
                                                        <Leaf className="mr-1 h-3 w-3" />
                                                        Veg
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100 flex items-center w-fit">
                                                        <Utensils className="mr-1 h-3 w-3" />
                                                        Non-Veg
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">₹{meal.price.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">{meal.calories}</TableCell>
                                            <TableCell className="text-right">{meal.protein}g</TableCell>
                                            <TableCell>
                                                {meal.is_available ? (
                                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Available</Badge>
                                                ) : (
                                                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Unavailable</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => handleViewMeal(meal.id)}
                                                        className="text-blue-500 hover:text-blue-600"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="outline" size="icon" onClick={() => handleEditMeal(meal)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="text-red-500 hover:text-red-600"
                                                        onClick={() => handleDeleteClick(meal)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/*// Dialog for Adding*/}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-[900px]">
                    <DialogHeader>
                        <DialogTitle>Add New Meal</DialogTitle>
                        <DialogDescription>Add a new meal with detailed nutritional information.</DialogDescription>
                    </DialogHeader>
                    <AddMealForm
                        onSubmit={handleAddMeal}
                        onCancel={() => setIsAddDialogOpen(false)}
                        isSubmitting={isSubmitting}
                        categories={categories}
                        dietaryTypes={dietaryTypes}
                    />
                </DialogContent>
            </Dialog>

            {/*// Dialog for Editing*/}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[900px]">
                    <DialogHeader>
                        <DialogTitle>Edit Meal</DialogTitle>
                        <DialogDescription>Update the meal details and nutritional information.</DialogDescription>
                    </DialogHeader>
                    <AddMealForm
                        initialData={currentMeal ? {
                            id: currentMeal.id,
                            name: currentMeal.name,
                            description: currentMeal.description || null,
                            price: currentMeal.price,
                            calories: currentMeal.calories,
                            protein: currentMeal.protein,
                            carbs: currentMeal.carbs || null,
                            fat: currentMeal.fat || null,
                            fiber: currentMeal.fiber || null,
                            image_url: currentMeal.image_url || null,
                            category_id: currentMeal.category_id,
                            dietary_type_id: currentMeal.dietary_type_id || null,
                            food_type: currentMeal.food_type || null,
                            is_available: currentMeal.is_available ?? true,
                            spice_level: currentMeal.spice_level || null,
                            cooking_time_minutes: currentMeal.cooking_time_minutes || null,
                        } : undefined}
                        onSubmit={handleUpdateMeal}
                        onCancel={() => {
                            setIsEditDialogOpen(false);
                            setCurrentMeal(null);
                        }}
                        isSubmitting={isSubmitting}
                        categories={categories}
                        dietaryTypes={dietaryTypes}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this meal? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {currentMeal && (
                        <div className="py-4">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-md relative flex-shrink-0 overflow-hidden">
                                    {currentMeal.image_url ? (
                                        <Image
                                            src={currentMeal.image_url || "/placeholder.svg"}
                                            alt={currentMeal.name}
                                            fill
                                            className="object-cover rounded-md"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-400 rounded-md">
                                            <span className="text-white font-bold">{currentMeal.name.substring(0, 2).toUpperCase()}</span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-medium">{currentMeal.name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {getCategoryName(currentMeal.category_id)} • ₹{currentMeal.price.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDeleteDialogOpen(false)
                                setCurrentMeal(null)
                            }}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteMeal} disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Meal
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

