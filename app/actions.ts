"use server"

import { encodedRedirect } from "@/utils/utils"
import { createClient } from "@/utils/supabase/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import {revalidatePath} from "next/cache";

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
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    name: formData.get("name")?.toString()
  }
  
  // Trainer-specific data
  const specialty = formData.get("specialty")?.toString()
  const experience = formData.get("experience")?.toString()
  const bio = formData.get("bio")?.toString()
  
  // Sign up the user
  const { data: authData, error } = await supabase.auth.signUp(data)
  
  if (error) {
    console.log(error)
    return encodedRedirect("error", "/register-trainer", error.message)
  }
  
  if (authData?.user) {
    // Update profile with trainer role and details
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        name: data.name,
        role: 'gym_trainer',
        trainer_specialty: specialty,
        trainer_experience: experience ? parseInt(experience, 10) : 0,
        metadata: { bio, application_status: 'pending' },
        updated_at: new Date().toISOString()
      })
      .eq('id', authData.user.id)
      
    if (profileError) {
      console.error("Profile update error:", profileError.message)
      return encodedRedirect("error", "/register-trainer", "Failed to create trainer profile")
    }
  }
  
  return encodedRedirect("success", "/trainer-application-submitted", "Your application has been submitted successfully!")
}

export async function signUpInfluencerAction(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    name: formData.get("name")?.toString()
  }
  
  // Influencer-specific data
  const platform = formData.get("platform")?.toString()
  const followers = formData.get("followers")?.toString()
  const profileUrl = formData.get("profileUrl")?.toString()
  
  // Sign up the user
  const { data: authData, error } = await supabase.auth.signUp(data)
  
  if (error) {
    console.log(error)
    return encodedRedirect("error", "/register-influencer", error.message)
  }
  
  if (authData?.user) {
    // Update profile with influencer role and details
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        name: data.name,
        role: 'gym_influencer',
        influencer_platform: platform,
        influencer_followers: followers ? parseInt(followers, 10) : 0,
        metadata: { profile_url: profileUrl, application_status: 'pending' },
        updated_at: new Date().toISOString()
      })
      .eq('id', authData.user.id)
      
    if (profileError) {
      console.error("Profile update error:", profileError.message)
      return encodedRedirect("error", "/register-influencer", "Failed to create influencer profile")
    }
  }
  
  return encodedRedirect("success", "/influencer-application-submitted", "Your application has been submitted successfully!")
}

export const updateUserDetailsAction = async (formData: FormData) => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return encodedRedirect("error", "/sign-in", "User not authenticated")
  }

  const weight = formData.get("weight")?.toString()
  const height = formData.get("height")?.toString()
  const age = formData.get("age")?.toString()
  const dietaryPreference = formData.get("dietaryPreference")?.toString()
  const dailyCalorieGoal = formData.get("dailyCalorieGoal")?.toString()
  const dailyProteinGoal = formData.get("dailyProteinGoal")?.toString()

  const { error } = await supabase
      .from("profiles")
      .update({
        weight: weight ? Number.parseFloat(weight) : null,
        height: height ? Number.parseFloat(height) : null,
        age: age ? Number.parseInt(age, 10) : null,
        dietary_preference: dietaryPreference || null,
        daily_calorie_goal: dailyCalorieGoal ? Number.parseInt(dailyCalorieGoal, 10) : null,
        daily_protein_goal: dailyProteinGoal ? Number.parseInt(dailyProteinGoal, 10) : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

  if (error) {
    console.error("Profile update error:", error.message)
    return encodedRedirect("error", "/user-details", "Failed to update profile")
  }

  return redirect("/")
}

export const updateUserRoleAction = async (formData: FormData) => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return encodedRedirect("error", "/sign-in", "User not authenticated")
  }

  // First check if the current user is an admin
  const { data: currentUserProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!currentUserProfile || currentUserProfile.role !== 'admin') {
    return encodedRedirect("error", "/unauthorized", "Only admins can update user roles")
  }

  const userId = formData.get("userId") as string
  const newRole = formData.get("role") as string

  if (!userId || !newRole) {
    return encodedRedirect("error", "/admin/users", "User ID and role are required")
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      role: newRole,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (error) {
    console.error("Role update error:", error.message)
    return encodedRedirect("error", "/admin/users", "Failed to update user role")
  }

  return encodedRedirect("success", "/admin/users", "User role updated successfully")
}

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) {
    return encodedRedirect("error", "/sign-in", error.message)
  }
  return redirect("/")
}

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString()
  const supabase = await createClient()
  const origin = (await headers()).get("origin")
  const callbackUrl = formData.get("callbackUrl")?.toString()
  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required")
  }
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  })
  if (error) {
    console.error(error.message)
    return encodedRedirect("error", "/forgot-password", "Could not reset password")
  }
  if (callbackUrl) {
    return redirect(callbackUrl)
  }
  return encodedRedirect("success", "/forgot-password", "Check your email for a link to reset your password.")
}

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient()
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string
  if (!password || !confirmPassword) {
    return encodedRedirect("error", "/protected/reset-password", "Password and confirm password are required")
  }
  if (password !== confirmPassword) {
    return encodedRedirect("error", "/protected/reset-password", "Passwords do not match")
  }
  const { error } = await supabase.auth.updateUser({
    password: password,
  })
  if (error) {
    return encodedRedirect("error", "/protected/reset-password", "Password update failed")
  }
  return encodedRedirect("success", "/protected/reset-password", "Password updated")
}

export const updateProfileAction = async (formData: FormData) => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return encodedRedirect("error", "/profile", "User not authenticated")
  }

  const weight = formData.get("weight")?.toString()
  const height = formData.get("height")?.toString()
  const age = formData.get("age")?.toString()
  const dietaryPreference = formData.get("dietaryPreference")?.toString()
  const dailyCalorieGoal = formData.get("dailyCalorieGoal")?.toString()
  const dailyProteinGoal = formData.get("dailyProteinGoal")?.toString()

  const { error } = await supabase
      .from("profiles")
      .update({
        weight: weight ? Number.parseFloat(weight) : null,
        height: height ? Number.parseFloat(height) : null,
        age: age ? Number.parseInt(age, 10) : null,
        dietary_preference: dietaryPreference || null,
        daily_calorie_goal: dailyCalorieGoal ? Number.parseInt(dailyCalorieGoal, 10) : null,
        daily_protein_goal: dailyProteinGoal ? Number.parseInt(dailyProteinGoal, 10) : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

  if (error) {
    console.error("Profile update error:", error.message)
    return encodedRedirect("error", "/profile", "Failed to update profile")
  }

  return encodedRedirect("success", "/profile", "Profile updated successfully")
}

export const signOutAction = async () => {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect("/sign-in")
}

export const upgradeSubscriptionAction = async (formData: FormData) => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return encodedRedirect("error", "/sign-in", "User not authenticated")
  }

  const newRole = formData.get("role") as string
  
  if (!newRole) {
    return encodedRedirect("error", "/upgrade", "Role is required")
  }

  // In a real app, you would handle payment processing here
  // Set subscription expiry to 30 days from now
  const subscriptionExpiry = new Date()
  subscriptionExpiry.setDate(subscriptionExpiry.getDate() + 30)

  const { error } = await supabase
    .from("profiles")
    .update({
      role: newRole,
      subscription_status: 'active',
      subscription_expiry: subscriptionExpiry.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    console.error("Subscription upgrade error:", error.message)
    return encodedRedirect("error", "/upgrade", "Failed to upgrade subscription")
  }

  return encodedRedirect("success", "/upgrade", "Subscription upgraded successfully")
}
