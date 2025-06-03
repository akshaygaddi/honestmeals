"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Home, 
  ShoppingCart, 
  Filter, 
  Search as SearchIcon, 
  User, 
  Clock, 
  Heart 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useUserStore } from "@/store/userStore"
import { createClient } from "@/utils/supabase/client"

interface MealsHeaderProps {
  cartItemsCount: number
  onCartOpen: () => void
  onFilterOpen: () => void
  searchQuery: string
  setSearchQuery: (value: string) => void
  isScrolled: boolean
}

export function MealsHeader({
  cartItemsCount,
  onCartOpen,
  onFilterOpen,
  searchQuery,
  setSearchQuery,
  isScrolled
}: MealsHeaderProps) {
  const router = useRouter()
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  
  // Get user data from Zustand store
  const { profile, clearUser } = useUserStore()
  const supabase = createClient()
  
  // Handle logout using server-side API route as recommended by Supabase
  const handleLogout = async () => {
    // Set loading state
    setIsLoggingOut(true)
    
    try {
      // Call the server-side API route to handle logout
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error('Logout failed on the server')
      }
      
      // Clear local state in the Zustand store
      clearUser()
      
      // No need to redirect here as the API response will handle redirection
    } catch (error) {
      // Log error for debugging
      console.error('Logout error:', error)
      
      // Reset UI to logged-in state
      setIsLoggingOut(false)
    }
    // Note: We don't reset isLoggingOut in finally because 
    // the page will be redirected by the server response
  }
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => {
      window.removeEventListener('resize', checkScreenSize)
    }
  }, [])
  
  const handleSearchClick = () => {
    if (isMobile) {
      setIsSearchExpanded(!isSearchExpanded)
    }
  }
  
  return (
    <header 
      className={cn(
        "sticky top-0 z-30 w-full transition-all duration-300",
        isScrolled 
          ? "bg-white shadow-md" 
          : "bg-white/95 backdrop-blur-md border-b border-gray-100"
      )}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => router.push("/")}
            >
              <Home className="h-5 w-5" />
            </Button>
            <h1
              className={cn(
                "font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent cursor-pointer transition-all",
                isScrolled ? "text-xl" : "text-2xl"
              )}
              onClick={() => router.push("/")}
            >
              Honest Meals
            </h1>
          </div>

          <div 
            className={cn(
              "flex items-center md:w-auto transition-all duration-300 overflow-hidden",
              isSearchExpanded ? "w-full ml-4" : "w-auto"
            )}
          >
            {(!isMobile || isSearchExpanded) && (
              <div className="relative flex-1 max-w-md">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search meals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-gray-200 focus-visible:ring-green-500"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isMobile && !isSearchExpanded && (
              <Button variant="ghost" size="icon" onClick={handleSearchClick}>
                <SearchIcon className="h-5 w-5" />
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={onFilterOpen}
              className="relative border-gray-200"
            >
              <Filter className="h-5 w-5" />
            </Button>

            <div className="hidden md:flex gap-1">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => router.push("/favorites")}
              >
                <Heart className="mr-1 h-4 w-4" />
                Favorites
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => router.push("/orders")}
              >
                <Clock className="mr-1 h-4 w-4" />
                Orders
              </Button>
            </div>

            {profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="hidden md:flex rounded-full border border-gray-200"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm font-medium border-b mb-1">
                    {profile.name || profile.email}
                  </div>
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-500 focus:text-red-600 focus:bg-red-50"
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <div className="flex items-center">
                        <div className="h-4 w-4 mr-2 rounded-full border-2 border-red-500 border-t-transparent animate-spin"></div>
                        Logging out...
                      </div>
                    ) : (
                      "Logout"
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-600 hover:text-gray-900"
                  onClick={() => router.push("/sign-in")}
                >
                  Login
                </Button>
                <Button 
                  variant="default"
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => router.push("/sign-up")}
                >
                  Sign Up
                </Button>
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="icon" 
              className="relative border-gray-200"
              onClick={onCartOpen}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <Badge 
                  className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-green-500 text-white text-xs min-w-5 h-5 flex items-center justify-center"
                >
                  {cartItemsCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
} 