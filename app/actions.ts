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
  const { error } = await supabase.auth.signUp(data)
  if (error) {
    console.log(error)
  }
  return redirect("/")
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
