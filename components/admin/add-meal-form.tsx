"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2, Plus, Trash2, Leaf, Utensils, Check, Upload, ImageIcon, X } from "lucide-react"
import { toast } from "react-hot-toast"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import Image from "next/image"

type Ingredient = {
    id: string
    name: string
    calories_per_100g: number
    protein_per_100g: number
    carbs_per_100g: number
    fat_per_100g: number
    is_allergen: boolean
}

type MealIngredient = {
    id?: string;
    ingredient_id: string;
    quantity_grams: number;
    ingredient?: Ingredient;
};

type MealFormProps = {
    initialData?: {
        id?: string;
        name: string;
        description: string | null;
        price: number;
        calories: number;
        protein: number;
        carbs: number | null;
        fat: number | null;
        fiber: number | null;
        image_url: string | null;
        category_id: string;
        dietary_type_id: string | null;
        food_type: boolean | null;
        is_available: boolean;
        spice_level: number | null;
        cooking_time_minutes: number | null;
        ingredients?: MealIngredient[];
    };
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
    categories: { id: string; name: string }[];
    dietaryTypes: { id: string; name: string }[];
};

export default function AddMealForm({
                                        initialData,
                                        onSubmit,
                                        onCancel,
                                        isSubmitting,
                                        categories,
                                        dietaryTypes,
                                    }: MealFormProps) {
    const supabase = createClient()
    const [activeTab, setActiveTab] = useState("basic")
    const [ingredients, setIngredients] = useState<Ingredient[]>([])
    const [selectedIngredient, setSelectedIngredient] = useState<string>("")
    const [ingredientQuantity, setIngredientQuantity] = useState<number>(100)
    const [loadingIngredients, setLoadingIngredients] = useState(false)
    const [nutritionCalculated, setNutritionCalculated] = useState(false)
    console.log(categories, dietaryTypes)


    // Image upload states
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [uploadingImage, setUploadingImage] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        calories: "0",
        protein: "0",
        carbs: "0",
        fat: "0",
        fiber: "", // Empty string instead of "0" since it’s optional
        image_url: "",
        category_id: "",
        dietary_type_id: "", // Empty string for optional field
        food_type: true,
        is_available: true,
        spice_level: 2,
        cooking_time_minutes: "30",
        ingredients: [] as MealIngredient[],
    });

    useEffect(() => {
        async function fetchIngredients() {
            setLoadingIngredients(true);
            try {
                const { data, error } = await supabase.from("ingredients").select("*").order("name");
                if (error) throw error;
                setIngredients(data || []);
            } catch (error) {
                console.error("Error fetching ingredients:", error);
                toast.error("Failed to load ingredients");
            } finally {
                setLoadingIngredients(false);
            }
        }

        fetchIngredients();

        if (initialData) {
            setFormData({
                name: initialData.name || "",
                description: initialData.description || "",
                price: initialData.price?.toString() || "",
                calories: initialData.calories?.toString() || "0",
                protein: initialData.protein?.toString() || "0",
                carbs: initialData.carbs?.toString() || "",
                fat: initialData.fat?.toString() || "",
                fiber: initialData.fiber?.toString() || "",
                image_url: initialData.image_url || "",
                category_id: initialData.category_id || "",
                dietary_type_id: initialData.dietary_type_id || "",
                food_type: initialData.food_type ?? true,
                is_available: initialData.is_available ?? true,
                spice_level: initialData.spice_level || 2,
                cooking_time_minutes: initialData.cooking_time_minutes?.toString() || "30",
                ingredients: initialData.ingredients || [],
            });

            if (initialData.image_url) {
                setImagePreview(initialData.image_url);
            }

            if (initialData.id && !initialData.ingredients) {
                fetchMealIngredients(initialData.id);
            }
        }
    }, [supabase, initialData]);

    const fetchMealIngredients = async (mealId: string) => {
        try {
            const { data, error } = await supabase
                .from("meal_ingredients")
                .select(`
          id,
          ingredient_id,
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
                .eq("meal_id", mealId)

            if (error) {
                throw error
            }

            const formattedIngredients = data.map((item) => ({
                id: item.id,
                ingredient_id: item.ingredient_id,
                quantity_grams: item.quantity_grams,
                ingredient: item.ingredients,
            }))

            setFormData((prev) => ({
                ...prev,
                ingredients: formattedIngredients,
            }))
        } catch (error) {
            console.error("Error fetching meal ingredients:", error)
            toast.error("Failed to load meal ingredients")
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value })
    }

    const handleSwitchChange = (name: string, checked: boolean) => {
        setFormData({ ...formData, [name]: checked })
    }

    const handleSpiceLevelChange = (value: number[]) => {
        setFormData({ ...formData, spice_level: value[0] })
    }

    const addIngredient = () => {
        if (!selectedIngredient || ingredientQuantity <= 0) {
            toast.error("Please select an ingredient and specify a valid quantity")
            return
        }

        const ingredient = ingredients.find((i) => i.id === selectedIngredient)
        if (!ingredient) return

        const newIngredient: MealIngredient = {
            ingredient_id: selectedIngredient,
            quantity_grams: ingredientQuantity,
            ingredient,
        }

        setFormData((prev) => ({
            ...prev,
            ingredients: [...prev.ingredients, newIngredient],
        }))

        setSelectedIngredient("")
        setIngredientQuantity(100)
        setNutritionCalculated(false)
    }

    const removeIngredient = (index: number) => {
        const updatedIngredients = [...formData.ingredients]
        updatedIngredients.splice(index, 1)

        setFormData((prev) => ({
            ...prev,
            ingredients: updatedIngredients,
        }))

        setNutritionCalculated(false)
    }

    const calculateNutrition = () => {
        let totalCalories = 0
        let totalProtein = 0
        let totalCarbs = 0
        let totalFat = 0

        formData.ingredients.forEach((item) => {
            const ingredient = item.ingredient
            if (ingredient) {
                totalCalories += (ingredient.calories_per_100g * item.quantity_grams) / 100
                totalProtein += (ingredient.protein_per_100g * item.quantity_grams) / 100
                totalCarbs += (ingredient.carbs_per_100g * item.quantity_grams) / 100
                totalFat += (ingredient.fat_per_100g * item.quantity_grams) / 100
            }
        })

        setFormData((prev) => ({
            ...prev,
            calories: Math.round(totalCalories).toString(),
            protein: totalProtein.toFixed(1),
            carbs: totalCarbs.toFixed(1),
            fat: totalFat.toFixed(1),
        }))

        setNutritionCalculated(true)
        toast.success("Nutrition values calculated from ingredients")
    }

    // Handle image selection
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size should be less than 5MB")
            return
        }

        // Check file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file")
            return
        }

        setImageFile(file)

        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
            setImagePreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
    }

    // Handle image upload
    const uploadImage = async () => {
        if (!imageFile) return null

        setUploadingImage(true)
        try {
            // Create a unique file path
            const fileExt = imageFile.name.split(".").pop()
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
            const filePath = `meal-images/${fileName}`

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage.from("meals").upload(filePath, imageFile)

            if (uploadError) throw uploadError

            // Get public URL
            const { data } = supabase.storage.from("meals").getPublicUrl(filePath)

            return data.publicUrl
        } catch (error) {
            console.error("Error uploading image:", error)
            toast.error("Failed to upload image")
            return null
        } finally {
            setUploadingImage(false)
        }
    }

    // Remove image
    const removeImage = () => {
        setImageFile(null)
        setImagePreview(null)
        setFormData((prev) => ({ ...prev, image_url: "" }))
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleSubmit = async () => {
        if (!formData.name || !formData.price || !formData.category_id) {
            toast.error("Please fill in all required fields")
            return
        }

        if (formData.ingredients.length === 0) {
            toast.error("Please add at least one ingredient")
            return
        }

        if (!nutritionCalculated) {
            calculateNutrition()
        }

        // Handle image upload if there's a new image
        let imageUrl = formData.image_url
        if (imageFile) {
            const uploadedUrl = await uploadImage()
            if (uploadedUrl) {
                imageUrl = uploadedUrl
            }
        }

        const submissionData = {
            ...formData,
            price: Number.parseFloat(formData.price),
            calories: Number.parseInt(formData.calories),
            protein: Number.parseFloat(formData.protein),
            carbs: Number.parseFloat(formData.carbs),
            fat: Number.parseFloat(formData.fat),
            fiber: Number.parseFloat(formData.fiber || "0"),
            cooking_time_minutes: Number.parseInt(formData.cooking_time_minutes),
            image_url: imageUrl,
        }

        await onSubmit(submissionData)
    }

    return (
        <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                    <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <Select value={formData.category_id} onValueChange={(value) => handleSelectChange("category_id", value)}>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <Label htmlFor="dietary_type_id">Dietary Type</Label>
                            <Select
                                value={formData.dietary_type_id}
                                onValueChange={(value) => handleSelectChange("dietary_type_id", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select dietary type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {dietaryTypes.map((type) => (
                                        <SelectItem key={type.id} value={type.id}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="cooking_time_minutes">Cooking Time (minutes)</Label>
                            <Input
                                id="cooking_time_minutes"
                                name="cooking_time_minutes"
                                type="number"
                                placeholder="30"
                                value={formData.cooking_time_minutes}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Spice Level</Label>
                            <div className="pt-4">
                                <Slider
                                    value={[formData.spice_level]}
                                    min={1}
                                    max={5}
                                    step={1}
                                    onValueChange={handleSpiceLevelChange}
                                />
                                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                    <span>Mild</span>
                                    <span>Medium</span>
                                    <span>Spicy</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Meal Image</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                            {imagePreview ? (
                                <div className="relative">
                                    <div className="relative h-48 w-full rounded-md overflow-hidden">
                                        <Image src={imagePreview || "/placeholder.svg"} alt="Meal preview" fill className="object-cover" />
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-8 w-8 rounded-full"
                                        onClick={removeImage}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div
                                    className="flex flex-col items-center justify-center py-6 cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500 mb-1">Click to upload an image</p>
                                    <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 5MB</p>
                                </div>
                            )}
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
                            {!imagePreview && (
                                <Button variant="outline" className="w-full mt-2" onClick={() => fileInputRef.current?.click()}>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Select Image
                                </Button>
                            )}
                            {imagePreview && !imageFile && formData.image_url && (
                                <p className="text-xs text-gray-500 mt-2">Using existing image. Upload a new one to replace it.</p>
                            )}
                        </div>
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
                </TabsContent>

                <TabsContent value="ingredients" className="space-y-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-12 md:col-span-6">
                                    <Label htmlFor="ingredient">Ingredient</Label>
                                    <Select
                                        value={selectedIngredient}
                                        onValueChange={setSelectedIngredient}
                                        disabled={loadingIngredients}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select ingredient" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ingredients.map((ingredient) => (
                                                <SelectItem key={ingredient.id} value={ingredient.id}>
                                                    {ingredient.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-6 md:col-span-4">
                                    <Label htmlFor="quantity">Quantity (grams)</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        value={ingredientQuantity}
                                        onChange={(e) => setIngredientQuantity(Number(e.target.value))}
                                        min={1}
                                    />
                                </div>
                                <div className="col-span-6 md:col-span-2 flex items-end">
                                    <Button
                                        onClick={addIngredient}
                                        className="w-full bg-green-500 hover:bg-green-600"
                                        disabled={!selectedIngredient || ingredientQuantity <= 0}
                                    >
                                        <Plus className="h-4 w-4 mr-1" /> Add
                                    </Button>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Label>Ingredients List</Label>
                                <ScrollArea className="h-[300px] mt-2 rounded-md border">
                                    {formData.ingredients.length === 0 ? (
                                        <div className="p-4 text-center text-muted-foreground">
                                            No ingredients added yet. Add ingredients to calculate nutrition values.
                                        </div>
                                    ) : (
                                        <div className="p-4 space-y-3">
                                            {formData.ingredients.map((item, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                                                    <div className="flex-1">
                                                        <div className="font-medium">{item.ingredient?.name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {item.quantity_grams}g
                                                            {item.ingredient?.is_allergen && (
                                                                <Badge className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100">Allergen</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-right mr-4">
                                                        <div>
                                                            {(((item.ingredient?.calories_per_100g || 0) * item.quantity_grams) / 100).toFixed(0)}{" "}
                                                            kcal
                                                        </div>
                                                        <div>
                                                            {(((item.ingredient?.protein_per_100g || 0) * item.quantity_grams) / 100).toFixed(1)}g
                                                            protein
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeIngredient(index)}
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>

                            {formData.ingredients.length > 0 && (
                                <Button onClick={calculateNutrition} className="mt-4 w-full bg-blue-500 hover:bg-blue-600">
                                    Calculate Nutrition Values
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="nutrition" className="space-y-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="calories">Calories (kcal)</Label>
                                    <Input
                                        id="calories"
                                        name="calories"
                                        type="number"
                                        value={formData.calories}
                                        onChange={handleInputChange}
                                        className={nutritionCalculated ? "border-green-500" : ""}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="protein">Protein (g)</Label>
                                    <Input
                                        id="protein"
                                        name="protein"
                                        type="number"
                                        step="0.1"
                                        value={formData.protein}
                                        onChange={handleInputChange}
                                        className={nutritionCalculated ? "border-green-500" : ""}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="carbs">Carbohydrates (g)</Label>
                                    <Input
                                        id="carbs"
                                        name="carbs"
                                        type="number"
                                        step="0.1"
                                        value={formData.carbs}
                                        onChange={handleInputChange}
                                        className={nutritionCalculated ? "border-green-500" : ""}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fat">Fat (g)</Label>
                                    <Input
                                        id="fat"
                                        name="fat"
                                        type="number"
                                        step="0.1"
                                        value={formData.fat}
                                        onChange={handleInputChange}
                                        className={nutritionCalculated ? "border-green-500" : ""}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fiber">Fiber (g)</Label>
                                    <Input
                                        id="fiber"
                                        name="fiber"
                                        type="number"
                                        step="0.1"
                                        value={formData.fiber}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-gray-50 rounded-md border">
                                <h3 className="font-medium mb-2">Nutrition Summary</h3>
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{formData.calories}</div>
                                        <div className="text-xs text-muted-foreground">Calories</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{formData.protein}g</div>
                                        <div className="text-xs text-muted-foreground">Protein</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{formData.carbs}g</div>
                                        <div className="text-xs text-muted-foreground">Carbs</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{formData.fat}g</div>
                                        <div className="text-xs text-muted-foreground">Fat</div>
                                    </div>
                                </div>
                            </div>

                            {nutritionCalculated && (
                                <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md border border-green-200 flex items-center">
                                    <Check className="h-5 w-5 mr-2" />
                                    Nutrition values calculated from ingredients
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    className="bg-green-500 hover:bg-green-600"
                    disabled={isSubmitting || uploadingImage}
                >
                    {isSubmitting || uploadingImage ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {uploadingImage ? "Uploading Image..." : initialData ? "Updating..." : "Adding..."}
                        </>
                    ) : (
                        <>
                            {initialData ? (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Update Meal
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Meal
                                </>
                            )}
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}

