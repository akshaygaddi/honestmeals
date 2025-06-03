'use client'

import { useAuth } from '@/utils/hooks/useAuth'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Check } from 'lucide-react'
import { upgradeSubscriptionAction } from '@/app/actions'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function UpgradePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [processing, setProcessing] = useState(false)

  const handleUpgrade = async (newRole: string) => {
    if (!user) {
      toast.error('You must be logged in to upgrade')
      router.push('/sign-in')
      return
    }
    
    setProcessing(true)
    
    const formData = new FormData()
    formData.append('role', newRole)
    
    try {
      // In a real app, you would handle payment processing here
      // This is just updating the role directly
      await upgradeSubscriptionAction(formData)
      toast.success('Subscription upgraded successfully')
      setTimeout(() => {
        router.refresh()
      }, 1000)
    } catch (error) {
      console.error('Error upgrading subscription:', error)
      toast.error('Failed to upgrade subscription')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Upgrade Your Membership</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Standard Plan */}
        <Card className={user?.role === 'standard_user' ? 'border-green-500 shadow-md' : ''}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Standard</CardTitle>
              {user?.role === 'standard_user' && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                  Current Plan
                </span>
              )}
            </div>
            <CardDescription>Basic features for everyday users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4">Free</div>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                Basic meal browsing
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                Limited recipes
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                Basic nutrition tracking
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              variant="outline"
              disabled={user?.role === 'standard_user' || processing}
              onClick={() => handleUpgrade('standard_user')}
            >
              {user?.role === 'standard_user' ? 'Current Plan' : 'Downgrade'}
            </Button>
          </CardFooter>
        </Card>

        {/* Premium Plan */}
        <Card className={user?.role === 'premium_user' ? 'border-green-500 shadow-md' : ''}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Premium</CardTitle>
              {user?.role === 'premium_user' && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                  Current Plan
                </span>
              )}
            </div>
            <CardDescription>Enhanced features for fitness enthusiasts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4">$9.99<span className="text-lg font-normal">/mo</span></div>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                All Standard features
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                Personalized meal plans
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                Advanced nutrition tracking
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                Weekly fitness tips
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700" 
              disabled={user?.role === 'premium_user' || processing}
              onClick={() => handleUpgrade('premium_user')}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : user?.role === 'premium_user' ? (
                'Current Plan'
              ) : (
                'Upgrade'
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Ultra Premium Plan */}
        <Card className={user?.role === 'ultra_premium_user' ? 'border-green-500 shadow-md' : ''}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Ultra Premium</CardTitle>
              {user?.role === 'ultra_premium_user' && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                  Current Plan
                </span>
              )}
            </div>
            <CardDescription>Ultimate features for serious athletes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4">$19.99<span className="text-lg font-normal">/mo</span></div>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                All Premium features
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                1-on-1 nutrition coaching
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                Custom workout plans
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                Priority support
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                Exclusive content
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700" 
              disabled={user?.role === 'ultra_premium_user' || processing}
              onClick={() => handleUpgrade('ultra_premium_user')}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : user?.role === 'ultra_premium_user' ? (
                'Current Plan'
              ) : (
                'Upgrade'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 