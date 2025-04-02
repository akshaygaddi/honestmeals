"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { toast } from "react-hot-toast"
import { CalendarIcon, Plus, Trash2, Edit, Save, X, Search, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type FoodEntry = {
  id: string
  user_id: string
  date: string
  meal_type: string
  food_name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  notes: string | null
}

export default function FoodJournal({ userId }: { userId: string | null }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<FoodEntry[]>([])
  const [date, setDate] = useState<Date>(new Date())
  const [isAddingEntry, setIsAddingEntry] = useState(false)
  const [editingEntry, setEditingEntry] = useState<string | null>(null)

  // New entry form state
  const [newEntry, setNewEntry] = useState({
    meal_type: "breakfast",
    food_name: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    notes: "",
  })

  // Search state for food database
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (!userId) return

    fetchEntries()
  }, [userId, date])

  const fetchEntries = async () => {
    setLoading(true)

    const formattedDate = format(date, "yyyy-MM-dd")

    const { data, error } = await supabase
      .from("food_journal")
      .select("*")
      .eq("user_id", userId)
      .eq("date", formattedDate)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching food journal entries:", error)
      toast.error("Failed to load food journal")
    } else {
      setEntries(data || [])
    }

    setLoading(false)
  }

  const handleAddEntry = async () => {
    if (!userId) return

    if (!newEntry.food_name || newEntry.calories <= 0) {
      toast.error("Please enter food name and calories")
      return
    }

    setLoading(true)

    const formattedDate = format(date, "yyyy-MM-dd")

    const { error } = await supabase.from("food_journal").insert({
      user_id: userId,
      date: formattedDate,
      meal_type: newEntry.meal_type,
      food_name: newEntry.food_name,
      calories: newEntry.calories,
      protein: newEntry.protein,
      carbs: newEntry.carbs,
      fat: newEntry.fat,
      notes: newEntry.notes || null,
    })

    if (error) {
      console.error("Error adding food entry:", error)
      toast.error("Failed to add food entry")
    } else {
      toast.success("Food entry added")
      setNewEntry({
        meal_type: "breakfast",
        food_name: "",
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        notes: "",
      })
      setIsAddingEntry(false)
      fetchEntries()
    }

    setLoading(false)
  }

  const handleUpdateEntry = async (id: string) => {
    if (!userId) return

    const entryToUpdate = entries.find((entry) => entry.id === id)
    if (!entryToUpdate) return

    setLoading(true)

    const { error } = await supabase.from("food_journal").update(entryToUpdate).eq("id", id)

    if (error) {
      console.error("Error updating food entry:", error)
      toast.error("Failed to update food entry")
    } else {
      toast.success("Food entry updated")
      setEditingEntry(null)
      fetchEntries()
    }

    setLoading(false)
  }

  const handleDeleteEntry = async (id: string) => {
    if (!userId) return

    setLoading(true)

    const { error } = await supabase.from("food_journal").delete().eq("id", id)

    if (error) {
      console.error("Error deleting food entry:", error)
      toast.error("Failed to delete food entry")
    } else {
      toast.success("Food entry deleted")
      fetchEntries()
    }

    setLoading(false)
  }

  const handleSearchFood = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)

    try {
      // This would typically be an API call to a food database
      // For demo purposes, we'll use a mock response
      setTimeout(() => {
        const mockResults = [
          { name: "Apple", calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
          { name: "Banana", calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
          { name: "Chicken Breast", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
          { name: "Brown Rice (1 cup)", calories: 216, protein: 5, carbs: 45, fat: 1.8 },
          { name: "Egg", calories: 78, protein: 6, carbs: 0.6, fat: 5.3 },
        ].filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))

        setSearchResults(mockResults)
        setIsSearching(false)
      }, 500)
    } catch (error) {
      console.error("Error searching food database:", error)
      toast.error("Failed to search food database")
      setIsSearching(false)
    }
  }

  const selectFoodFromSearch = (food: any) => {
    setNewEntry({
      ...newEntry,
      food_name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
    })
    setSearchResults([])
    setSearchQuery("")
  }

  const getTotalCalories = () => {
    return entries.reduce((sum, entry) => sum + entry.calories, 0)
  }

  const getTotalNutrients = () => {
    return {
      protein: entries.reduce((sum, entry) => sum + entry.protein, 0),
      carbs: entries.reduce((sum, entry) => sum + entry.carbs, 0),
      fat: entries.reduce((sum, entry) => sum + entry.fat, 0),
    }
  }

  const getMealTypeEntries = (mealType: string) => {
    return entries.filter((entry) => entry.meal_type === mealType)
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Food Journal</h2>
          <p className="text-gray-500">Track your daily food intake</p>
        </div>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button onClick={() => setIsAddingEntry(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Food
          </Button>
        </div>
      </div>

      {/* Daily Summary Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Daily Summary</CardTitle>
          <CardDescription>{format(date, "EEEE, MMMM d, yyyy")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Total Calories</p>
              <p className="text-2xl font-bold">{getTotalCalories()}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Protein</p>
              <p className="text-2xl font-bold">{getTotalNutrients().protein}g</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Carbs</p>
              <p className="text-2xl font-bold">{getTotalNutrients().carbs}g</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Fat</p>
              <p className="text-2xl font-bold">{getTotalNutrients().fat}g</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meal Tabs */}
      <Tabs defaultValue="breakfast">
        <TabsList className="mb-4">
          <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
          <TabsTrigger value="lunch">Lunch</TabsTrigger>
          <TabsTrigger value="dinner">Dinner</TabsTrigger>
          <TabsTrigger value="snacks">Snacks</TabsTrigger>
        </TabsList>

        {["breakfast", "lunch", "dinner", "snacks"].map((mealType) => (
          <TabsContent key={mealType} value={mealType}>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-green-500" />
              </div>
            ) : getMealTypeEntries(mealType).length > 0 ? (
              <div className="space-y-4">
                {getMealTypeEntries(mealType).map((entry) => (
                  <Card key={entry.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-4">
                        {editingEntry === entry.id ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`edit-food-name-${entry.id}`}>Food Name</Label>
                                <Input
                                  id={`edit-food-name-${entry.id}`}
                                  value={entry.food_name}
                                  onChange={(e) => {
                                    const updatedEntries = entries.map((item) =>
                                      item.id === entry.id ? { ...item, food_name: e.target.value } : item,
                                    )
                                    setEntries(updatedEntries)
                                  }}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`edit-calories-${entry.id}`}>Calories</Label>
                                <Input
                                  id={`edit-calories-${entry.id}`}
                                  type="number"
                                  value={entry.calories}
                                  onChange={(e) => {
                                    const updatedEntries = entries.map((item) =>
                                      item.id === entry.id ? { ...item, calories: Number(e.target.value) } : item,
                                    )
                                    setEntries(updatedEntries)
                                  }}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label htmlFor={`edit-protein-${entry.id}`}>Protein (g)</Label>
                                <Input
                                  id={`edit-protein-${entry.id}`}
                                  type="number"
                                  value={entry.protein}
                                  onChange={(e) => {
                                    const updatedEntries = entries.map((item) =>
                                      item.id === entry.id ? { ...item, protein: Number(e.target.value) } : item,
                                    )
                                    setEntries(updatedEntries)
                                  }}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`edit-carbs-${entry.id}`}>Carbs (g)</Label>
                                <Input
                                  id={`edit-carbs-${entry.id}`}
                                  type="number"
                                  value={entry.carbs}
                                  onChange={(e) => {
                                    const updatedEntries = entries.map((item) =>
                                      item.id === entry.id ? { ...item, carbs: Number(e.target.value) } : item,
                                    )
                                    setEntries(updatedEntries)
                                  }}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`edit-fat-${entry.id}`}>Fat (g)</Label>
                                <Input
                                  id={`edit-fat-${entry.id}`}
                                  type="number"
                                  value={entry.fat}
                                  onChange={(e) => {
                                    const updatedEntries = entries.map((item) =>
                                      item.id === entry.id ? { ...item, fat: Number(e.target.value) } : item,
                                    )
                                    setEntries(updatedEntries)
                                  }}
                                />
                              </div>
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => setEditingEntry(null)}>
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                              </Button>
                              <Button size="sm" onClick={() => handleUpdateEntry(entry.id)}>
                                <Save className="mr-2 h-4 w-4" />
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{entry.food_name}</h3>
                              <p className="text-sm text-gray-500">
                                P: {entry.protein}g | C: {entry.carbs}g | F: {entry.fat}g
                              </p>
                              {entry.notes && <p className="text-sm text-gray-500 mt-1">{entry.notes}</p>}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{entry.calories} cal</span>
                              <Button variant="ghost" size="icon" onClick={() => setEditingEntry(entry.id)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteEntry(entry.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border rounded-lg bg-gray-50">
                <p className="text-gray-500">No {mealType} entries for this day</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setNewEntry({ ...newEntry, meal_type: mealType })
                    setIsAddingEntry(true)
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                </Button>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Add Food Entry Dialog */}
      <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Food Entry</DialogTitle>
            <DialogDescription>Add details about your food intake</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="search-food">Search Food Database</Label>
                <div className="relative">
                  <Input
                    id="search-food"
                    placeholder="Search for a food..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={handleSearchFood}
                    disabled={isSearching}
                  >
                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Select
                value={newEntry.meal_type}
                onValueChange={(value) => setNewEntry({ ...newEntry, meal_type: value })}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Meal Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snacks">Snacks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {searchResults.length > 0 && (
              <div className="border rounded-md max-h-[200px] overflow-y-auto">
                <div className="p-2 bg-gray-50 border-b">
                  <p className="text-sm font-medium">Search Results</p>
                </div>
                <div className="divide-y">
                  {searchResults.map((food, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => selectFoodFromSearch(food)}
                    >
                      <div className="flex justify-between">
                        <p className="font-medium">{food.name}</p>
                        <p>{food.calories} cal</p>
                      </div>
                      <p className="text-sm text-gray-500">
                        P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="food-name">Food Name</Label>
                <Input
                  id="food-name"
                  value={newEntry.food_name}
                  onChange={(e) => setNewEntry({ ...newEntry, food_name: e.target.value })}
                  placeholder="e.g. Apple, Chicken Breast"
                />
              </div>
              <div>
                <Label htmlFor="calories">Calories</Label>
                <Input
                  id="calories"
                  type="number"
                  value={newEntry.calories || ""}
                  onChange={(e) => setNewEntry({ ...newEntry, calories: Number(e.target.value) })}
                  placeholder="e.g. 250"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="protein">Protein (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  value={newEntry.protein || ""}
                  onChange={(e) => setNewEntry({ ...newEntry, protein: Number(e.target.value) })}
                  placeholder="e.g. 20"
                />
              </div>
              <div>
                <Label htmlFor="carbs">Carbs (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  value={newEntry.carbs || ""}
                  onChange={(e) => setNewEntry({ ...newEntry, carbs: Number(e.target.value) })}
                  placeholder="e.g. 30"
                />
              </div>
              <div>
                <Label htmlFor="fat">Fat (g)</Label>
                <Input
                  id="fat"
                  type="number"
                  value={newEntry.fat || ""}
                  onChange={(e) => setNewEntry({ ...newEntry, fat: Number(e.target.value) })}
                  placeholder="e.g. 10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={newEntry.notes}
                onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                placeholder="e.g. Home cooked, Restaurant meal"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingEntry(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEntry} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Entry
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

