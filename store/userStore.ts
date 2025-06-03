import { create } from 'zustand'
import { User } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  name?: string
  email: string
  avatar_url?: string
  role?: string
}

interface UserState {
  user: User | null
  profile: UserProfile | null
  setUser: (user: User | null) => void
  setProfile: (profile: UserProfile | null) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  profile: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  clearUser: () => set({ user: null, profile: null }),
})) 