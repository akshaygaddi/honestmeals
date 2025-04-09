// components/AdminRoute.js
"use client"

import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { toast } from "react-hot-toast"

export default function AdminRoute({ children }) {
    const { user, role, loading, hasRequiredRole } = useAuth("admin")
    console.log(user)

    const router = useRouter()

    useEffect(() => {
        if (!loading) {
            if (!user) {
                toast.error("You must be logged in to access the admin area")
                router.push("/sign-in")
            } else if (!hasRequiredRole) {
                toast.error("You don't have permission to access the admin area")
                router.push("/")
            }
        }
    }, [user, hasRequiredRole, loading, router])

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

    if (!user || !hasRequiredRole) return null

    return children
}