"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MealCategory } from "@/types/meals"
import { 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react"

interface CategoryTabsProps {
  categories: MealCategory[]
  activeCategory: string | null
  onCategoryChange: (categoryId: string | null) => void
}

export function CategoryTabs({ 
  categories, 
  activeCategory, 
  onCategoryChange 
}: CategoryTabsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftScroll, setShowLeftScroll] = useState(false)
  const [showRightScroll, setShowRightScroll] = useState(false)
  
  useEffect(() => {
    const checkScroll = () => {
      if (!scrollContainerRef.current) return
      
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setShowLeftScroll(scrollLeft > 0)
      setShowRightScroll(scrollLeft + clientWidth < scrollWidth - 10)
    }
    
    checkScroll()
    
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScroll)
    }
    
    window.addEventListener('resize', checkScroll)
    
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScroll)
      }
      window.removeEventListener('resize', checkScroll)
    }
  }, [categories])
  
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }
  
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }
  
  return (
    <div className="relative">
      {showLeftScroll && (
        <Button
          variant="ghost" 
          size="icon"
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white h-8 w-8 rounded-full shadow-sm"
          onClick={scrollLeft}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}
      
      <div 
        ref={scrollContainerRef}
        className="flex space-x-2 overflow-x-auto py-2 px-1 no-scrollbar relative"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <Button
          variant={activeCategory === null ? "default" : "outline"}
          size="sm"
          className={cn(
            "rounded-full transition-all whitespace-nowrap",
            activeCategory === null 
              ? "bg-green-500 hover:bg-green-600 text-white" 
              : "border-gray-200 text-gray-700"
          )}
          onClick={() => onCategoryChange(null)}
        >
          All Categories
        </Button>
        
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? "default" : "outline"}
            size="sm"
            className={cn(
              "rounded-full transition-all whitespace-nowrap",
              activeCategory === category.id 
                ? "bg-green-500 hover:bg-green-600 text-white" 
                : "border-gray-200 text-gray-700"
            )}
            onClick={() => onCategoryChange(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>
      
      {showRightScroll && (
        <Button
          variant="ghost" 
          size="icon"
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white h-8 w-8 rounded-full shadow-sm"
          onClick={scrollRight}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}
    </div>
  )
} 