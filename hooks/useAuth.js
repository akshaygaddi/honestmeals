// hooks/useAuth.js
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"

export function useAuth(requiredRole = null) {
    const [user, setUser] = useState(null)
    const [role, setRole] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function getUser() {
            setLoading(true)

            // Check authentication
            const { data: { user: authUser } } = await supabase.auth.getUser()

            if (!authUser) {
                setLoading(false)
                return
            }

            // Get user role
            const { data: userRole, error: roleError } = await supabase
                .rpc('get_user_role', { user_id: authUser.id })

            if (roleError) {
                setError(roleError.message)
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
    }, [supabase])

    // Check if user has required role
    const hasRequiredRole = requiredRole ? role === requiredRole : true

    return { user, role, loading, error, hasRequiredRole }
}