import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export type UserRole = 
  | 'standard_user'
  | 'premium_user'
  | 'ultra_premium_user'
  | 'gym_trainer'
  | 'gym_influencer'
  | 'admin'
  | 'guest';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  profile: any;
}

export const useAuth = () => {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true)
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (!authUser) {
          setUser(null)
          setLoading(false)
          return
        }

        // Get user profile including role
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()

        setUser({
          id: authUser.id,
          email: authUser.email!,
          role: profile?.role || 'guest',
          profile
        })
      } catch (error) {
        console.error('Error loading user:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getUser()
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      getUser()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  // Helper functions to check roles
  const checkRole = (allowedRoles: UserRole[]) => {
    if (!user) return false
    
    // Admin has access to everything
    if (user.role === 'admin') return true
    
    // Check if user's role is in the allowed roles
    return allowedRoles.includes(user.role)
  }

  const isAdmin = () => user?.role === 'admin'
  
  const isPremium = () => {
    if (!user) return false
    return ['premium_user', 'ultra_premium_user', 'admin'].includes(user.role)
  }
  
  const isUltraPremium = () => {
    if (!user) return false
    return ['ultra_premium_user', 'admin'].includes(user.role)
  }
  
  const isTrainer = () => user?.role === 'gym_trainer'
  const isInfluencer = () => user?.role === 'gym_influencer'

  return {
    user,
    loading,
    checkRole,
    isAdmin,
    isPremium,
    isUltraPremium,
    isTrainer,
    isInfluencer
  }
} 