"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

type Ingredient = {
    id: string
    name: string
    description: string | null
    calories_per_100g: number
    protein_per_100g: number
    carbs_per_100g: number
    fat_per_100g: number
    is_allergen: boolean
}

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

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        calories_per_100g: "",
        protein_per_100g: "",
        carbs_per_100g: "",
        fat_per_100g: "",
        is_allergen: false,
    })

    useEffect(() => {
        async function fetchIngredients() {
            setLoading(true)
            try {
                const { data, error } = await supabase.from("ingredients").select("*").order("name")

                if (error) {
                    throw error
                }

                setIngredients(data || [])
                setFilteredIngredients(data || [])
            } catch (error) {
                console.error("Error fetching ingredients:", error)
                toast.error("Failed to load ingredients")
            } finally {
                setLoading(false)
            }
        }

        fetchIngredients()
    }, [supabase])

    useEffect(() => {
        let filtered = [...ingredients]
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(
                (ingredient) =>
                    ingredient.name.toLowerCase().includes(query) ||
                    (ingredient.description && ingredient.description.toLowerCase().includes(query)),
            )
        }
        if (showOnlyAllergens) {
            filtered = filtered.filter((ingredient) => ingredient.is_allergen)
        }
        setFilteredIngredients(filtered)
    }, [ingredients, searchQuery, showOnlyAllergens])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handleSwitchChange = (name: string, checked: boolean) => {
        setFormData({ ...formData, [name]: checked })
    }

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            calories_per_100g: "",
            protein_per_100g: "",
            carbs_per_100g: "",
            fat_per_100g: "",
            is_allergen: false,
        })
    }

    const handleAddIngredient = async () => {
        if (
            !formData.name ||
            !formData.calories_per_100g ||
            !formData.protein_per_100g ||
            !formData.carbs_per_100g ||
            !formData.fat_per_100g
        ) {
            toast.error("Please fill in all required fields")
            return
        }

        setIsSubmitting(true)

        try {
            const { data, error } = await supabase
                .from("ingredients")
                .insert({
                    name: formData.name,
                    description: formData.description || null,
                    calories_per_100g: Number.parseFloat(formData.calories_per_100g),
                    protein_per_100g: Number.parseFloat(formData.protein_per_100g),
                    carbs_per_100g: Number.parseFloat(formData.carbs_per_100g),
                    fat_per_100g: Number.parseFloat(formData.fat_per_100g),
                    is_allergen: formData.is_allergen,
                })
                .select()

            if (error) {
                throw error
            }

            toast.success("Ingredient added successfully")
            setIsAddDialogOpen(false)

            // Refresh ingredients list
            const { data: ingredientsData } = await supabase.from("ingredients").select("*").order("name")
            setIngredients(ingredientsData || [])
        } catch (error) {
            console.error("Error adding ingredient:", error)
            toast.error("An error occurred while adding the ingredient")
        } finally {
            setIsSubmitting(false)
            resetForm()
        }
    }

    const handleEditIngredient = (ingredient: Ingredient) => {
        setCurrentIngredient(ingredient)
        setFormData({
            name: ingredient.name,
            description: ingredient.description || "",
            calories_per_100g: ingredient.calories_per_100g.toString(),
            protein_per_100g: ingredient.protein_per_100g.toString(),
            carbs_per_100g: ingredient.carbs_per_100g.toString(),
            fat_per_100g: ingredient.fat_per_100g.toString(),
            is_allergen: ingredient.is_allergen,
        })
        setIsEditDialogOpen(true)
    }

    const handleUpdateIngredient = async () => {
        if (!currentIngredient) return

        if (
            !formData.name ||
            !formData.calories_per_100g ||
            !formData.protein_per_100g ||
            !formData.carbs_per_100g ||
            !formData.fat_per_100g
        ) {
            toast.error("Please fill in all required fields")
            return
        }

        setIsSubmitting(true)

        try {
            const { error } = await supabase
                .from("ingredients")
                .update({
                    name: formData.name,
                    description: formData.description || null,
                    calories_per_100g: Number.parseFloat(formData.calories_per_100g),
                    protein_per_100g: Number.parseFloat(formData.protein_per_100g),
                    carbs_per_100g: Number.parseFloat(formData.carbs_per_100g),
                    fat_per_100g: Number.parseFloat(formData.fat_per_100g),
                    is_allergen: formData.is_allergen,
                })
                .eq("id", currentIngredient.id)

            if (error) {
                throw error
            }

            toast.success("Ingredient updated successfully")
            setIsEditDialogOpen(false)

            // Refresh ingredients list
            const { data: ingredientsData } = await supabase.from("ingredients").select("*").order("name")
            setIngredients(ingredientsData || [])
        } catch (error) {
            console.error("Error updating ingredient:", error)
            toast.error("An error occurred while updating the ingredient")
        } finally {
            setIsSubmitting(false)
            setCurrentIngredient(null)
            resetForm()
        }
    }

    const handleDeleteClick = (ingredient: Ingredient) => {
        setCurrentIngredient(ingredient)
        setIsDeleteDialogOpen(true)
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

            if (countError) {
                throw countError
            }

            if (count && count > 0) {
                toast.error(`Cannot delete: This ingredient is used in ${count} meals`)
                setIsDeleteDialogOpen(false)
                setIsSubmitting(false)
                setCurrentIngredient(null)
                return
            }

            // If not used, proceed with deletion
            const { error } = await supabase.from("ingredients").delete().eq("id", currentIngredient.id)

            if (error) {
                throw error
            }

            toast.success("Ingredient deleted successfully")
            setIsDeleteDialogOpen(false)

            // Refresh ingredients list
            const { data: ingredientsData } = await supabase.from("ingredients").select("*").order("name")
            setIngredients(ingredientsData || [])
        } catch (error) {
            console.error("Error deleting ingredient:", error)
            toast.error("An error occurred while deleting the ingredient")
        } finally {
            setIsSubmitting(false)
            setCurrentIngredient(null)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Ingredients Management</h2>
                    <p className="text-muted-foreground">Manage ingredients and their nutritional values</p>
                </div>
                <Button
                    onClick={() => {
                        resetForm()
                        setIsAddDialogOpen(true)
                    }}
                    className="bg-green-500 hover:bg-green-600"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Ingredient
                </Button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                type="text"
                                placeholder="Search ingredients..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-white border-gray-200"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="allergens-only" checked={showOnlyAllergens} onCheckedChange={setShowOnlyAllergens} />
                            <Label htmlFor="allergens-only">Allergens Only</Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Ingredients List</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                        </div>
                    ) : filteredIngredients.length === 0 ? (
                        <div className="text-center py-12">
                            <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
                            <h3 className="text-lg font-medium">No ingredients found</h3>
                            <p className="text-muted-foreground mb-4">Try adjusting your search or add a new ingredient</p>
                            <Button
                                onClick={() => {
                                    resetForm()
                                    setIsAddDialogOpen(true)
                                }}
                                className="bg-green-500 hover:bg-green-600"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Ingredient
                            </Button>
                        </div>
                    ) : (
                        <ScrollArea className="h-[500px]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead className="text-right">Calories (per 100g)</TableHead>
                                        <TableHead className="text-right">Protein (g)</TableHead>
                                        <TableHead className="text-right">Carbs (g)</TableHead>
                                        <TableHead className="text-right">Fat (g)</TableHead>
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
                                            <TableCell>
                                                {ingredient.is_allergen ? (
                                                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Allergen</Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">No</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <Button variant="outline" size="icon" onClick={() => handleEditIngredient(ingredient)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="text-red-500 hover:text-red-600"
                                                        onClick={() => handleDeleteClick(ingredient)}
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

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add New Ingredient</DialogTitle>
                        <DialogDescription>Add a new ingredient with nutritional information.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Ingredient Name *</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Enter ingredient name"
                                value={formData.name}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                name="description"
                                placeholder="Enter description (optional)"
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="calories_per_100g">Calories (per 100g) *</Label>
                                <Input
                                    id="calories_per_100g"
                                    name="calories_per_100g"
                                    type="number"
                                    step="0.1"
                                    placeholder="0"
                                    value={formData.calories_per_100g}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="protein_per_100g">Protein (g) *</Label>
                                <Input
                                    id="protein_per_100g"
                                    name="protein_per_100g"
                                    type="number"
                                    step="0.1"
                                    placeholder="0.0"
                                    value={formData.protein_per_100g}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="carbs_per_100g">Carbs (g) *</Label>
                                <Input
                                    id="carbs_per_100g"
                                    name="carbs_per_100g"
                                    type="number"
                                    step="0.1"
                                    placeholder="0.0"
                                    value={formData.carbs_per_100g}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fat_per_100g">Fat (g) *</Label>
                                <Input
                                    id="fat_per_100g"
                                    name="fat_per_100g"
                                    type="number"
                                    step="0.1"
                                    placeholder="0.0"
                                    value={formData.fat_per_100g}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="is_allergen"
                                checked={formData.is_allergen}
                                onCheckedChange={(checked) => handleSwitchChange("is_allergen", checked)}
                            />
                            <Label htmlFor="is_allergen">Mark as Allergen</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                resetForm()
                                setIsAddDialogOpen(false)
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleAddIngredient} className="bg-green-500 hover:bg-green-600" disabled={isSubmitting}>
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
                </DialogContent>
            </Dialog>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Ingredient</DialogTitle>
                        <DialogDescription>Update the ingredient details.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Ingredient Name *</Label>
                            <Input
                                id="edit-name"
                                name="name"
                                placeholder="Enter ingredient name"
                                value={formData.name}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Input
                                id="edit-description"
                                name="description"
                                placeholder="Enter description (optional)"
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-calories_per_100g">Calories (per 100g) *</Label>
                                <Input
                                    id="edit-calories_per_100g"
                                    name="calories_per_100g"
                                    type="number"
                                    step="0.1"
                                    placeholder="0"
                                    value={formData.calories_per_100g}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-protein_per_100g">Protein (g) *</Label>
                                <Input
                                    id="edit-protein_per_100g"
                                    name="protein_per_100g"
                                    type="number"
                                    step="0.1"
                                    placeholder="0.0"
                                    value={formData.protein_per_100g}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-carbs_per_100g">Carbs (g) *</Label>
                                <Input
                                    id="edit-carbs_per_100g"
                                    name="carbs_per_100g"
                                    type="number"
                                    step="0.1"
                                    placeholder="0.0"
                                    value={formData.carbs_per_100g}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-fat_per_100g">Fat (g) *</Label>
                                <Input
                                    id="edit-fat_per_100g"
                                    name="fat_per_100g"
                                    type="number"
                                    step="0.1"
                                    placeholder="0.0"
                                    value={formData.fat_per_100g}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="edit-is_allergen"
                                checked={formData.is_allergen}
                                onCheckedChange={(checked) => handleSwitchChange("is_allergen", checked)}
                            />
                            <Label htmlFor="edit-is_allergen">Mark as Allergen</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                resetForm()
                                setIsEditDialogOpen(false)
                                setCurrentIngredient(null)
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateIngredient}
                            className="bg-green-500 hover:bg-green-600"
                            disabled={isSubmitting}
                        >
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
                </DialogContent>
            </Dialog>

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
                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <h4 className="font-medium">{currentIngredient.name}</h4>
                                    <p className="text-sm text-muted-foreground">{currentIngredient.calories_per_100g} kcal per 100g</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDeleteDialogOpen(false)
                                setCurrentIngredient(null)
                            }}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteIngredient} disabled={isSubmitting}>
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

