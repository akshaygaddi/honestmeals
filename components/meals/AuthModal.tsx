"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "react-hot-toast"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  mode?: "favorites" | "cart" | "general"
}

export function AuthModal({ isOpen, onClose, onSuccess, mode = "general" }: AuthModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const getModalTitle = () => {
    if (mode === "favorites") {
      return isSignUp 
        ? "Sign up to save favorites" 
        : "Sign in to save favorites"
    } else if (mode === "cart") {
      return isSignUp 
        ? "Sign up for easy checkout" 
        : "Sign in for easy checkout"
    } else {
      return isSignUp 
        ? "Create an account" 
        : "Sign in to your account"
    }
  }

  const getModalDescription = () => {
    if (mode === "favorites") {
      return "Sign in to save your favorite meals and access them anytime, anywhere."
    } else if (mode === "cart") {
      return "Create an account for personalized recommendations, quick checkout, and order tracking."
    } else {
      return "Enter your email and password to access your account."
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success("Signed in successfully!")
      onClose()
      if (onSuccess) onSuccess()
    } catch (error) {
      toast.error("An error occurred during sign in")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success("Check your email to confirm your account!")
      onClose()
    } catch (error) {
      toast.error("An error occurred during sign up")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const renderBenefits = () => {
    return (
      <div className="mt-4 bg-green-50 p-3 rounded-md">
        <h4 className="font-medium text-green-700 mb-2">Member Benefits</h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Save your favorite meals</li>
          <li>• Quick checkout process</li>
          <li>• Track your orders easily</li>
          <li>• Personalized meal recommendations</li>
          <li>• Track your calorie intake</li>
          <li>• Access to personalized diet plans</li>
        </ul>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{getModalTitle()}</DialogTitle>
          <DialogDescription>{getModalDescription()}</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {!isSignUp && (
            <div className="text-sm">
              <Link href="/forgot-password" className="text-green-600 hover:text-green-700">
                Forgot your password?
              </Link>
            </div>
          )}
          
          {renderBenefits()}
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600"
              disabled={loading}
            >
              {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </DialogFooter>
          
          <div className="text-center text-sm">
            {isSignUp ? (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Sign up
                </button>
              </p>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 