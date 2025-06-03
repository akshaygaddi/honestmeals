export type Meal = {
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

export type MealCategory = {
  id: string
  name: string
}

export type DietaryType = {
  id: string
  name: string
}

export type CartItem = Meal & {
  quantity: number
}

export type SortOption = {
  label: string
  value: string
  sortFn: (a: Meal, b: Meal) => number
} 