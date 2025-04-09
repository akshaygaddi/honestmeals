"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "react-hot-toast"
import { ArrowLeft, Loader2, Plus, Save, Send, Trash } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

type Ingredient = {
    id: string
    name: string
    description: string | null
    calories_per_100g: number
    protein_per_100g: number
    carbs_per_100g: number
    fat_per_100g: number
    is_allergen: boolean
    category_id: string | null
    category_name?: string
    price_per_100g: number
}

type CustomIngredient = {
    id: string
    name: string
    description: string | null
    calories_per_100g: number
    protein_per_100g: number
    carbs_per_100g: number
    fat_per_100g: number
    price_per_100g: number
    is_private: boolean
    is_custom: boolean
}

type IngredientCategory = {
    id: string
    name: string
    description: string | null
    display_order: number
}

type SelectedIngredient = {
    id: string
    ingredient_id: string | null
    custom_ingredient_id: string | null
    name: string
    quantity_grams: number
    price_contribution: number
    calories: number
    protein: number
    carbs: number
    fat: number
    is_custom: boolean
}

type CustomMeal = {
    id: string
    name: string
    description: string
    base_price: number
    total_price: number
    calories: number
    protein: number
    carbs: number
    fat: number
    dietary_type_id: string | null
    instructions: string
    components: SelectedIngredient[]
}

