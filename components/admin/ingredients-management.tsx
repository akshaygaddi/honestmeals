"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import { Switch } from "@/components/ui/switch"
import { toast } from "react-hot-toast"
import { Plus, Search, Edit, Trash2, Loader2, AlertTriangle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

// Define Zod schema for form validation
const ingredientSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    calories_per_100g: z.number().min(0, "Must be positive"),
    protein_per_100g: z.number().min(0, "Must be positive"),
    carbs_per_100g: z.number().min(0, "Must be positive"),
    fat_per_100g: z.number().min(0, "Must be positive"),
    price_per_100g: z.number().min(0, "Must be positive"),
    is_allergen: z.boolean(),
})

type Ingredient = {
    id: string
    name: string
    description: string | null
    calories_per_100g: number
    protein_per_100g: number
    carbs_per_100g: number
    fat_per_100g: number
    is_allergen: boolean
    price_per_100g: number
}

type FormData = z.infer<typeof ingredientSchema>

export default function IngredientsManagement() {
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [ingredients, setIngredients] = useState<Ingredient[]>([])
    const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [showOnlyAllergens, setShowOnlyAllergens] = useState(false)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [currentIngredient, setCurrentIngredient] = useState<Ingredient | null>(null)

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(ingredientSchema),
        defaultValues: {
            name: "",
            description: "",
            calories_per_100g: 0,
            protein_per_100g: 0,
            carbs_per_100g: 0,
            fat_per_100g: 0,
            price_per_100g: 0,
            is_allergen: false,
        },
    })

    useEffect(() => {
        fetchIngredients()
    }, [])

    async function fetchIngredients() {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from("ingredients")
                .select("*")
                .order("name", { ascending: true })

            if (error) throw error

            setIngredients(data || [])
            setFilteredIngredients(data || [])
        } catch (error) {
            console.error("Error fetching ingredients:", error)
            toast.error("Failed to load ingredients")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let filtered = [...ingredients]

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(ingredient =>
                ingredient.name.toLowerCase().includes(query) ||
                (ingredient.description && ingredient.description.toLowerCase().includes(query)))
        }

        if (showOnlyAllergens) {
            filtered = filtered.filter(ingredient => ingredient.is_allergen)
        }

        setFilteredIngredients(filtered)
    }, [ingredients, searchQuery, showOnlyAllergens])

    const handleAddIngredient = async (data: FormData) => {
        setIsSubmitting(true)



        try {
            const { data: newIngredient, error } = await supabase
                .from("ingredients")
                .insert({
                    ...data,
                    description: data.description || null
                })
                .select()
                .single()

            if (error) throw error

            toast.success("Ingredient added successfully")
            setIsAddDialogOpen(false)
            fetchIngredients()
            reset()
        } catch (error) {
            console.error("Error adding ingredient:", error)
            toast.error("Failed to add ingredient")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEditIngredient = (ingredient: Ingredient) => {
        setCurrentIngredient(ingredient)
        setValue("name", ingredient.name)
        setValue("description", ingredient.description || "")
        setValue("calories_per_100g", ingredient.calories_per_100g)
        setValue("protein_per_100g", ingredient.protein_per_100g)
        setValue("carbs_per_100g", ingredient.carbs_per_100g)
        setValue("fat_per_100g", ingredient.fat_per_100g)
        setValue("price_per_100g", ingredient.price_per_100g)
        setValue("is_allergen", ingredient.is_allergen)
        setIsEditDialogOpen(true)
    }

    const handleUpdateIngredient = async (data: FormData) => {
        if (!currentIngredient) return

        setIsSubmitting(true)

        try {
            const { error } = await supabase
                .from("ingredients")
                .update({
                    ...data,
                    description: data.description || null
                })
                .eq("id", currentIngredient.id)

            if (error) throw error

            toast.success("Ingredient updated successfully")
            setIsEditDialogOpen(false)
            fetchIngredients()
            setCurrentIngredient(null)
        } catch (error) {
            console.error("Error updating ingredient:", error)
            toast.error("Failed to update ingredient")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteIngredient = async () => {
        if (!currentIngredient) return

        setIsSubmitting(true)

        try {
            // Check if ingredient is used in any meals
            const { count, error: countError } = await supabase
                .from("meal_ingredients")
                .select("*", { count: "exact", head: true })
                .eq("ingredient_id", currentIngredient.id)

            if (countError) throw countError
            if (count && count > 0) {
                throw new Error(`Ingredient is used in ₹{count} meals`)
            }

            const { error } = await supabase
                .from("ingredients")
                .delete()
                .eq("id", currentIngredient.id)

            if (error) throw error

            toast.success("Ingredient deleted successfully")
            setIsDeleteDialogOpen(false)
            fetchIngredients()
            setCurrentIngredient(null)
        } catch (error: any) {
            console.error("Error deleting ingredient:", error)
            toast.error(error.message || "Failed to delete ingredient")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Ingredients Management</h2>
                    <p className="text-muted-foreground">
                        Manage ingredients and their nutritional values
                    </p>
                </div>
                <Button
                    onClick={() => {
                        setIsAddDialogOpen(true)
                        reset()
                    } }
                    className="bg-green-600 hover:bg-green-700"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Ingredient dd
                </Button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                type="text"
                                placeholder="Search ingredients..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="allergens-only"
                                checked={showOnlyAllergens}
                                onCheckedChange={setShowOnlyAllergens}
                            />
                            <Label htmlFor="allergens-only">Allergens Only</Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Ingredients List</CardTitle>
                    <CardDescription>
                        {filteredIngredients.length} {filteredIngredients.length === 1 ? "ingredient" : "ingredients"} found
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                        </div>
                    ) : filteredIngredients.length === 0 ? (
                        <div className="text-center py-12">
                            <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
                            <h3 className="text-lg font-medium">No ingredients found</h3>
                            <p className="text-muted-foreground mb-4">
                                Try adjusting your search or add a new ingredient
                            </p>
                            <Button
                                onClick={() => setIsAddDialogOpen(true)}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Ingredient
                            </Button>
                        </div>
                    ) : (
                        <ScrollArea className="h-[500px] rounded-md border">
                            <Table>
                                <TableHeader className="sticky top-0 bg-background">
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead className="text-right">Calories</TableHead>
                                        <TableHead className="text-right">Protein</TableHead>
                                        <TableHead className="text-right">Carbs</TableHead>
                                        <TableHead className="text-right">Fat</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead>Allergen</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredIngredients.map((ingredient) => (
                                        <TableRow key={ingredient.id}>
                                            <TableCell className="font-medium">{ingredient.name}</TableCell>
                                            <TableCell className="text-right">{ingredient.calories_per_100g}</TableCell>
                                            <TableCell className="text-right">{ingredient.protein_per_100g}g</TableCell>
                                            <TableCell className="text-right">{ingredient.carbs_per_100g}g</TableCell>
                                            <TableCell className="text-right">{ingredient.fat_per_100g}g</TableCell>
                                            <TableCell className="text-right">₹{ingredient.price_per_100g.toFixed(2)}</TableCell>
                                            <TableCell>
                                                {ingredient.is_allergen ? (
                                                    <Badge variant="destructive">Allergen</Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => handleEditIngredient(ingredient)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="text-red-600 hover:text-red-700"
                                                        onClick={() => {
                                                            setCurrentIngredient(ingredient)
                                                            setIsDeleteDialogOpen(true)
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>

            {/* Add Ingredient Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add New Ingredient</DialogTitle>
                        <DialogDescription>
                            Add a new ingredient with nutritional information.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(handleAddIngredient)}>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    {...register("name")}
                                    placeholder="Enter ingredient name"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{errors.name.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    {...register("description")}
                                    placeholder="Enter description (optional)"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="calories_per_100g">Calories (per 100g) *</Label>
                                    <Input
                                        id="calories_per_100g"
                                        type="number"
                                        step="0.1"
                                        {...register("calories_per_100g", { valueAsNumber: true })}
                                    />
                                    {errors.calories_per_100g && (
                                        <p className="text-sm text-red-500">{errors.calories_per_100g.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="protein_per_100g">Protein (g) *</Label>
                                    <Input
                                        id="protein_per_100g"
                                        type="number"
                                        step="0.1"
                                        {...register("protein_per_100g", { valueAsNumber: true })}
                                    />
                                    {errors.protein_per_100g && (
                                        <p className="text-sm text-red-500">{errors.protein_per_100g.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="carbs_per_100g">Carbs (g) *</Label>
                                    <Input
                                        id="carbs_per_100g"
                                        type="number"
                                        step="0.1"
                                        {...register("carbs_per_100g", { valueAsNumber: true })}
                                    />
                                    {errors.carbs_per_100g && (
                                        <p className="text-sm text-red-500">{errors.carbs_per_100g.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="fat_per_100g">Fat (g) *</Label>
                                    <Input
                                        id="fat_per_100g"
                                        type="number"
                                        step="0.1"
                                        {...register("fat_per_100g", { valueAsNumber: true })}
                                    />
                                    {errors.fat_per_100g && (
                                        <p className="text-sm text-red-500">{errors.fat_per_100g.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="price_per_100g">Price (per 100g) *</Label>
                                <Input
                                    id="price_per_100g"
                                    type="number"
                                    step="0.01"
                                    {...register("price_per_100g", { valueAsNumber: true })}
                                />
                                {errors.price_per_100g && (
                                    <p className="text-sm text-red-500">{errors.price_per_100g.message}</p>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is_allergen"
                                    {...register("is_allergen")}
                                />
                                <Label htmlFor="is_allergen">Mark as Allergen</Label>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setIsAddDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Ingredient
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Ingredient Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Ingredient</DialogTitle>
                        <DialogDescription>
                            Update the ingredient details.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(handleUpdateIngredient)}>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Name *</Label>
                                <Input
                                    id="edit-name"
                                    {...register("name")}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{errors.name.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Input
                                    id="edit-description"
                                    {...register("description")}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-calories">Calories (per 100g) *</Label>
                                    <Input
                                        id="edit-calories"
                                        type="number"
                                        step="0.1"
                                        {...register("calories_per_100g", { valueAsNumber: true })}
                                    />
                                    {errors.calories_per_100g && (
                                        <p className="text-sm text-red-500">{errors.calories_per_100g.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-protein">Protein (g) *</Label>
                                    <Input
                                        id="edit-protein"
                                        type="number"
                                        step="0.1"
                                        {...register("protein_per_100g", { valueAsNumber: true })}
                                    />
                                    {errors.protein_per_100g && (
                                        <p className="text-sm text-red-500">{errors.protein_per_100g.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-carbs">Carbs (g) *</Label>
                                    <Input
                                        id="edit-carbs"
                                        type="number"
                                        step="0.1"
                                        {...register("carbs_per_100g", { valueAsNumber: true })}
                                    />
                                    {errors.carbs_per_100g && (
                                        <p className="text-sm text-red-500">{errors.carbs_per_100g.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-fat">Fat (g) *</Label>
                                    <Input
                                        id="edit-fat"
                                        type="number"
                                        step="0.1"
                                        {...register("fat_per_100g", { valueAsNumber: true })}
                                    />
                                    {errors.fat_per_100g && (
                                        <p className="text-sm text-red-500">{errors.fat_per_100g.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-price">Price (per 100g) *</Label>
                                <Input
                                    id="edit-price"
                                    type="number"
                                    step="0.01"
                                    {...register("price_per_100g", { valueAsNumber: true })}
                                />
                                {errors.price_per_100g && (
                                    <p className="text-sm text-red-500">{errors.price_per_100g.message}</p>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="edit-is_allergen"
                                    {...register("is_allergen")}
                                />
                                <Label htmlFor="edit-is_allergen">Mark as Allergen</Label>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setIsEditDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Update Ingredient
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this ingredient? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    {currentIngredient && (
                        <div className="py-4">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <h4 className="font-medium">{currentIngredient.name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {currentIngredient.calories_per_100g} kcal per 100g
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteIngredient}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Ingredient
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}