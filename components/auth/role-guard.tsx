'use client'

import { useAuth, UserRole } from '@/utils/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface RoleGuardProps {
  allowedRoles: UserRole[]
  redirectTo?: string
  children: React.ReactNode
}

export const RoleGuard = ({
  allowedRoles,
  redirectTo = '/sign-in',
  children
}: RoleGuardProps) => {
  const { user, loading, checkRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(redirectTo)
      } else if (!checkRole(allowedRoles)) {
        router.push('/unauthorized')
      }
    }
  }, [user, loading, router, allowedRoles, redirectTo, checkRole])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    )
  }

  if (!user || !checkRole(allowedRoles)) {
    return null
  }

  return <>{children}</>
} 