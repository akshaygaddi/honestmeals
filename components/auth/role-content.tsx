'use client'

import { useAuth, UserRole } from '@/utils/hooks/useAuth'

interface RoleContentProps {
  allowedRoles: UserRole[]
  fallback?: React.ReactNode
  children: React.ReactNode
}

export const RoleContent = ({
  allowedRoles,
  fallback = null,
  children
}: RoleContentProps) => {
  const { user, loading, checkRole } = useAuth()

  if (loading) {
    return null
  }

  if (!user || !checkRole(allowedRoles)) {
    return <>{fallback}</>
  }

  return <>{children}</>
} 