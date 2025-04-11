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
import { ArrowLeft, User, MapPin, Phone, Save, Loader2 } from "lucide-react"

type Profile = {
    id: string
    name: string | null
    phone_number: string | null
    address: string | null
    updated_at: string | null
}

export default function ProfilePage() {
    const router = useRouter()
    const supabase = createClient()

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

            console.log("user from profile", user)


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
                        <TabsList className="grid w-full grid-cols-2 mb-8">
                            <TabsTrigger value="profile">Profile Information</TabsTrigger>
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

                        <TabsContent value="orders">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order History</CardTitle>
                                    <CardDescription>View your past orders and their status</CardDescription>
                                </CardHeader>

                                <CardContent>
                                    {isAuthenticated ? (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500 mb-4">Your order history will appear here</p>
                                            <Button onClick={() => router.push("/orders")} className="bg-green-500 hover:bg-green-600">
                                                View All Orders
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500 mb-4">You need to be logged in to view your order history</p>
                                            <Button onClick={() => router.push("/sign-in")} className="bg-green-500 hover:bg-green-600">
                                                Log In
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}

