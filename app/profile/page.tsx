"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "react-hot-toast"
import { ArrowLeft, User, MapPin, Phone, Save, Loader2, Crown, Calendar } from "lucide-react"
import { useAuth, UserRole } from "@/utils/hooks/useAuth"
import Link from "next/link"

type Profile = {
    id: string
    name: string | null
    phone_number: string | null
    address: string | null
    updated_at: string | null
    role: UserRole
    subscription_status: string | null
    subscription_expiry: string | null
}

export default function ProfilePage() {
    const router = useRouter()
    const supabase = createClient()
    const { user: authUser, isPremium, isUltraPremium, isAdmin, isTrainer, isInfluencer } = useAuth()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [fullName, setFullName] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [address, setAddress] = useState("")
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        async function getProfile() {
            setLoading(true)

            // Check if user is authenticated
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) {
                // If not authenticated, try to get data from localStorage
                const userData = localStorage.getItem("honestMealsUser")

                if (userData) {
                    const parsedData = JSON.parse(userData)
                    setFullName(parsedData.name || "")
                    setPhoneNumber(parsedData.phone || "")
                    setAddress(parsedData.address || "")
                }
                setIsAuthenticated(false)
                setLoading(false)
                return
            }

            setIsAuthenticated(true)

            // Fetch profile data
            const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

            if (error) {
                console.error("Error fetching profile:", error)
                toast.error("Failed to load profile")
            } else if (data) {
                setProfile(data)
                setFullName(data.name || "")
                setPhoneNumber(data.phone_number || "")
                setAddress(data.address || "")
            }

            setLoading(false)
        }

        getProfile()
    }, [supabase])

    const handleSaveProfile = async () => {
        setSaving(true)

        try {
            if (!isAuthenticated) {
                // Save to localStorage for non-authenticated users
                const userData = {
                    name: fullName,
                    phone: phoneNumber,
                    address: address,
                }
                localStorage.setItem("honestMealsUser", JSON.stringify(userData))
                toast.success("Profile saved locally")
                setSaving(false)
                return
            }

            // Get current user
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) {
                toast.error("You must be logged in to save your profile")
                setSaving(false)
                return
            }

            // Check if profile exists
            if (profile) {
                // Update existing profile
                const { error } = await supabase
                    .from("profiles")
                    .update({
                        name: fullName,
                        phone_number: phoneNumber,
                        address: address,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", user.id)

                if (error) {
                    console.error("Error updating profile:", error)
                    toast.error("Failed to update profile")
                } else {
                    toast.success("Profile updated successfully")
                }
            } else {
                // Create new profile
                const { error } = await supabase.from("profiles").insert({
                    id: user.id,
                    name: fullName,
                    phone_number: phoneNumber,
                    address: address,
                    updated_at: new Date().toISOString(),
                })

                if (error) {
                    console.error("Error creating profile:", error)
                    toast.error("Failed to create profile")
                } else {
                    toast.success("Profile created successfully")
                }
            }
        } catch (error) {
            console.error("Error saving profile:", error)
            toast.error("An error occurred while saving your profile")
        } finally {
            setSaving(false)
        }
    }

    // Helper function to format the role display
    const formatRole = (role: UserRole) => {
        switch (role) {
            case 'standard_user':
                return 'Standard User'
            case 'premium_user':
                return 'Premium User'
            case 'ultra_premium_user':
                return 'Ultra Premium User'
            case 'gym_trainer':
                return 'Gym Trainer'
            case 'gym_influencer':
                return 'Gym Influencer'
            case 'admin':
                return 'Administrator'
            case 'guest':
                return 'Guest'
            default:
                return role
        }
    }

    // Helper function to get role badge color
    const getRoleBadgeClass = (role: UserRole) => {
        switch (role) {
            case 'premium_user':
                return 'bg-green-100 text-green-800'
            case 'ultra_premium_user':
                return 'bg-blue-100 text-blue-800'
            case 'gym_trainer':
                return 'bg-amber-100 text-amber-800'
            case 'gym_influencer':
                return 'bg-pink-100 text-pink-800'
            case 'admin':
                return 'bg-purple-100 text-purple-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    // Format date for display
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <Button variant="ghost" className="mb-6" onClick={() => router.push("/meals")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Meals
                </Button>

                <div className="max-w-3xl mx-auto">
                    <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

                    <Tabs defaultValue="profile" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-8">
                            <TabsTrigger value="profile">Profile Information</TabsTrigger>
                            <TabsTrigger value="subscription">Subscription</TabsTrigger>
                            <TabsTrigger value="orders">Order History</TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Personal Information</CardTitle>
                                    <CardDescription>Update your personal details and delivery preferences</CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-6">
                                    {loading ? (
                                        <div className="flex justify-center py-8">
                                            <div className="relative w-16 h-16">
                                                <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
                                                <div className="absolute top-0 left-0 w-full h-full border-4 border-t-green-500 rounded-full animate-spin"></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="space-y-2">
                                                <Label htmlFor="fullName" className="flex items-center">
                                                    <User className="h-4 w-4 mr-2 text-gray-500" />
                                                    Full Name
                                                </Label>
                                                <Input
                                                    id="fullName"
                                                    placeholder="Your full name"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="phoneNumber" className="flex items-center">
                                                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                                                    Phone Number
                                                </Label>
                                                <Input
                                                    id="phoneNumber"
                                                    placeholder="Your phone number"
                                                    value={phoneNumber}
                                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="address" className="flex items-center">
                                                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                                                    Delivery Address
                                                </Label>
                                                <Textarea
                                                    id="address"
                                                    placeholder="Your delivery address"
                                                    value={address}
                                                    onChange={(e) => setAddress(e.target.value)}
                                                    rows={3}
                                                    className="resize-none"
                                                />
                                            </div>

                                            {!isAuthenticated && (
                                                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-amber-800 text-sm">
                                                    <p className="font-medium mb-1">You're not logged in</p>
                                                    <p>Your profile information will be saved locally on this device only.</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </CardContent>

                                <CardFooter>
                                    <Button
                                        onClick={handleSaveProfile}
                                        className="ml-auto bg-green-500 hover:bg-green-600"
                                        disabled={saving || loading}
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        <TabsContent value="subscription">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Subscription Details</CardTitle>
                                    <CardDescription>Your current membership plan and benefits</CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-6">
                                    {loading ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                                        </div>
                                    ) : !isAuthenticated ? (
                                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-amber-800">
                                            <p className="font-medium mb-1">You're not logged in</p>
                                            <p>Please sign in to view your subscription details.</p>
                                            <Button
                                                className="mt-4 bg-amber-600 hover:bg-amber-700"
                                                onClick={() => router.push('/sign-in')}
                                            >
                                                Sign In
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="bg-gray-50 p-5 rounded-lg">
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <Crown className="h-6 w-6 text-amber-500" />
                                                    <h3 className="text-lg font-medium">Current Plan</h3>
                                                </div>
                                                
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600">Membership</span>
                                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeClass(profile?.role || 'standard_user')}`}>
                                                            {formatRole(profile?.role || 'standard_user')}
                                                        </span>
                                                    </div>
                                                    
                                                    {isPremium() && (
                                                        <>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-gray-600">Status</span>
                                                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                                    {profile?.subscription_status || 'Active'}
                                                                </span>
                                                            </div>
                                                            
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-gray-600">Renewal Date</span>
                                                                <span className="flex items-center">
                                                                    <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                                                                    {formatDate(profile?.subscription_expiry || null)}
                                                                </span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                
                                                <div className="mt-6">
                                                    <Button
                                                        className="w-full bg-green-600 hover:bg-green-700"
                                                        onClick={() => router.push('/upgrade')}
                                                    >
                                                        {isPremium() ? 'Manage Subscription' : 'Upgrade Now'}
                                                    </Button>
                                                </div>
                                            </div>
                                            
                                            {isAdmin() && (
                                                <div className="mt-6 bg-purple-50 p-5 rounded-lg border border-purple-100">
                                                    <div className="flex items-center space-x-2 mb-4">
                                                        <svg className="h-5 w-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                                        </svg>
                                                        <h3 className="text-lg font-medium text-purple-800">Admin Access</h3>
                                                    </div>
                                                    <p className="text-purple-700 mb-4">You have administrator privileges. You can manage users and system settings.</p>
                                                    <Link href="/admin/users">
                                                        <Button className="w-full bg-purple-600 hover:bg-purple-700">
                                                            Go to Admin Dashboard
                                                        </Button>
                                                    </Link>
                                                </div>
                                            )}
                                            
                                            {(isTrainer() || isInfluencer()) && (
                                                <div className="mt-6 bg-blue-50 p-5 rounded-lg border border-blue-100">
                                                    <div className="flex items-center space-x-2 mb-4">
                                                        <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        <h3 className="text-lg font-medium text-blue-800">
                                                            {isTrainer() ? 'Trainer Portal' : 'Influencer Portal'}
                                                        </h3>
                                                    </div>
                                                    <p className="text-blue-700 mb-4">
                                                        {isTrainer() 
                                                            ? 'Access your trainer dashboard to manage clients and schedules.' 
                                                            : 'Access your influencer dashboard to manage your content and partnerships.'}
                                                    </p>
                                                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                                        Go to {isTrainer() ? 'Trainer' : 'Influencer'} Dashboard
                                                    </Button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="orders">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order History</CardTitle>
                                    <CardDescription>View your past orders and delivery status</CardDescription>
                                </CardHeader>

                                <CardContent>
                                    <div className="text-center py-8 text-gray-500">
                                        <p>Your order history will appear here.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}

