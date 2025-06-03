// components/scroll-to-top.tsx
"use client"

import * as React from "react"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function ScrollToTop() {
    const [isVisible, setIsVisible] = React.useState(false)

    // Check if we're on the client side
    const isBrowser = typeof window !== "undefined"

    // Show button when page is scrolled down
    const toggleVisibility = () => {
        if (!isBrowser) return
        if (window.pageYOffset > 300) {
            setIsVisible(true)
        } else {
            setIsVisible(false)
        }
    }

    // Set up scroll event listener
    React.useEffect(() => {
        if (!isBrowser) return
        window.addEventListener("scroll", toggleVisibility)
        return () => window.removeEventListener("scroll", toggleVisibility)
    }, [isBrowser])

    // Scroll to top
    const scrollToTop = () => {
        if (!isBrowser) return
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        })
    }

    return (
        <Button
            variant="secondary"
            size="icon"
            className={cn(
                "fixed bottom-6 right-6 z-50 rounded-full shadow-lg transition-opacity duration-300",
                isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            onClick={scrollToTop}
            aria-label="Scroll to top"
        >
            {/* <ArrowUp className="h-5 w-5" /> */}
        </Button>
    )
}