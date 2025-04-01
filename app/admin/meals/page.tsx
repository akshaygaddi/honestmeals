"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-hot-toast";
import { Plus, Search, Edit, Trash2, Loader2, Filter, Leaf, Utensils, Check } from "lucide-react";
import Image from "next/image";
import { categories } from "@/lib/data";

type Meal = {
    id: string;
    name: string;
    description: string | null;
    price: number;
    calories: number;
    protein: number;
    image_url: string | null;
    category_id: string;
    food_type: boolean | null;
    is_available: boolean;
    // Add these if you plan to use them
    dietary_type_id?: string | null;
    created_at?: string;
    updated_at?: string;
};

type MealCategory = {
    id: string;
    name: string;
};

export default function AdminMeals() {
    const router = useRouter();
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [meals, setMeals] = useState<Meal[]>([]);
    const [filteredMeals, setFilteredMeals] = useState<Meal[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedFoodType, setSelectedFoodType] = useState<boolean | null>(null);
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentMeal, setCurrentMeal] = useState<Meal | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        calories: "",
        protein: "",
        image_url: "",
        category_id: "",
        food_type: true,
        is_available: true,
    });

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const { data: mealsData, error: mealsError } = await supabase.from("meals").select("*").order("name");
                if (mealsError) {
                    console.error("Error fetching meals:", mealsError);
                    toast.error("Failed to load meals");
                } else {
                    setMeals(mealsData || []);
                    setFilteredMeals(mealsData || []);
                }
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
        let filtered = [...meals];
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (meal) =>
                    meal.name.toLowerCase().includes(query) ||
                    (meal.description && meal.description.toLowerCase().includes(query)),
            );
        }
        if (selectedCategory) {
            filtered = filtered.filter((meal) => meal.category_id === selectedCategory);
        }
        if (selectedFoodType !== null) {
            filtered = filtered.filter((meal) => meal.food_type === selectedFoodType);
        }
        if (showOnlyAvailable) {
            filtered = filtered.filter((meal) => meal.is_available);
        }
        setFilteredMeals(filtered);
    }, [meals, searchQuery, selectedCategory, selectedFoodType, showOnlyAvailable]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSwitchChange = (name: string, checked: boolean) => {
        setFormData({ ...formData, [name]: checked });
    };

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            price: "",
            calories: "",
            protein: "",
            image_url: "",
            category_id: "",
            food_type: true,
            is_available: true,
        });
    };

    const handleAddMeal = async () => {
        if (!formData.name || !formData.price || !formData.calories || !formData.protein || !formData.category_id) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);

        try {
            const { data, error } = await supabase.from("meals").insert({
                name: formData.name,
                description: formData.description || null,
                price: Number.parseFloat(formData.price),
                calories: Number.parseInt(formData.calories),
                protein: Number.parseFloat(formData.protein),
                image_url: formData.image_url || null,
                category_id: formData.category_id, // This must be a valid UUID
                food_type: formData.food_type,
                is_available: formData.is_available,
                // dietary_type_id: null, // Uncomment and set if you add this field to formData
            });

            if (error) {
                console.error("Error adding meal:", error);
                toast.error("Failed to add meal");
            } else {
                toast.success("Meal added successfully");
                setIsAddDialogOpen(false);

                const { data: mealsData } = await supabase.from("meals").select("*").order("name");
                setMeals(mealsData || []);
            }
        } catch (error) {
            console.error("Error adding meal:", error);
            toast.error("An error occurred while adding the meal");
        } finally {
            setIsSubmitting(false);
            resetForm();
        }
    };

    const handleEditMeal = (meal: Meal) => {
        setCurrentMeal(meal);
        setFormData({
            name: meal.name,
            description: meal.description || "",
            price: meal.price.toString(),
            calories: meal.calories.toString(),
            protein: meal.protein.toString(),
            image_url: meal.image_url || "",
            category_id: meal.category_id,
            food_type: meal.food_type !== null ? meal.food_type : true,
            is_available: meal.is_available,
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdateMeal = async () => {
        if (!currentMeal) return;

        if (!formData.name || !formData.price || !formData.calories || !formData.protein || !formData.category_id) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from("meals")
                .update({
                    name: formData.name,
                    description: formData.description || null,
                    price: Number.parseFloat(formData.price),
                    calories: Number.parseInt(formData.calories),
                    protein: Number.parseFloat(formData.protein),
                    image_url: formData.image_url || null,
                    category_id: formData.category_id,
                    food_type: formData.food_type,
                    is_available: formData.is_available,
                })
                .eq("id", currentMeal.id);

            if (error) {
                console.error("Error updating meal:", error);
                toast.error("Failed to update meal");
            } else {
                toast.success("Meal updated successfully");
                setIsEditDialogOpen(false);

                const { data: mealsData } = await supabase.from("meals").select("*").order("name");
                setMeals(mealsData || []);
            }
        } catch (error) {
            console.error("Error updating meal:", error);
            toast.error("An error occurred while updating the meal");
        } finally {
            setIsSubmitting(false);
            resetForm();
            setCurrentMeal(null);
        }
    };

    const handleDeleteClick = (meal: Meal) => {
        setCurrentMeal(meal);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteMeal = async () => {
        if (!currentMeal) return;

        setIsSubmitting(true);

        try {
            const { error } = await supabase.from("meals").delete().eq("id", currentMeal.id);

            if (error) {
                console.error("Error deleting meal:", error);
                toast.error("Failed to delete meal");
            } else {
                toast.success("Meal deleted successfully");
                setIsDeleteDialogOpen(false);

                const { data: mealsData } = await supabase.from("meals").select("*").order("name");
                setMeals(mealsData || []);
            }
        } catch (error) {
            console.error("Error deleting meal:", error);
            toast.error("An error occurred while deleting the meal");
        } finally {
            setIsSubmitting(false);
            setCurrentMeal(null);
        }
    };

    const getCategoryName = (categoryId: string) => {
        const category = categories.find((cat) => cat.id === categoryId);
        return category ? category.name : "Unknown Category";
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Meals Management</h1>
                    <p className="text-muted-foreground">Manage your menu items</p>
                </div>
                <Button
                    onClick={() => {
                        resetForm();
                        setIsAddDialogOpen(true);
                    }}
                    className="bg-green-500 hover:bg-green-600"
                >
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
                        <Select value={selectedCategory || ""} onValueChange={(value) => setSelectedCategory(value || null)}>
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
                                if (value === "") setSelectedFoodType(null);
                                else if (value === "veg") setSelectedFoodType(true);
                                else setSelectedFoodType(false);
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
                            <Button
                                onClick={() => {
                                    resetForm();
                                    setIsAddDialogOpen(true);
                                }}
                                className="bg-green-500 hover:bg-green-600"
                            >
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

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Add New Meal</DialogTitle>
                        <DialogDescription>Add a new meal to your menu. Fill in all the required fields.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Meal Name *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Enter meal name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category_id">Category *</Label>
                                <Select
                                    value={formData.category_id}
                                    onValueChange={(value) => handleSelectChange("category_id", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Enter meal description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (₹) *</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="calories">Calories *</Label>
                                <Input
                                    id="calories"
                                    name="calories"
                                    type="number"
                                    placeholder="0"
                                    value={formData.calories}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="protein">Protein (g) *</Label>
                                <Input
                                    id="protein"
                                    name="protein"
                                    type="number"
                                    step="0.1"
                                    placeholder="0.0"
                                    value={formData.protein}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="image_url">Image URL</Label>
                            <Input
                                id="image_url"
                                name="image_url"
                                placeholder="Enter image URL"
                                value={formData.image_url}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="food_type"
                                    checked={formData.food_type}
                                    onCheckedChange={(checked) => handleSwitchChange("food_type", checked)}
                                />
                                <Label htmlFor="food_type" className="flex items-center">
                                    {formData.food_type ? (
                                        <>
                                            <Leaf className="mr-2 h-4 w-4 text-green-500" />
                                            Vegetarian
                                        </>
                                    ) : (
                                        <>
                                            <Utensils className="mr-2 h-4 w-4 text-red-500" />
                                            Non-Vegetarian
                                        </>
                                    )}
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is_available"
                                    checked={formData.is_available}
                                    onCheckedChange={(checked) => handleSwitchChange("is_available", checked)}
                                />
                                <Label htmlFor="is_available">Available for Order</Label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                resetForm();
                                setIsAddDialogOpen(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleAddMeal} className="bg-green-500 hover:bg-green-600" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Meal
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit Meal</DialogTitle>
                        <DialogDescription>Update the meal details. Fill in all the required fields.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Meal Name *</Label>
                                <Input
                                    id="edit-name"
                                    name="name"
                                    placeholder="Enter meal name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-category_id">Category *</Label>
                                <Select
                                    value={formData.category_id}
                                    onValueChange={(value) => handleSelectChange("category_id", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                name="description"
                                placeholder="Enter meal description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-price">Price (₹) *</Label>
                                <Input
                                    id="edit-price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-calories">Calories *</Label>
                                <Input
                                    id="edit-calories"
                                    name="calories"
                                    type="number"
                                    placeholder="0"
                                    value={formData.calories}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-protein">Protein (g) *</Label>
                                <Input
                                    id="edit-protein"
                                    name="protein"
                                    type="number"
                                    step="0.1"
                                    placeholder="0.0"
                                    value={formData.protein}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-image_url">Image URL</Label>
                            <Input
                                id="edit-image_url"
                                name="image_url"
                                placeholder="Enter image URL"
                                value={formData.image_url}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="edit-food_type"
                                    checked={formData.food_type}
                                    onCheckedChange={(checked) => handleSwitchChange("food_type", checked)}
                                />
                                <Label htmlFor="edit-food_type" className="flex items-center">
                                    {formData.food_type ? (
                                        <>
                                            <Leaf className="mr-2 h-4 w-4 text-green-500" />
                                            Vegetarian
                                        </>
                                    ) : (
                                        <>
                                            <Utensils className="mr-2 h-4 w-4 text-red-500" />
                                            Non-Vegetarian
                                        </>
                                    )}
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="edit-is_available"
                                    checked={formData.is_available}
                                    onCheckedChange={(checked) => handleSwitchChange("is_available", checked)}
                                />
                                <Label htmlFor="edit-is_available">Available for Order</Label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                resetForm();
                                setIsEditDialogOpen(false);
                                setCurrentMeal(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateMeal} className="bg-green-500 hover:bg-green-600" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Update Meal
                                </>
                            )}
                        </Button>
                    </DialogFooter>
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
                                setIsDeleteDialogOpen(false);
                                setCurrentMeal(null);
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
    );
}