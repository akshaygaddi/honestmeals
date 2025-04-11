'use client'

import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";

export default function Signup(props: { searchParams: Promise<Message> }) {
  const [message, setMessage] = useState<Message | null>(null);

  useEffect(() => {
    props.searchParams.then((msg) => setMessage(msg));
  }, [props.searchParams]);

  return (
      <div className="flex flex-col lg:flex-row min-h-screen w-full overflow-hidden">
        {/* Left side - Illustration */}
        <div className="hidden lg:flex lg:w-1/2 bg-green-600 relative items-center justify-center">
          <div className="absolute inset-0 bg-green-700 opacity-20" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E\")",
          }}></div>

          <div className="relative z-10 p-6 sm:p-8 md:p-10 lg:p-12 text-white max-w-lg">
            <div className="mb-6 sm:mb-8">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-white rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <svg className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a4 4 0 00-4-4H8.8a4 4 0 00-4 4v12h10.2M12 8a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-4">Honest Meals</h1>
              <p className="text-lg sm:text-xl opacity-90 mb-4 sm:mb-6">Discover fresh, sustainable meals delivered straight to your door.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-white/20">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/20 flex items-center justify-center mr-3 sm:mr-4">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">100% Organic Ingredients</h3>
                  <p className="text-sm opacity-80">Sourced from local farms</p>
                </div>
              </div>

              <div className="flex items-center mb-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/20 flex items-center justify-center mr-3 sm:mr-4">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Chef-Crafted Recipes</h3>
                  <p className="text-sm opacity-80">New menus every week</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/20 flex items-center justify-center mr-3 sm:mr-4">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Eco-Friendly Packaging</h3>
                  <p className="text-sm opacity-80">Zero waste commitment</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Signup form */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <div className="flex items-center p-4 sm:p-6">
            <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-700 text-sm font-medium">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8">
            <div className="w-full max-w-md">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Create an account</h2>
                <p className="text-gray-600">Join us to start ordering fresh meals</p>
              </div>

              <ClientForm message={message} />
            </div>
          </div>
        </div>
      </div>
  );
}

// Extracted client component to handle state
function ClientForm({ message }) {
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  return (
      <form className="space-y-4 sm:space-y-6 w-full">
        {/* Name Field */}
        <div className="space-y-1 sm:space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            Full name
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="John Smith"
                className="pl-10 py-2 sm:py-3 border-gray-300 focus:ring-green-500 focus:border-green-500 rounded-lg w-full"
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-1 sm:space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email address
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="name@example.com"
                className="pl-10 py-2 sm:py-3 border-gray-300 focus:ring-green-500 focus:border-green-500 rounded-lg w-full"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1 sm:space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={6}
                placeholder="••••••••"
                className="pl-10 py-2 sm:py-3 border-gray-300 focus:ring-green-500 focus:border-green-500 rounded-lg w-full"
            />
            <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                  <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              ) : (
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-center">
          <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(!!checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
            I agree to the{" "}
            <Link href="/terms" className="text-green-600 hover:text-green-700 font-medium">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-green-600 hover:text-green-700 font-medium">
              Privacy Policy
            </Link>
          </label>
        </div>

        {/* Form Message */}
        {message && <FormMessage message={message} />}

        {/* Sign Up Button */}
        <SubmitButton
            pendingText="Creating account..."
            formAction={signUpAction}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 sm:py-3 rounded-lg font-medium transition-colors"
        >
          Create account
        </SubmitButton>

        {/* Sign In Link */}
        <div className="text-center pt-2">
          <p className="text-xs sm:text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium text-green-600 hover:text-green-700">
              Sign in
            </Link>
          </p>
        </div>
      </form>
  );
}