export default function CustomizeMealPage() {
    const router = useRouter()
    const supabase = createClient()

    const [ingredients, setIngredients] = useState<Ingredient[]>([])
    const [customIngredients, setCustomIngredients] = useState<CustomIngredient[]>([])
    const [categories, setCategories] = useState<IngredientCategory[]>([])
    const [dietaryTypes, setDietaryTypes] = useState<{ id: string; name: string }[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)
    const [showCustomIngredients, setShowCustomIngredients] = useState(false)

    // New custom ingredient form
    const [newIngredient, setNewIngredient] = useState<{
        name: string
        description: string
        calories_per_100g: number
        protein_per_100g: number
        carbs_per_100g: number
        fat_per_100g: number
        price_per_100g: number
    }>({
        name: "",
        description: "",
        calories_per_100g: 100,
        protein_per_100g: 5,
        carbs_per_100g: 10,
        fat_per_100g: 5,
        price_per_100g: 10,
    })

    // Custom meal state
    const [customMeal, setCustomMeal] = useState<CustomMeal>({
        id: uuidv4(),
        name: "My Custom Meal",
        description: "",
        base_price: 49, // Base price for custom meals
        total_price: 49,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        dietary_type_id: null,
        instructions: "",
        components: [],
    })

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    // Customer details for non-authenticated users
    const [customerName, setCustomerName] = useState("")
    const [customerPhone, setCustomerPhone] = useState("")
    const [customerAddress, setCustomerAddress] = useState("")

    // Load data on component mount
    useEffect(() => {
        async function loadData() {
            setIsLoading(true)

            // Check authentication
            const { data: sessionData } = await supabase.auth.getSession()
            if (sessionData.session) {
                setIsAuthenticated(true)
                setUserId(sessionData.session.user.id)

                // Get user profile from profiles table instead of customers
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", sessionData.session.user.id)
                    .single()

                if (profile) {
                    setCustomerName(profile.full_name || "")
                    setCustomerPhone(profile.phone_number || "")
                    setCustomerAddress(profile.address || "")
                }

                // Load user's custom ingredients
                const { data: userIngredients, error: userIngredientsError } = await supabase
                    .from("user_custom_ingredients")
                    .select("*")
                    .eq("customer_id", sessionData.session.user.id)

                if (userIngredientsError) {
                    console.error("Error loading custom ingredients:", userIngredientsError)
                } else if (userIngredients) {
                    setCustomIngredients(
                        userIngredients.map((ing) => ({
                            ...ing,
                            is_custom: true,
                        })),
                    )
                }
            } else {
                // Get user data from localStorage for non-authenticated users
                const userData = localStorage.getItem("honestMealsUser")
                if (userData) {
                    const user = JSON.parse(userData)
                    setCustomerName(user.name || "")
                    setCustomerPhone(user.phone || "")
                    setCustomerAddress(user.address || "")
                }
            }

            // Load ingredient categories
            const { data: categoriesData, error: categoriesError } = await supabase
                .from("ingredient_categories")
                .select("*")
                .order("display_order", { ascending: true })

            if (categoriesError) {
                console.error("Error loading ingredient categories:", categoriesError)
                toast.error("Failed to load ingredient categories")
            } else if (categoriesData) {
                setCategories(categoriesData)
                if (categoriesData.length > 0) {
                    setSelectedCategory(categoriesData[0].id)
                }
            }

            // Load ingredients
            const { data: ingredientsData, error: ingredientsError } = await supabase.from("ingredients").select(`
          *,
          ingredient_categories:category_id (
            name
          )
        `)

            if (ingredientsError) {
                console.error("Error loading ingredients:", ingredientsError)
                toast.error("Failed to load ingredients")
            } else if (ingredientsData) {
                const formattedIngredients = ingredientsData.map((ing) => ({
                    ...ing,
                    category_name: ing.ingredient_categories?.name,
                }))
                setIngredients(formattedIngredients)
            }

            // Load dietary types
            const { data: dietaryData, error: dietaryError } = await supabase.from("dietary_types").select("id, name")

            if (dietaryError) {
                console.error("Error loading dietary types:", dietaryError)
            } else if (dietaryData) {
                setDietaryTypes(dietaryData)
            }

            setIsLoading(false)
        }

        loadData()
    }, [supabase])

    // Filter ingredients by category and search query
    const filteredIngredients = ingredients.filter((ing) => {
        const matchesCategory = !selectedCategory || ing.category_id === selectedCategory
        const matchesSearch =
            !searchQuery ||
            ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (ing.description && ing.description.toLowerCase().includes(searchQuery.toLowerCase()))
        return matchesCategory && matchesSearch
    })

    // Filter custom ingredients by search query
    const filteredCustomIngredients = customIngredients.filter(
        (ing) =>
            !searchQuery ||
            ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (ing.description && ing.description.toLowerCase().includes(searchQuery.toLowerCase())),
    )

    // Add ingredient to custom meal
    const addIngredient = (ingredient: Ingredient | CustomIngredient, isCustom = false) => {
        // Default quantity in grams
        const defaultQuantity = 50

        // Calculate nutritional values based on quantity
        const calories = (ingredient.calories_per_100g * defaultQuantity) / 100
        const protein = (ingredient.protein_per_100g * defaultQuantity) / 100
        const carbs = (ingredient.carbs_per_100g * defaultQuantity) / 100
        const fat = (ingredient.fat_per_100g * defaultQuantity) / 100

        // Calculate price contribution
        let priceContribution = 0
        if (isCustom && "price_per_100g" in ingredient) {
            priceContribution = (ingredient.price_per_100g * defaultQuantity) / 100
        } else {
            // For standard ingredients, use a simple calculation
            priceContribution = Math.round((calories / 100) * 5) // 5 rupees per 100 calories as an example
        }

        const newIngredient: SelectedIngredient = {
            id: uuidv4(),
            ingredient_id: isCustom ? null : ingredient.id,
            custom_ingredient_id: isCustom ? ingredient.id : null,
            name: ingredient.name,
            quantity_grams: defaultQuantity,
            price_contribution: priceContribution,
            calories,
            protein,
            carbs,
            fat,
            is_custom: isCustom,
        }

        // Add to components and update totals
        setCustomMeal((prev) => {
            const updatedComponents = [...prev.components, newIngredient]

            // Calculate new totals
            const totalCalories = updatedComponents.reduce((sum, item) => sum + item.calories, 0)
            const totalProtein = updatedComponents.reduce((sum, item) => sum + item.protein, 0)
            const totalCarbs = updatedComponents.reduce((sum, item) => sum + item.carbs, 0)
            const totalFat = updatedComponents.reduce((sum, item) => sum + item.fat, 0)
            const totalComponentPrice = updatedComponents.reduce((sum, item) => sum + item.price_contribution, 0)

            return {
                ...prev,
                components: updatedComponents,
                calories: Math.round(totalCalories),
                protein: Number.parseFloat(totalProtein.toFixed(2)),
                carbs: Number.parseFloat(totalCarbs.toFixed(2)),
                fat: Number.parseFloat(totalFat.toFixed(2)),
                total_price: prev.base_price + totalComponentPrice,
            }
        })

        toast.success(`Added ${ingredient.name}`)
    }

    // Update ingredient quantity
    const updateIngredientQuantity = (id: string, quantity: number) => {
        setCustomMeal((prev) => {
            const updatedComponents = prev.components.map((comp) => {
                if (comp.id === id) {
                    // Find the original ingredient to recalculate
                    let originalIngredient: Ingredient | CustomIngredient | undefined

                    if (comp.is_custom) {
                        originalIngredient = customIngredients.find((ing) => ing.id === comp.custom_ingredient_id)
                    } else {
                        originalIngredient = ingredients.find((ing) => ing.id === comp.ingredient_id)
                    }

                    if (!originalIngredient) return comp

                    // Recalculate nutritional values
                    const calories = (originalIngredient.calories_per_100g * quantity) / 100
                    const protein = (originalIngredient.protein_per_100g * quantity) / 100
                    const carbs = (originalIngredient.carbs_per_100g * quantity) / 100
                    const fat = (originalIngredient.fat_per_100g * quantity) / 100

                    // Recalculate price contribution
                    let priceContribution = 0
                    if (comp.is_custom && "price_per_100g" in originalIngredient) {
                        priceContribution = (originalIngredient.price_per_100g * quantity) / 100
                    } else {
                        // For standard ingredients
                        priceContribution = Math.round((calories / 100) * 5)
                    }

                    return {
                        ...comp,
                        quantity_grams: quantity,
                        calories,
                        protein,
                        carbs,
                        fat,
                        price_contribution: priceContribution,
                    }
                }
                return comp
            })

            // Recalculate totals
            const totalCalories = updatedComponents.reduce((sum, item) => sum + item.calories, 0)
            const totalProtein = updatedComponents.reduce((sum, item) => sum + item.protein, 0)
            const totalCarbs = updatedComponents.reduce((sum, item) => sum + item.carbs, 0)
            const totalFat = updatedComponents.reduce((sum, item) => sum + item.fat, 0)
            const totalComponentPrice = updatedComponents.reduce((sum, item) => sum + item.price_contribution, 0)

            return {
                ...prev,
                components: updatedComponents,
                calories: Math.round(totalCalories),
                protein: Number.parseFloat(totalProtein.toFixed(2)),
                carbs: Number.parseFloat(totalCarbs.toFixed(2)),
                fat: Number.parseFloat(totalFat.toFixed(2)),
                total_price: prev.base_price + totalComponentPrice,
            }
        })
    }

    // Remove ingredient from custom meal
    const removeIngredient = (id: string) => {
        setCustomMeal((prev) => {
            const updatedComponents = prev.components.filter((comp) => comp.id !== id)

            // Recalculate totals
            const totalCalories = updatedComponents.reduce((sum, item) => sum + item.calories, 0)
            const totalProtein = updatedComponents.reduce((sum, item) => sum + item.protein, 0)
            const totalCarbs = updatedComponents.reduce((sum, item) => sum + item.carbs, 0)
            const totalFat = updatedComponents.reduce((sum, item) => sum + item.fat, 0)
            const totalComponentPrice = updatedComponents.reduce((sum, item) => sum + item.price_contribution, 0)

            return {
                ...prev,
                components: updatedComponents,
                calories: Math.round(totalCalories),
                protein: Number.parseFloat(totalProtein.toFixed(2)),
                carbs: Number.parseFloat(totalCarbs.toFixed(2)),
                fat: Number.parseFloat(totalFat.toFixed(2)),
                total_price: prev.base_price + totalComponentPrice,
            }
        })
    }

    // Add new custom ingredient
    const addNewCustomIngredient = async () => {
        if (!isAuthenticated) {
            toast.error("Please sign in to add custom ingredients")
            return
        }

        if (!newIngredient.name) {
            toast.error("Please provide a name for your custom ingredient")
            return
        }

        setIsSubmitting(true)

        try {
            const { data, error } = await supabase
                .from("user_custom_ingredients")
                .insert({
                    customer_id: userId, // This stays the same as it references auth.uid()
                    name: newIngredient.name,
                    description: newIngredient.description,
                    calories_per_100g: newIngredient.calories_per_100g,
                    protein_per_100g: newIngredient.protein_per_100g,
                    carbs_per_100g: newIngredient.carbs_per_100g,
                    fat_per_100g: newIngredient.fat_per_100g,
                    price_per_100g: newIngredient.price_per_100g,
                    is_private: true,
                })
                .select()

            if (error) throw error

            if (data && data[0]) {
                const newCustomIngredient: CustomIngredient = {
                    ...data[0],
                    is_custom: true,
                }

                setCustomIngredients((prev) => [...prev, newCustomIngredient])
                toast.success(`Added custom ingredient: ${newIngredient.name}`)

                // Reset form
                setNewIngredient({
                    name: "",
                    description: "",
                    calories_per_100g: 100,
                    protein_per_100g: 5,
                    carbs_per_100g: 10,
                    fat_per_100g: 5,
                    price_per_100g: 10,
                })
            }
        } catch (error) {
            console.error("Error adding custom ingredient:", error)
            toast.error("Failed to add custom ingredient")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Delete custom ingredient
    const deleteCustomIngredient = async (id: string) => {
        if (!isAuthenticated) {
            toast.error("Please sign in to manage custom ingredients")
            return
        }

        try {
            const { error } = await supabase.from("user_custom_ingredients").delete().eq("id", id)

            if (error) throw error

            // Remove from state
            setCustomIngredients((prev) => prev.filter((ing) => ing.id !== id))

            // Remove from custom meal if used
            setCustomMeal((prev) => {
                const updatedComponents = prev.components.filter((comp) => comp.custom_ingredient_id !== id)

                // Recalculate totals if needed
                if (updatedComponents.length !== prev.components.length) {
                    const totalCalories = updatedComponents.reduce((sum, item) => sum + item.calories, 0)
                    const totalProtein = updatedComponents.reduce((sum, item) => sum + item.protein, 0)
                    const totalCarbs = updatedComponents.reduce((sum, item) => sum + item.carbs, 0)
                    const totalFat = updatedComponents.reduce((sum, item) => sum + item.fat, 0)
                    const totalComponentPrice = updatedComponents.reduce((sum, item) => sum + item.price_contribution, 0)

                    return {
                        ...prev,
                        components: updatedComponents,
                        calories: Math.round(totalCalories),
                        protein: Number.parseFloat(totalProtein.toFixed(2)),
                        carbs: Number.parseFloat(totalCarbs.toFixed(2)),
                        fat: Number.parseFloat(totalFat.toFixed(2)),
                        total_price: prev.base_price + totalComponentPrice,
                    }
                }

                return {
                    ...prev,
                    components: updatedComponents,
                }
            })

            toast.success("Custom ingredient deleted")
        } catch (error) {
            console.error("Error deleting custom ingredient:", error)
            toast.error("Failed to delete custom ingredient")
        }
    }

    // Save custom meal to database
    const saveCustomMeal = async () => {
        if (!isAuthenticated) {
            toast.error("Please sign in to save your custom meal")
            return
        }

        if (customMeal.components.length === 0) {
            toast.error("Please add at least one ingredient to your meal")
            return
        }

        if (!customMeal.name) {
            toast.error("Please give your meal a name")
            return
        }

        setIsSubmitting(true)

        try {
            // Insert custom meal
            const { data: mealData, error: mealError } = await supabase
                .from("custom_meals")
                .insert({
                    id: customMeal.id,
                    customer_id: userId, // This stays the same as it references auth.uid()
                    name: customMeal.name,
                    description: customMeal.description,
                    base_price: customMeal.base_price,
                    total_price: customMeal.total_price,
                    calories: customMeal.calories,
                    protein: customMeal.protein,
                    carbs: customMeal.carbs,
                    fat: customMeal.fat,
                    dietary_type_id: customMeal.dietary_type_id,
                    status: "pending",
                })
                .select()

            if (mealError) throw mealError

            // Insert components
            const componentsToInsert = customMeal.components.map((comp) => ({
                custom_meal_id: customMeal.id,
                ingredient_id: comp.ingredient_id,
                custom_ingredient_id: comp.custom_ingredient_id,
                quantity_grams: comp.quantity_grams,
                price_contribution: comp.price_contribution,
            }))

            const { error: componentsError } = await supabase.from("custom_meal_components").insert(componentsToInsert)

            if (componentsError) throw componentsError

            // Insert instructions if provided
            if (customMeal.instructions) {
                const { error: instructionsError } = await supabase.from("custom_meal_instructions").insert({
                    custom_meal_id: customMeal.id,
                    instructions: customMeal.instructions,
                })

                if (instructionsError) throw instructionsError
            }

            toast.success("Custom meal saved successfully!")

            // Reset form or redirect
            router.push("/meals")
        } catch (error) {
            console.error("Error saving custom meal:", error)
            toast.error("Failed to save custom meal")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Create WhatsApp order message
    const createWhatsAppOrder = () => {
        let message = `*New Custom Meal Order from Honest Meals*\n\n`

        // Customer details
        message += `*Customer Details:*\n`
        message += `*Name:* ${customerName}\n`
        message += `*Phone:* ${customerPhone}\n`
        message += `*Address:* ${customerAddress}\n\n`

        // Custom meal details
        message += `*Custom Meal Details:*\n`
        message += `*Name:* ${customMeal.name}\n`
        if (customMeal.description) {
            message += `*Description:* ${customMeal.description}\n`
        }

        // Nutritional information
        message += `*Calories:* ${customMeal.calories} kcal\n`
        message += `*Protein:* ${customMeal.protein}g\n`
        message += `*Carbs:* ${customMeal.carbs}g\n`
        message += `*Fat:* ${customMeal.fat}g\n\n`

        // Ingredients
        message += `*Ingredients:*\n`
        customMeal.components.forEach((comp, index) => {
            message += `${index + 1}. ${comp.name} - ${comp.quantity_grams}g${comp.is_custom ? " (Custom)" : ""}\n`
        })

        // Cooking instructions
        if (customMeal.instructions) {
            message += `\n*Cooking Instructions:*\n${customMeal.instructions}\n`
        }

        // Price
        message += `\n*Total Price:* ₹${customMeal.total_price.toFixed(2)}\n`
        message += `*Delivery Fee:* ₹40.00\n`
        message += `*Grand Total:* ₹${(customMeal.total_price + 40).toFixed(2)}\n`

        message += `\n*Order Time:* ${new Date().toLocaleString()}\n`

        return encodeURIComponent(message)
    }

    // Place order via WhatsApp
    const placeOrderViaWhatsApp = async () => {
        if (customMeal.components.length === 0) {
            toast.error("Please add at least one ingredient to your meal")
            return
        }

        if (!customerName || !customerPhone || !customerAddress) {
            toast.error("Please fill in all required customer details")
            return
        }

        setIsSubmitting(true)

        try {
            // Save user data to localStorage for non-authenticated users
            const userData = { name: customerName, phone: customerPhone, address: customerAddress }
            localStorage.setItem("honestMealsUser", JSON.stringify(userData))

            // If authenticated, save the custom meal
            if (isAuthenticated && userId) {
                // Insert custom meal if not already saved
                const { data: existingMeal } = await supabase.from("custom_meals").select("id").eq("id", customMeal.id).single()

                if (!existingMeal) {
                    await saveCustomMeal()
                }

                // Create order in database
                const { data: orderData, error: orderError } = await supabase
                    .from("orders")
                    .insert({
                        customer_id: userId,
                        total_amount: customMeal.total_price + 40, // Including delivery fee
                        status: "pending",
                        payment_status: "pending",
                        payment_method: "COD",
                        delivery_address: customerAddress,
                        notes: `Custom meal: ${customMeal.name}`,
                    })
                    .select()

                if (orderError) throw orderError

                if (orderData && orderData[0]) {
                    // Add order item
                    const { error: itemError } = await supabase.from("order_items").insert({
                        order_id: orderData[0].id,
                        meal_id: null, // No standard meal
                        custom_meal_id: customMeal.id,
                        quantity: 1,
                        unit_price: customMeal.total_price,
                        total_price: customMeal.total_price,
                        is_customized: true,
                    })

                    if (itemError) throw itemError
                }
            }

            // Generate WhatsApp message and open WhatsApp
            const whatsappMessage = createWhatsAppOrder()
            const whatsappLink = `https://wa.me/918888756746?text=${whatsappMessage}`

            // Open WhatsApp
            window.location.href = whatsappLink
        } catch (error) {
            console.error("Error placing order:", error)
            toast.error("Failed to place order")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Loading ingredients...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Button variant="ghost" className="mb-6" onClick={() => router.push("/meals")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Meals
            </Button>

            <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-2/3">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold mb-2">Create Your Custom Meal</h1>
                        <p className="text-muted-foreground">
                            Build your perfect meal by selecting ingredients and specifying how you'd like them prepared.
                        </p>
                    </div>

                    <Tabs defaultValue="ingredients" className="mb-6">
                        <TabsList className="mb-4">
                            <TabsTrigger value="ingredients">Select Ingredients</TabsTrigger>
                            <TabsTrigger value="custom">My Custom Ingredients</TabsTrigger>
                            <TabsTrigger value="details">Meal Details</TabsTrigger>
                            <TabsTrigger value="customer">Customer Details</TabsTrigger>
                        </TabsList>

                        <TabsContent value="ingredients">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Choose Your Ingredients</CardTitle>
                                    <CardDescription>Select from our fresh ingredients to create your custom meal</CardDescription>
                                    <div className="mt-2">
                                        <Input
                                            placeholder="Search ingredients..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="mb-4"
                                        />
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {categories.map((category) => (
                                                <Badge
                                                    key={category.id}
                                                    variant={selectedCategory === category.id ? "default" : "outline"}
                                                    className="cursor-pointer"
                                                    onClick={() => setSelectedCategory(category.id)}
                                                >
                                                    {category.name}
                                                </Badge>
                                            ))}
                                            <Badge
                                                variant={selectedCategory === null ? "default" : "outline"}
                                                className="cursor-pointer"
                                                onClick={() => setSelectedCategory(null)}
                                            >
                                                All Categories
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {filteredIngredients.map((ingredient) => (
                                            <Card key={ingredient.id} className="overflow-hidden">
                                                <div className="p-4">
                                                    <h3 className="font-medium">{ingredient.name}</h3>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {ingredient.description || "Fresh ingredient"}
                                                    </p>
                                                    <div className="mt-2 text-xs text-muted-foreground">
                                                        <div>Calories: {ingredient.calories_per_100g} kcal/100g</div>
                                                        <div>Protein: {ingredient.protein_per_100g}g/100g</div>
                                                        <div>Price: ₹{ingredient.price_per_100g}/100g</div>
                                                    </div>
                                                </div>
                                                <div className="bg-muted p-3 flex justify-end">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => addIngredient(ingredient)}
                                                        disabled={customMeal.components.some((c) => c.ingredient_id === ingredient.id)}
                                                    >
                                                        <Plus className="h-4 w-4 mr-1" />
                                                        Add
                                                    </Button>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="custom">
                            <Card>
                                <CardHeader>
                                    <CardTitle>My Custom Ingredients</CardTitle>
                                    <CardDescription>
                                        {isAuthenticated
                                            ? "Create and manage your own custom ingredients"
                                            : "Sign in to create custom ingredients"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {isAuthenticated ? (
                                        <>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button className="mb-6">
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Add New Custom Ingredient
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Add Custom Ingredient</DialogTitle>
                                                        <DialogDescription>
                                                            Create your own ingredient with custom nutritional values
                                                        </DialogDescription>
                                                    </DialogHeader>

                                                    <div className="grid gap-4 py-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="name">Ingredient Name</Label>
                                                            <Input
                                                                id="name"
                                                                value={newIngredient.name}
                                                                onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                                                                placeholder="e.g., Homemade Sauce"
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor="description">Description (Optional)</Label>
                                                            <Textarea
                                                                id="description"
                                                                value={newIngredient.description}
                                                                onChange={(e) => setNewIngredient({ ...newIngredient, description: e.target.value })}
                                                                placeholder="Describe your ingredient"
                                                                rows={2}
                                                            />
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="calories">Calories (per 100g)</Label>
                                                                <Input
                                                                    id="calories"
                                                                    type="number"
                                                                    value={newIngredient.calories_per_100g}
                                                                    onChange={(e) =>
                                                                        setNewIngredient({
                                                                            ...newIngredient,
                                                                            calories_per_100g: Number(e.target.value),
                                                                        })
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor="protein">Protein (g per 100g)</Label>
                                                                <Input
                                                                    id="protein"
                                                                    type="number"
                                                                    value={newIngredient.protein_per_100g}
                                                                    onChange={(e) =>
                                                                        setNewIngredient({
                                                                            ...newIngredient,
                                                                            protein_per_100g: Number(e.target.value),
                                                                        })
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor="carbs">Carbs (g per 100g)</Label>
                                                                <Input
                                                                    id="carbs"
                                                                    type="number"
                                                                    value={newIngredient.carbs_per_100g}
                                                                    onChange={(e) =>
                                                                        setNewIngredient({
                                                                            ...newIngredient,
                                                                            carbs_per_100g: Number(e.target.value),
                                                                        })
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor="fat">Fat (g per 100g)</Label>
                                                                <Input
                                                                    id="fat"
                                                                    type="number"
                                                                    value={newIngredient.fat_per_100g}
                                                                    onChange={(e) =>
                                                                        setNewIngredient({
                                                                            ...newIngredient,
                                                                            fat_per_100g: Number(e.target.value),
                                                                        })
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor="price">Price (₹ per 100g)</Label>
                                                                <Input
                                                                    id="price"
                                                                    type="number"
                                                                    value={newIngredient.price_per_100g}
                                                                    onChange={(e) =>
                                                                        setNewIngredient({
                                                                            ...newIngredient,
                                                                            price_per_100g: Number(e.target.value),
                                                                        })
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <DialogFooter>
                                                        <Button onClick={addNewCustomIngredient} disabled={isSubmitting}>
                                                            {isSubmitting ? (
                                                                <>
                                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                    Saving...
                                                                </>
                                                            ) : (
                                                                "Save Ingredient"
                                                            )}
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>

                                            {customIngredients.length === 0 ? (
                                                <div className="text-center py-8">
                                                    <p className="text-muted-foreground mb-4">You haven't created any custom ingredients yet</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                    {filteredCustomIngredients.map((ingredient) => (
                                                        <Card key={ingredient.id} className="overflow-hidden">
                                                            <div className="p-4">
                                                                <h3 className="font-medium">{ingredient.name}</h3>
                                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                                    {ingredient.description || "Custom ingredient"}
                                                                </p>
                                                                <div className="mt-2 text-xs text-muted-foreground">
                                                                    <div>Calories: {ingredient.calories_per_100g} kcal/100g</div>
                                                                    <div>Protein: {ingredient.protein_per_100g}g/100g</div>
                                                                    <div>Price: ₹{ingredient.price_per_100g}/100g</div>
                                                                </div>
                                                            </div>
                                                            <div className="bg-muted p-3 flex justify-between">
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => deleteCustomIngredient(ingredient.id)}
                                                                >
                                                                    <Trash className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => addIngredient(ingredient, true)}
                                                                    disabled={customMeal.components.some((c) => c.custom_ingredient_id === ingredient.id)}
                                                                >
                                                                    <Plus className="h-4 w-4 mr-1" />
                                                                    Add
                                                                </Button>
                                                            </div>
                                                        </Card>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-muted-foreground mb-4">Please sign in to create custom ingredients</p>
                                            <Button onClick={() => router.push("/login")}>Sign In</Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="details">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Customize Your Meal</CardTitle>
                                    <CardDescription>Name your meal and add cooking instructions</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="meal-name">Meal Name</Label>
                                        <Input
                                            id="meal-name"
                                            value={customMeal.name}
                                            onChange={(e) => setCustomMeal((prev) => ({ ...prev, name: e.target.value }))}
                                            placeholder="Give your meal a name"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="meal-description">Description (Optional)</Label>
                                        <Textarea
                                            id="meal-description"
                                            value={customMeal.description}
                                            onChange={(e) => setCustomMeal((prev) => ({ ...prev, description: e.target.value }))}
                                            placeholder="Describe your meal"
                                            rows={2}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="meal-instructions">Cooking Instructions</Label>
                                        <Textarea
                                            id="meal-instructions"
                                            value={customMeal.instructions}
                                            onChange={(e) => setCustomMeal((prev) => ({ ...prev, instructions: e.target.value }))}
                                            placeholder="How would you like your meal prepared? Any specific cooking instructions?"
                                            rows={4}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Dietary Type</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {dietaryTypes.map((type) => (
                                                <Badge
                                                    key={type.id}
                                                    variant={customMeal.dietary_type_id === type.id ? "default" : "outline"}
                                                    className="cursor-pointer"
                                                    onClick={() => setCustomMeal((prev) => ({ ...prev, dietary_type_id: type.id }))}
                                                >
                                                    {type.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="customer">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Your Details</CardTitle>
                                    <CardDescription>We need your details to process your custom meal order</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="customer-name">Full Name</Label>
                                        <Input
                                            id="customer-name"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            placeholder="Your full name"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="customer-phone">Phone Number</Label>
                                        <Input
                                            id="customer-phone"
                                            value={customerPhone}
                                            onChange={(e) => setCustomerPhone(e.target.value)}
                                            placeholder="Your phone number"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="customer-address">Delivery Address</Label>
                                        <Textarea
                                            id="customer-address"
                                            value={customerAddress}
                                            onChange={(e) => setCustomerAddress(e.target.value)}
                                            placeholder="Your complete delivery address"
                                            rows={3}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="md:w-1/3">
                    <Card className="sticky top-4">
                        <CardHeader>
                            <CardTitle>Your Custom Meal</CardTitle>
                            <CardDescription>
                                {customMeal.components.length} {customMeal.components.length === 1 ? "ingredient" : "ingredients"}{" "}
                                selected
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-medium text-lg">{customMeal.name}</h3>
                                {customMeal.description && (
                                    <p className="text-sm text-muted-foreground mt-1">{customMeal.description}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-muted p-2 rounded-md text-center">
                                    <div className="font-medium">{customMeal.calories}</div>
                                    <div className="text-muted-foreground">Calories</div>
                                </div>
                                <div className="bg-muted p-2 rounded-md text-center">
                                    <div className="font-medium">{customMeal.protein}g</div>
                                    <div className="text-muted-foreground">Protein</div>
                                </div>
                                <div className="bg-muted p-2 rounded-md text-center">
                                    <div className="font-medium">{customMeal.carbs}g</div>
                                    <div className="text-muted-foreground">Carbs</div>
                                </div>
                                <div className="bg-muted p-2 rounded-md text-center">
                                    <div className="font-medium">{customMeal.fat}g</div>
                                    <div className="text-muted-foreground">Fat</div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <h3 className="font-medium">Selected Ingredients</h3>
                                {customMeal.components.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No ingredients selected yet</p>
                                ) : (
                                    <div className="space-y-3">
                                        {customMeal.components.map((component) => (
                                            <div key={component.id} className="flex items-center justify-between gap-2 pb-2 border-b">
                                                <div>
                                                    <div className="font-medium">
                                                        {component.name}
                                                        {component.is_custom && (
                                                            <Badge variant="outline" className="ml-1 text-xs">
                                                                Custom
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {Math.round(component.calories)} kcal | ₹{component.price_contribution}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24">
                                                        <Label htmlFor={`quantity-${component.id}`} className="sr-only">
                                                            Quantity (g)
                                                        </Label>
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                id={`quantity-${component.id}`}
                                                                type="number"
                                                                min="10"
                                                                max="500"
                                                                value={component.quantity_grams}
                                                                onChange={(e) =>
                                                                    updateIngredientQuantity(component.id, Number.parseInt(e.target.value) || 10)
                                                                }
                                                                className="w-16 h-8"
                                                            />
                                                            <span className="text-xs">g</span>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeIngredient(component.id)}
                                                        className="h-8 w-8 text-destructive"
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {customMeal.instructions && (
                                <>
                                    <Separator />
                                    <div>
                                        <h3 className="font-medium mb-1">Cooking Instructions</h3>
                                        <p className="text-sm whitespace-pre-line">{customMeal.instructions}</p>
                                    </div>
                                </>
                            )}

                            <Separator />

                            <div className="flex justify-between items-center font-medium">
                                <span>Total Price</span>
                                <span>₹{customMeal.total_price.toFixed(2)}</span>
                            </div>

                            <div className="text-xs text-muted-foreground">
                                Base price: ₹{customMeal.base_price.toFixed(2)} + Ingredients: ₹
                                {(customMeal.total_price - customMeal.base_price).toFixed(2)}
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-3">
                            <Button
                                className="w-full bg-green-500 hover:bg-green-600"
                                onClick={placeOrderViaWhatsApp}
                                disabled={isSubmitting || customMeal.components.length === 0}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Order via WhatsApp
                                    </>
                                )}
                            </Button>

                            {isAuthenticated && (
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={saveCustomMeal}
                                    disabled={isSubmitting || customMeal.components.length === 0}
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Custom Meal
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}
