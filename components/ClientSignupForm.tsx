// / Client component for form interactivity
"use client";

import { signUpAction } from "@/app/actions";
import { FormMessage, type Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useState } from "react";

function ClientSignupForm({ message }: { message: Message }) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <form className="space-y-4 sm:space-y-6 w-full">
            {/* Name Field */}
            <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Full Name
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
                        placeholder="John Doe"
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
                <p className="text-xs text-gray-500">Password must be at least 6 characters</p>
            </div>

            {/* Form Message */}
            {message && <FormMessage message={message} />}

            {/* Sign Up Button */}
            <SubmitButton
                pendingText="Creating account..."
                formAction={signUpAction}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 sm:py-3 rounded-lg font-medium transition-colors"
            >
                Continue
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