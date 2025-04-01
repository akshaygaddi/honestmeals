"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    ShoppingBag,
    Users,
    UtensilsCrossed,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle,
    XCircle,
} from "lucide-react"
import { toast } from "react-hot-toast"

type DashboardStats = {
    totalOrders: number
    pendingOrders: number
    completedOrders: number
    cancelledOrders: number
    totalUsers: number
    totalMeals: number
    totalRevenue: number
    revenueChange: number
}

export default function AdminDashboard() {
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<DashboardStats>({
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        totalUsers: 0,
        totalMeals: 0,
        totalRevenue: 0,
        revenueChange: 0,
    })
    const [recentOrders, setRecentOrders] = useState<any[]>([])

    useEffect(() => {
        async function fetchDashboardData() {
            setLoading(true)

            try {
                // Fetch total orders
                const { count: totalOrders } = await supabase.from("orders").select("*", { count: "exact", head: true })

                // Fetch pending orders
                const { count: pendingOrders } = await supabase
                    .from("orders")
                    .select("*", { count: "exact", head: true })
                    .eq("status", "pending")

                // Fetch completed orders
                const { count: completedOrders } = await supabase
                    .from("orders")
                    .select("*", { count: "exact", head: true })
                    .eq("status", "delivered")

                // Fetch cancelled orders
                const { count: cancelledOrders } = await supabase
                    .from("orders")
                    .select("*", { count: "exact", head: true })
                    .eq("status", "cancelled")

                // Fetch total users
                const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

                // Fetch total meals
                const { count: totalMeals } = await supabase.from("meals").select("*", { count: "exact", head: true })

                // Fetch total revenue
                const { data: revenueData } = await supabase
                    .from("orders")
                    .select("total_amount")
                    .not("status", "eq", "cancelled")

                const totalRevenue = revenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0

                // Fetch recent orders
                const { data: recentOrdersData } = await supabase
                    .from("orders")
                    .select(`
            *,
            profiles(full_name, phone_number)
          `)
                    .order("created_at", { ascending: false })
                    .limit(5)

                setStats({
                    totalOrders: totalOrders || 0,
                    pendingOrders: pendingOrders || 0,
                    completedOrders: completedOrders || 0,
                    cancelledOrders: cancelledOrders || 0,
                    totalUsers: totalUsers || 0,
                    totalMeals: totalMeals || 0,
                    totalRevenue,
                    revenueChange: 5.2, // Placeholder for revenue change percentage
                })

                setRecentOrders(recentOrdersData || [])
            } catch (error) {
                console.error("Error fetching dashboard data:", error)
                toast.error("Failed to load dashboard data")
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [supabase])

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending":
                return "text-yellow-500"
            case "approved":
                return "text-blue-500"
            case "preparing":
                return "text-purple-500"
            case "out_for_delivery":
                return "text-indigo-500"
            case "delivered":
                return "text-green-500"
            case "cancelled":
                return "text-red-500"
            default:
                return "text-gray-500"
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "pending":
                return <Clock className="h-4 w-4 text-yellow-500" />
            case "delivered":
                return <CheckCircle className="h-4 w-4 text-green-500" />
            case "cancelled":
                return <XCircle className="h-4 w-4 text-red-500" />
            default:
                return null
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Overview of your business</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="relative w-16 h-16">
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-t-green-500 rounded-full animate-spin"></div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₹{stats.totalRevenue.toFixed(2)}</div>
                                <p className="text-xs text-muted-foreground flex items-center">
                                    {stats.revenueChange > 0 ? (
                                        <>
                                            <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                                            <span className="text-green-500">{stats.revenueChange}% from last month</span>
                                        </>
                                    ) : (
                                        <>
                                            <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                                            <span className="text-red-500">{Math.abs(stats.revenueChange)}% from last month</span>
                                        </>
                                    )}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats.pendingOrders} pending, {stats.completedOrders} completed
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                                <p className="text-xs text-muted-foreground">Active customers</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Meals</CardTitle>
                                <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalMeals}</div>
                                <p className="text-xs text-muted-foreground">Available in menu</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Orders */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Orders</CardTitle>
                            <CardDescription>Latest 5 orders received</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentOrders.length > 0 ? (
                                    recentOrders.map((order) => (
                                        <div key={order.id} className="flex items-center justify-between border-b pb-4">
                                            <div>
                                                <div className="font-medium flex items-center">
                                                    Order #{order.id.substring(0, 8)}
                                                    {getStatusIcon(order.status)}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {order.profiles?.full_name || "Unknown"} • ₹{order.total_amount.toFixed(2)}
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                        <span className={`text-sm font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                                                <Button variant="ghost" size="sm" className="ml-2">
                                                    View
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4 text-muted-foreground">No recent orders found</div>
                                )}
                            </div>

                            <div className="mt-4 text-center">
                                <Button variant="outline" size="sm">
                                    View All Orders
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Performance Tabs */}
                    <Tabs defaultValue="orders">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="orders">Orders</TabsTrigger>
                            <TabsTrigger value="revenue">Revenue</TabsTrigger>
                            <TabsTrigger value="users">Users</TabsTrigger>
                        </TabsList>

                        <TabsContent value="orders" className="space-y-4 mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order Statistics</CardTitle>
                                    <CardDescription>Breakdown of orders by status</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                                                <span>Pending</span>
                                            </div>
                                            <div className="font-medium">{stats.pendingOrders}</div>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                                <span>Completed</span>
                                            </div>
                                            <div className="font-medium">{stats.completedOrders}</div>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                                                <span>Cancelled</span>
                                            </div>
                                            <div className="font-medium">{stats.cancelledOrders}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="revenue" className="space-y-4 mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Revenue Overview</CardTitle>
                                    <CardDescription>Monthly revenue breakdown</CardDescription>
                                </CardHeader>
                                <CardContent className="h-80 flex items-center justify-center">
                                    <p className="text-muted-foreground">Revenue chart will be displayed here</p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="users" className="space-y-4 mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>User Growth</CardTitle>
                                    <CardDescription>New user registrations over time</CardDescription>
                                </CardHeader>
                                <CardContent className="h-80 flex items-center justify-center">
                                    <p className="text-muted-foreground">User growth chart will be displayed here</p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    )
}

