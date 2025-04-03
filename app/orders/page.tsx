"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import { ArrowRight, CheckCircle, Clock, Package, ShoppingBag, XCircle } from "lucide-react"
import { format } from "date-fns"

export default function OrdersPage() {
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [orders, setOrders] = useState<any[]>([])
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        async function fetchOrders() {
            setLoading(true)

            try {
                // Check if user is authenticated
                const {
                    data: { user },
                } = await supabase.auth.getUser()

                if (!user) {
                    setIsAuthenticated(false)
                    setLoading(false)
                    return
                }

                setIsAuthenticated(true)

                // Fetch user's orders
                const { data, error } = await supabase
                    .from("orders")
                    .select(`
            *,
            items:order_items(
              id,
              meal_id,
              quantity,
              meal:meals(name)
            )
          `)
                    .eq("customer_id", user.id)
                    .order("created_at", { ascending: false })

                if (error) {
                    console.error("Error fetching orders:", error)
                    toast.error("Failed to load orders")
                } else {
                    setOrders(data || [])
                }
            } catch (error) {
                console.error("Error fetching orders:", error)
                toast.error("An error occurred while loading orders")
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()
    }, [supabase, router])

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        Pending
                    </Badge>
                )
            case "approved":
                return (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                        Approved
                    </Badge>
                )
            case "preparing":
                return (
                    <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                        Preparing
                    </Badge>
                )
            case "out_for_delivery":
                return (
                    <Badge variant="outline" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">
                        Out for Delivery
                    </Badge>
                )
            case "delivered":
                return (
                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                        Delivered
                    </Badge>
                )
            case "cancelled":
                return (
                    <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                        Cancelled
                    </Badge>
                )
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "pending":
                return <Clock className="h-5 w-5 text-yellow-500" />
            case "delivered":
                return <CheckCircle className="h-5 w-5 text-green-500" />
            case "cancelled":
                return <XCircle className="h-5 w-5 text-red-500" />
            default:
                return <Package className="h-5 w-5 text-blue-500" />
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 flex justify-center">
                <div className="relative w-16 h-16">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-t-green-500 rounded-full animate-spin"></div>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-md">
                <Card>
                    <CardHeader>
                        <CardTitle>Sign In Required</CardTitle>
                        <CardDescription>Please sign in to view your order history</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-center mb-6">
                            You need to be signed in to view your orders. Please sign in or create an account.
                        </p>
                        <div className="flex gap-4">
                            <Button variant="outline" onClick={() => router.push("/meals")}>
                                Browse Meals
                            </Button>
                            <Button onClick={() => router.push("/login")}>Sign In</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">My Orders</h1>

            {orders.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center py-12">
                        <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-700 mb-2">No orders yet</h3>
                        <p className="text-gray-500 mb-6 text-center">
                            You haven't placed any orders yet. Browse our menu to place your first order.
                        </p>
                        <Button onClick={() => router.push("/meals")} className="bg-green-500 hover:bg-green-600">
                            Browse Meals
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.map((order) => (
                        <Card key={order.id} className="overflow-hidden">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-base">Order #{order.id.substring(0, 8)}</CardTitle>
                                        <CardDescription>{format(new Date(order.created_at), "MMM dd, yyyy")}</CardDescription>
                                    </div>
                                    {getStatusBadge(order.status)}
                                </div>
                            </CardHeader>
                            <CardContent className="pb-3">
                                <div className="space-y-3">
                                    <div className="flex items-center text-sm">
                                        {getStatusIcon(order.status)}
                                        <span className="ml-2">
                      {order.status === "pending" && "Awaiting confirmation"}
                                            {order.status === "approved" && "Order confirmed"}
                                            {order.status === "preparing" && "Preparing your meal"}
                                            {order.status === "out_for_delivery" && "On the way to you"}
                                            {order.status === "delivered" && "Delivered successfully"}
                                            {order.status === "cancelled" && "Order cancelled"}
                    </span>
                                    </div>

                                    <div className="text-sm text-muted-foreground">
                                        <span className="font-medium text-foreground">Items: </span>
                                        {order.items.slice(0, 2).map((item: any, index: number) => (
                                            <span key={item.id}>
                        {index > 0 && ", "}
                                                {item.meal.name} × {item.quantity}
                      </span>
                                        ))}
                                        {order.items.length > 2 && `, +${order.items.length - 2} more`}
                                    </div>

                                    <div className="flex justify-between items-center pt-2">
                                        <div className="font-medium">₹{order.total_amount.toFixed(2)}</div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-green-600 hover:text-green-700 hover:bg-green-50 -mr-2"
                                            onClick={() => router.push(`/orders/${order.id}`)}
                                        >
                                            View Details
                                            <ArrowRight className="ml-1 h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

