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