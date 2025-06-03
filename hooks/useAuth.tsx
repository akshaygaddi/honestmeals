"use client"

// hooks/useAuth.js
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { User } from "@supabase/supabase-js"
import { useUserStore } from "@/store/userStore"

interface UserRole {
  role: string | null
}

export function useAuth(requiredRole = null) {
    const [user, setUser] = useState<User | null>(null)
    const [role, setRole] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()
    
    // Get Zustand store methods
    const { setUser: setStoreUser, setProfile, clearUser } = useUserStore()

    useEffect(() => {
        async function getUser() {
            setLoading(true)

            // Check authentication
            const { data: { user: authUser } } = await supabase.auth.getUser()

            if (!authUser) {
                setLoading(false)
                clearUser()
                return
            }

            // Get user role
            const { data: userRole, error: roleError } = await supabase
                .rpc('get_user_role', { user_id: authUser.id })

            if (roleError) {
                setError(roleError.message)
            }
            
            // Get user profile data
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single()

            // Set data in Zustand store
            setStoreUser(authUser)
            if (profileData) {
                setProfile({
                    id: authUser.id,
                    name: profileData.full_name,
                    email: authUser.email || '',
                    avatar_url: profileData.avatar_url,
                    role: userRole
                })
            } else {
                // If no profile exists yet, just store basic info
                setProfile({
                    id: authUser.id,
                    email: authUser.email || '',
                    role: userRole
                })
            }

            setUser(authUser)
            setRole(userRole)
            setLoading(false)
        }

        getUser()

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(getUser)

        return () => {
            subscription?.unsubscribe()
        }
    }, [supabase, setStoreUser, setProfile, clearUser])

    // Check if user has required role
    const hasRequiredRole = requiredRole ? role === requiredRole : true

    return { user, role, loading, error, hasRequiredRole }
}