"use client"

import React, { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"
import {
    LayoutDashboard,
    UtensilsCrossed,
    Users,
    ShoppingBag,
    Tag,
    Settings,
    LogOut,
    ChevronRight,
    Menu,
    X,
    Home,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface AdminLayoutProps {
    children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(true)

    useEffect(() => {
        async function checkAdminStatus() {
            setLoading(true)

            // Check if user is authenticated
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) {
                toast.error("You must be logged in to access the admin area")
                router.push("/login")
                return
            }

            // Since the RPC function doesn't exist, let's check the user's role directly
            // First, check if there's a profiles table with a role column
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            // If profiles table exists and has role data
            if (!profileError && profile && profile.role === 'admin') {
                setIsAdmin(true)
                setLoading(false)
                return
            }

            // Alternative: check user_roles junction table if you have one
            const { data: userRole, error: userRoleError } = await supabase
                .from('user_roles')
                .select('role_id')
                .eq('user_id', user.id)
                .single()

            // If user_roles exists, check if role is admin
            if (!userRoleError && userRole) {
                const { data: role, error: roleError } = await supabase
                    .from('roles')
                    .select('name')
                    .eq('id', userRole.role_id)
                    .single()

                if (!roleError && role && role.name === 'admin') {
                    setIsAdmin(true)
                    setLoading(false)
                    return
                }
            }

            // Alternative: Check if admin role is stored in Supabase auth metadata
            if (user.app_metadata?.role === 'admin' || user.user_metadata?.role === 'admin') {
                setIsAdmin(true)
                setLoading(false)
                return
            }

            // If none of the above checks passed, user is not an admin
            toast.error("You don't have permission to access the admin area")
            router.push("/")
            return
        }

        checkAdminStatus()

        // Handle responsive sidebar
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setSidebarOpen(false)
            } else {
                setSidebarOpen(true)
            }
        }

        handleResize()
        window.addEventListener("resize", handleResize)

        return () => {
            window.removeEventListener("resize", handleResize)
        }
    }, [supabase, router])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        toast.success("Logged out successfully")
        router.push("/")
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="relative w-16 h-16">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-t-green-500 rounded-full animate-spin"></div>
                </div>
            </div>
        )
    }

    if (!isAdmin) {
        return null
    }

    const navigation = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Meals", href: "/admin/meals", icon: UtensilsCrossed },
        { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Categories", href: "/admin/categories", icon: Tag },
        { name: "Settings", href: "/admin/settings", icon: Settings },
    ]

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Mobile sidebar toggle */}
            <div className="fixed top-4 left-4 z-50 lg:hidden">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="bg-white shadow-md"
                >
                    {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </div>

            {/* Sidebar */}
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-64",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full",
                )}
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-center h-16 px-4 border-b">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                            Honest Meals Admin
                        </h1>
                    </div>

                    <div className="flex-1 overflow-y-auto py-4 px-3">
                        <nav className="space-y-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center px-3 py-2 text-sm font-medium rounded-md group",
                                        pathname === item.href ? "bg-green-50 text-green-700" : "text-gray-700 hover:bg-gray-100",
                                    )}
                                >
                                    <item.icon
                                        className={cn(
                                            "mr-3 h-5 w-5",
                                            pathname === item.href ? "text-green-500" : "text-gray-500 group-hover:text-gray-600",
                                        )}
                                    />
                                    {item.name}
                                    {pathname === item.href && <ChevronRight className="ml-auto h-4 w-4 text-green-500" />}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="p-4 border-t">
                        <div className="flex items-center justify-between mb-4">
                            <Button variant="outline" size="sm" className="w-full" onClick={() => router.push("/")}>
                                <Home className="mr-2 h-4 w-4" />
                                View Site
                            </Button>
                        </div>
                        <Button variant="destructive" size="sm" className="w-full" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Log Out
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">{children}</main>
            </div>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}
        </div>
    )
}