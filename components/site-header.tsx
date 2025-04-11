// components/site-header.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export function SiteHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
    const pathname = usePathname()

    const routes = [
        {
            href: "/",
            label: "Home",
            active: pathname === "/",
        },
        {
            href: "/meal-plans",
            label: "Meal Plans",
            active: pathname === "/meal-plans",
        },
        {
            href: "/about",
            label: "About Us",
            active: pathname === "/about",
        },
        {
            href: "/contact",
            label: "Contact",
            active: pathname === "/contact",
        },
    ]

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-6 md:gap-10">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-green-600">Honest Meals</span>
                    </Link>
                    <nav className="hidden md:flex gap-6">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary",
                                    route.active
                                        ? "text-foreground font-semibold"
                                        : "text-foreground/60"
                                )}
                            >
                                {route.label}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <div className="hidden md:flex gap-2">
                        <Link href="/login">
                            <Button variant="outline" size="sm">
                                Log In
                            </Button>
                        </Link>
                        <Link href="/sign-up">
                            <Button size="sm">Sign Up</Button>
                        </Link>
                    </div>
                    <button
                        className="md:hidden"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle Menu"
                    >
                        {mobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden">
                    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
                    <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
                        <div className="flex flex-col gap-y-4 py-4">
                            {routes.map((route) => (
                                <Link
                                    key={route.href}
                                    href={route.href}
                                    className={cn(
                                        "text-base font-medium transition-colors hover:text-primary",
                                        route.active
                                            ? "text-foreground font-semibold"
                                            : "text-foreground/60"
                                    )}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {route.label}
                                </Link>
                            ))}
                            <div className="flex flex-col gap-2 pt-4 border-t">
                                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="outline" className="w-full">
                                        Log In
                                    </Button>
                                </Link>
                                <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                                    <Button className="w-full">Sign Up</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}