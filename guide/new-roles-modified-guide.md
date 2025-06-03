# Role-Based Authentication Implementation Guide for HonestMeals

This guide documents the complete implementation of role-based authentication for the HonestMeals application using Supabase as the backend.

## Table of Contents

1. [Database Schema Changes](#database-schema-changes)
2. [Authentication Hooks](#authentication-hooks)
3. [Role Guard Components](#role-guard-components)
4. [Role Content Components](#role-content-components)
5. [Server Actions](#server-actions)
6. [UI Pages](#ui-pages)
7. [Future Enhancements](#future-enhancements)

## Database Schema Changes

### SQL Migration for User Roles

```sql
-- STEP 1: Safely add any missing enum values
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    RAISE NOTICE 'user_role type does not exist. Please create it manually.';
  ELSE
    BEGIN
      ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'standard_user';
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    BEGIN
      ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'premium_user';
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    BEGIN
      ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'ultra_premium_user';
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    BEGIN
      ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'gym_trainer';
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    BEGIN
      ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'gym_influencer';
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    BEGIN
      ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    BEGIN
      ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'guest';
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

-- STEP 2: Create or alter the 'profiles' table
DO $$ 
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    -- Add temp_role column using enum
    ALTER TABLE public.profiles 
      ADD COLUMN IF NOT EXISTS temp_role user_role DEFAULT 'standard_user'::user_role;

    -- Migrate old role data into enum column
    UPDATE public.profiles 
    SET temp_role = CASE 
      WHEN role::TEXT = 'admin' THEN 'admin'::user_role
      WHEN role::TEXT = 'customer' THEN 'standard_user'::user_role
      ELSE 'standard_user'::user_role
    END
    WHERE role IS NOT NULL;

    -- Replace old role column
    ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;
    ALTER TABLE public.profiles RENAME COLUMN temp_role TO role;

    -- Add new columns if not already there
    ALTER TABLE public.profiles 
      ADD COLUMN IF NOT EXISTS subscription_status TEXT,
      ADD COLUMN IF NOT EXISTS subscription_expiry TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS trainer_specialty TEXT,
      ADD COLUMN IF NOT EXISTS trainer_experience INTEGER,
      ADD COLUMN IF NOT EXISTS influencer_followers INTEGER,
      ADD COLUMN IF NOT EXISTS influencer_platform TEXT,
      ADD COLUMN IF NOT EXISTS admin_level INTEGER,
      ADD COLUMN IF NOT EXISTS metadata JSONB;
  ELSE
    -- Table doesn't exist: create new
    CREATE TABLE public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      name TEXT,
      phone_number TEXT,
      address TEXT,
      role user_role DEFAULT 'standard_user'::user_role,
      subscription_status TEXT,
      subscription_expiry TIMESTAMP WITH TIME ZONE,
      trainer_specialty TEXT,
      trainer_experience INTEGER,
      influencer_followers INTEGER,
      influencer_platform TEXT,
      admin_level INTEGER,
      metadata JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  END IF;
END $$;

-- STEP 3: Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- STEP 4: Define RLS policies
DROP POLICY IF EXISTS "Users can view their own profiles" ON public.profiles;
CREATE POLICY "Users can view their own profiles" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;
CREATE POLICY "Users can update their own profiles" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" 
  ON public.profiles FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

-- STEP 5: Function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID DEFAULT auth.uid())
RETURNS user_role AS $$
DECLARE
  current_role user_role;
BEGIN
  SELECT role INTO current_role FROM public.profiles WHERE id = user_id;
  RETURN current_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 6: Function to check if a user has a specific role
CREATE OR REPLACE FUNCTION has_role(required_role user_role, user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
DECLARE
  current_role user_role;
BEGIN
  SELECT role INTO current_role FROM public.profiles WHERE id = user_id;

  IF current_role = 'admin' THEN
    RETURN true;
  ELSIF required_role = 'standard_user' AND current_role IN ('premium_user', 'ultra_premium_user') THEN
    RETURN true;
  ELSIF required_role = 'premium_user' AND current_role = 'ultra_premium_user' THEN
    RETURN true;
  ELSE
    RETURN current_role = required_role;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 7: Trigger to auto-create profile on user sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, created_at, updated_at)
  VALUES (NEW.id, 'standard_user'::user_role, now(), now())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger only if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;
```

This SQL script:
1. Creates a `user_role` enum type with different role values
2. Updates the existing `profiles` table or creates a new one if it doesn't exist
3. Adds new columns for different role attributes
4. Sets up Row Level Security policies
5. Creates helper functions to check roles
6. Implements a trigger to create profiles automatically for new users

## Authentication Hooks

### File: `utils/hooks/useAuth.ts`

```typescript
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
```

This hook:
1. Fetches the authenticated user and their profile
2. Provides helper functions to check user roles
3. Listens for authentication state changes
4. Returns loading state and user information

## Role Guard Components

### File: `components/auth/role-guard.tsx`

```typescript
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
```

This component:
1. Protects routes based on user roles
2. Redirects unauthorized users
3. Shows a loading state while checking authentication
4. Renders children only for authorized users

## Role Content Components

### File: `components/auth/role-content.tsx`

```typescript
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
```

This component:
1. Conditionally renders content based on user roles
2. Shows alternative content for unauthorized users
3. Allows for role-specific UI elements

## Server Actions

### File: `app/actions.ts` (Updated)

Key modifications:

```typescript
export async function signUpAction(formData: FormData) {
  const supabase = await createClient()
  // type-casting here for convenience
  // in practice, you should validate your inputs
  console.log("the data is being sent ", formData)

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    name: formData.get("name")?.toString()
  }
  
  // Sign up the user
  const { data: authData, error } = await supabase.auth.signUp(data)
  
  if (error) {
    console.log(error)
    return encodedRedirect("error", "/sign-up", error.message)
  }
  
  // The profile should be created automatically by the database trigger
  // But let's make sure the user's name is saved
  if (authData?.user && data.name) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        name: data.name,
        updated_at: new Date().toISOString()
      })
      .eq('id', authData.user.id)
      
    if (profileError) {
      console.error("Profile update error:", profileError.message)
    }
  }
  
  return redirect("/")
}

export async function signUpTrainerAction(formData: FormData) {
  // Implementation for trainer registration
}

export async function signUpInfluencerAction(formData: FormData) {
  // Implementation for influencer registration
}

export const updateUserRoleAction = async (formData: FormData) => {
  // Implementation for admin role updates
}

export const upgradeSubscriptionAction = async (formData: FormData) => {
  // Implementation for subscription upgrades
}
```

These actions:
1. Handle user registration with different roles
2. Update user profiles with role-specific information
3. Allow admins to change user roles
4. Process subscription upgrades

## UI Pages

### Unauthorized Page: `app/unauthorized/page.tsx`

```typescript
'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { LockKeyhole } from "lucide-react"
import Link from "next/link"

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
            <LockKeyhole className="h-8 w-8 text-red-500" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h1>
        
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. This area requires a higher level of access.
        </p>
        
        <div className="space-y-4">
          <Button 
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={() => router.push('/')}
          >
            Return to Home
          </Button>
          
          <div className="text-sm text-gray-500">
            <span>Need to upgrade your account? </span>
            <Link href="/upgrade" className="text-green-600 hover:text-green-700 font-medium">
              Upgrade now
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### Upgrade Page: `app/upgrade/page.tsx`

Allows users to upgrade their subscription tier.

### Admin User Management: `app/admin/users/page.tsx`

Allows admins to manage user roles.

### Trainer Registration: `app/(auth-pages)/register-trainer/page.tsx`

Specialized registration form for trainers.

### Profile Page: `app/profile/page.tsx`

Updated to show role-specific information and features.

## Admin Tools

### File: `scripts/create-admin.js`

```javascript
// Script to create an admin user
// Run with: node scripts/create-admin.js your-email@example.com

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Get email from command line args
const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address as an argument');
  console.error('Usage: node scripts/create-admin.js your-email@example.com');
  process.exit(1);
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase environment variables are missing');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  try {
    // Find the user by email
    const { data: user, error: userError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError) {
      console.error('Error finding user:', userError.message);
      
      // Check if the user exists in auth.users table directly
      const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error listing users:', authError.message);
        process.exit(1);
      }
      
      const matchedUser = authUser?.users?.find(u => u.email === email);
      
      if (!matchedUser) {
        console.error(`User with email ${email} not found`);
        process.exit(1);
      }
      
      // Use the user ID from auth.users
      const userId = matchedUser.id;
      
      // Update the profile role to admin
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin', updated_at: new Date().toISOString() })
        .eq('id', userId);
      
      if (updateError) {
        console.error('Error updating user role:', updateError.message);
        process.exit(1);
      }
      
      console.log(`User ${email} (${userId}) has been granted admin privileges`);
    } else {
      // User found, update the profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin', updated_at: new Date().toISOString() })
        .eq('id', user.id);
      
      if (updateError) {
        console.error('Error updating user role:', updateError.message);
        process.exit(1);
      }
      
      console.log(`User ${email} (${user.id}) has been granted admin privileges`);
    }
  } catch (error) {
    console.error('Unexpected error:', error.message);
    process.exit(1);
  }
}

main();
```

This script:
1. Takes an email address as a command-line argument
2. Finds the user in the Supabase database
3. Updates their role to admin

## Implementation Steps

1. **Database Setup**:
   - Run the SQL script in Supabase SQL Editor to set up the user role system
   - This creates the enum type, updates tables, and sets up RLS policies

2. **Create Admin User**:
   - Add the service role key to your environment variables
   - Run `node scripts/create-admin.js your-email@example.com`

3. **Install Necessary Packages**:
   - Make sure all required dependencies are installed

4. **Client Setup**:
   - Create the authentication hook
   - Implement the role guard components
   - Update server actions

5. **Page Implementation**:
   - Create or update pages for role-specific features
   - Use the RoleGuard component to protect admin routes
   - Use the RoleContent component for conditional UI elements

6. **Testing**:
   - Test registration with different roles
   - Verify role-based access control
   - Check subscription upgrades
   - Test admin functionality

## Future Enhancements

1. **Role-Based API Access**: Implement middleware to check roles for API routes
2. **Subscription Management**: Add payment processing and subscription lifecycle management
3. **Role Approval Workflow**: Create an approval process for special roles (trainers, influencers)
4. **Advanced Permissions**: Implement granular permissions within roles
5. **Role Auditing**: Track role changes for security and compliance
6. **Multi-Factor Authentication**: Add MFA for admin and premium users

## Maintenance

1. **Database Migrations**: When adding new roles, update the enum type
2. **Profile Updates**: When adding role-specific features, update the profiles table
3. **RLS Policies**: Review and update policies when changing data access patterns
4. **UI Components**: Keep role checking consistent across components

---

This implementation provides a comprehensive role-based authentication system for the HonestMeals application, allowing different user types to access appropriate features while maintaining security and data isolation.
