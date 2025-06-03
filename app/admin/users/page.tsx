'use client'

import { useAuth } from '@/utils/hooks/useAuth'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { RoleGuard } from '@/components/auth/role-guard'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import { UserRole } from '@/utils/hooks/useAuth'
import { Loader2, ChevronLeft, Search, UserCog } from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { updateUserRoleAction } from '@/app/actions'

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export default function ManageUsers() {
  const { isAdmin } = useAuth()
  const supabase = createClient()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      
      // Get all user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesError) {
        toast.error('Failed to load users')
        console.error(profilesError)
        setLoading(false)
        return
      }

      // Get email addresses for each user
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      
      if (authError) {
        toast.error('Failed to load user details')
        console.error(authError)
        setLoading(false)
        return
      }

      // Combine the data
      const combinedUsers = profiles.map(profile => {
        const authUser = authUsers?.users.find(u => u.id === profile.id)
        return {
          id: profile.id,
          name: profile.name || 'No Name',
          email: authUser?.email || 'No Email',
          role: profile.role as UserRole,
          created_at: profile.created_at
        }
      })
      
      setUsers(combinedUsers)
      setLoading(false)
    }

    if (isAdmin()) {
      fetchUsers()
    }
  }, [supabase, isAdmin])

  const updateUserRole = async (userId: string, newRole: string) => {
    setProcessing(userId)
    
    const formData = new FormData()
    formData.append('userId', userId)
    formData.append('role', newRole)
    
    try {
      await updateUserRoleAction(formData)
      toast.success('User role updated successfully')
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole as UserRole } : user
      ))
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error('Failed to update user role')
    } finally {
      setProcessing(null)
    }
  }

  const filteredUsers = searchTerm 
    ? users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Link href="/" className="mr-4">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-2xl font-bold flex items-center">
            <UserCog className="h-6 w-6 mr-2 text-green-600" />
            User Management
          </h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by name or email"
                className="pl-9 pr-4"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Current Role</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                        {searchTerm ? 'No users found matching your search' : 'No users found in the system'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => (
                      <tr key={user.id} className="bg-white hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                        <td className="px-4 py-3">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'ultra_premium_user' ? 'bg-blue-100 text-blue-800' :
                            user.role === 'premium_user' ? 'bg-green-100 text-green-800' :
                            user.role === 'gym_trainer' ? 'bg-amber-100 text-amber-800' :
                            user.role === 'gym_influencer' ? 'bg-pink-100 text-pink-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <select 
                              className="border rounded px-2 py-1 mr-2 text-sm"
                              value={user.role}
                              onChange={(e) => updateUserRole(user.id, e.target.value)}
                              disabled={processing === user.id}
                            >
                              <option value="standard_user">Standard User</option>
                              <option value="premium_user">Premium User</option>
                              <option value="ultra_premium_user">Ultra Premium User</option>
                              <option value="gym_trainer">Gym Trainer</option>
                              <option value="gym_influencer">Gym Influencer</option>
                              <option value="admin">Admin</option>
                              <option value="guest">Guest</option>
                            </select>
                            {processing === user.id && (
                              <Loader2 className="h-4 w-4 animate-spin text-green-500" />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  )
} 