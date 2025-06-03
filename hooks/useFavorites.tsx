"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "react-hot-toast"
import { useAuth } from "./useAuth"
import { User } from "@supabase/supabase-js"

// Define interface for favorite item returned from Supabase query
interface FavoriteRecord {
  meal_id: string
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  // Fetch favorites from Supabase when the user is logged in
  useEffect(() => {
    async function fetchFavorites() {
      setLoading(true)
      
      if (!user) {
        // If user is not logged in, load favorites from localStorage
        const savedFavorites = localStorage.getItem("honestMealsFavorites")
        if (savedFavorites) {
          try {
            setFavorites(JSON.parse(savedFavorites))
          } catch (e) {
            console.error("Failed to parse favorites from localStorage")
          }
        }
        setLoading(false)
        return
      }

      // User is logged in, fetch from Supabase
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('meal_id')
          .eq('user_id', user.id)

        if (error) {
          console.error('Error fetching favorites:', error)
          toast.error('Failed to load your favorites')
          return
        }

        // Extract meal IDs from the response
        const favoriteMealIds = data?.map((fav: FavoriteRecord) => fav.meal_id) || []
        setFavorites(favoriteMealIds)

        // Also save to localStorage as a backup/offline access
        localStorage.setItem("honestMealsFavorites", JSON.stringify(favoriteMealIds))
      } catch (error) {
        console.error('Error in favorites fetch:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [supabase, user])

  // Toggle a meal as favorite
  const toggleFavorite = useCallback(async (mealId: string) => {
    if (!user) {
      // If user is not logged in, just use localStorage
      setFavorites(prevFavorites => {
        const newFavorites = prevFavorites.includes(mealId)
          ? prevFavorites.filter(id => id !== mealId)
          : [...prevFavorites, mealId]
        
        localStorage.setItem("honestMealsFavorites", JSON.stringify(newFavorites))
        return newFavorites
      })
      
      return { success: true, requiresAuth: true }
    }

    // User is logged in, use Supabase
    try {
      if (favorites.includes(mealId)) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('meal_id', mealId)

        if (error) {
          console.error('Error removing favorite:', error)
          toast.error('Failed to remove from favorites')
          return { success: false, error }
        }

        // Update local state
        setFavorites(prevFavorites => {
          const newFavorites = prevFavorites.filter(id => id !== mealId)
          localStorage.setItem("honestMealsFavorites", JSON.stringify(newFavorites))
          return newFavorites
        })
        
        return { success: true }
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert([{ 
            user_id: user.id,
            meal_id: mealId,
            created_at: new Date().toISOString()
          }])

        if (error) {
          console.error('Error adding favorite:', error)
          toast.error('Failed to add to favorites')
          return { success: false, error }
        }

        // Update local state
        setFavorites(prevFavorites => {
          const newFavorites = [...prevFavorites, mealId]
          localStorage.setItem("honestMealsFavorites", JSON.stringify(newFavorites))
          return newFavorites
        })
        
        return { success: true }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      return { success: false, error }
    }
  }, [favorites, supabase, user])

  // Sync localStorage favorites to Supabase when user logs in
  const syncFavoritesToSupabase = useCallback(async () => {
    if (!user) return

    const localFavorites = localStorage.getItem("honestMealsFavorites")
    if (!localFavorites) return

    try {
      const favoritesArray = JSON.parse(localFavorites)
      
      // Get existing favorites from Supabase
      const { data, error } = await supabase
        .from('favorites')
        .select('meal_id')
        .eq('user_id', user.id)
      
      if (error) {
        console.error('Error fetching favorites for sync:', error)
        return
      }
      
      // Find favorites that need to be added to Supabase
      const existingFavorites = data?.map((fav: FavoriteRecord) => fav.meal_id) || []
      const favoritesToAdd = favoritesArray.filter(
        (id: string) => !existingFavorites.includes(id)
      )
      
      if (favoritesToAdd.length === 0) return
      
      // Insert the new favorites
      const { error: insertError } = await supabase
        .from('favorites')
        .insert(
          favoritesToAdd.map((mealId: string) => ({
            user_id: user.id,
            meal_id: mealId,
            created_at: new Date().toISOString()
          }))
        )
      
      if (insertError) {
        console.error('Error syncing favorites to Supabase:', insertError)
      }
    } catch (error) {
      console.error('Error in favorites sync:', error)
    }
  }, [supabase, user])

  return { 
    favorites, 
    toggleFavorite, 
    syncFavoritesToSupabase,
    isLoading: loading,
    isFavorite: (mealId: string) => favorites.includes(mealId)
  }
} 