'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function TrainerApplicationSubmitted() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Application Submitted!</h1>
        
        <p className="text-gray-600 mb-6">
          Thank you for applying to join our trainer team. We've received your application and our team will review it shortly.
        </p>
        
        <div className="space-y-2 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-left">
            <h3 className="font-medium text-blue-800 mb-1">What happens next?</h3>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Our team will review your application within 1-3 business days</li>
              <li>You'll receive an email with our decision</li>
              <li>If approved, we'll provide next steps to complete your profile</li>
            </ul>
          </div>
        </div>
        
        <div className="space-y-4">
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={() => router.push('/')}
          >
            Return to Home
          </Button>
          
          <div className="text-sm text-gray-500">
            <span>Have questions? </span>
            <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
              Contact our support team
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 