"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, Users, Settings, ShieldAlert } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"

export default function AdminDashboard() {
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()
    const [isAdmin, setIsAdmin] = useState(false)
    const [adminChecked, setAdminChecked] = useState(false)

    // Check if current user is an admin
    const checkAdminStatus = async () => {
        if (!user) return false

        try {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (error) {
                console.error('Error checking admin status:', error)
                return false
            }

            return data?.role === 'admin'
        } catch (error) {
            console.error('Error in admin check:', error)
            return false
        }
    }

    // Check admin status when user is loaded
    useEffect(() => {
        if (!authLoading && user && !adminChecked) {
            checkAdminStatus().then(isAdminUser => {
                setIsAdmin(isAdminUser)
                setAdminChecked(true)
            })
        }
    }, [authLoading, user, adminChecked])

    // Redirect non-admin users
    if (!authLoading && (adminChecked && !isAdmin)) {
        return (
            <div className="container mx-auto py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Admin Access Required</CardTitle>
                        <CardDescription>You don't have permission to access this page</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center py-8">
                            <ShieldAlert className="h-16 w-16 text-red-400 mb-4" />
                        </div>
                        <p className="text-center">This page is restricted to administrators only. Please contact an administrator if you need access.</p>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Button onClick={() => router.push('/')}>Return to Home</Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    if (authLoading || !adminChecked) {
        return (
            <div className="container mx-auto py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Loading...</CardTitle>
                        <CardDescription>Checking permissions</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center py-8">
                        <div className="animate-spin h-8 w-8 border-4 border-green-500 rounded-full border-t-transparent"></div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-gray-500">Manage your application settings and data</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Database Management Card */}
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5 text-green-500" />
                            Database Management
                        </CardTitle>
                        <CardDescription>
                            Check and configure database tables
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">
                            Verify database structure, create missing tables, and manage database settings.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Link href="/admin/database" className="w-full">
                            <Button className="w-full">Manage Database</Button>
                        </Link>
                    </CardFooter>
                </Card>

                {/* User Management Card */}
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-500" />
                            User Management
                        </CardTitle>
                        <CardDescription>
                            Manage user accounts and roles
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">
                            View user accounts, assign roles, and manage permissions for the application.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" variant="outline">Coming Soon</Button>
                    </CardFooter>
                </Card>

                {/* System Settings Card */}
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5 text-gray-500" />
                            System Settings
                        </CardTitle>
                        <CardDescription>
                            Configure application settings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">
                            Adjust system settings, application behavior, and configuration options.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" variant="outline">Coming Soon</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}

