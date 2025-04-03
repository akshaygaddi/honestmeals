"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "react-hot-toast"
import { ArrowLeft, CheckCircle, Clock, CreditCard, MapPin, Phone, ShoppingBag, User, XCircle } from "lucide-react"
import { format } from "date-fns"

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const supabase = createClient()
    const orderId = params.id

    const [loading, setLoading] = useState(true)
    const [order, setOrder] = useState<any>(null)
    const [orderItems, setOrderItems] = useState<any[]>([])

    useEffect(() => {
        async function fetchOrderDetails() {
            setLoading(true)

            try {
                // Fetch order details
                const { data: orderData, error: orderError } = await supabase
                    .from("orders")
                    .select(`
            *,
            profiles(full_name, phone_number)
          `)
                    .eq("id", orderId)
                    .single()

                if (orderError) {
                    console.error("Error fetching order:", orderError)
                    toast.error("Failed to load order details")
                    router.push("/orders")
                    return
                }

                // Fetch order items
                const { data: itemsData, error: itemsError } = await supabase
                    .from("order_items")
                    .select(`
            *,
            meal:meals(name, food_type, image_url)
          `)
                    .eq("order_id", orderId)

                if (itemsError) {
                    console.error("Error fetching order items:", itemsError)
                    toast.error("Failed to load order items")
                }

                setOrder(orderData)
                setOrderItems(itemsData || [])
            } catch (error) {
                console.error("Error fetching order details:", error)
                toast.error("An error occurred while loading order details")
                router.push("/orders")
            } finally {
                setLoading(false)
            }
        }

        fetchOrderDetails()
    }, [orderId, router, supabase])

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
                return <ShoppingBag className="h-5 w-5 text-blue-500" />
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

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
                <p className="mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
                <Button onClick={() => router.push("/orders")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Orders
                </Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Button variant="ghost" className="mb-6" onClick={() => router.push("/orders")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
            </Button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Order #{orderId.substring(0, 8)}</h1>
                    <p className="text-muted-foreground">
                        Placed on {format(new Date(order.created_at), "MMMM dd, yyyy 'at' h:mm a")}
                    </p>
                </div>
                <div className="mt-2 md:mt-0 flex items-center">
                    {getStatusIcon(order.status)}
                    <span className="ml-2 mr-3">Status:</span>
                    {getStatusBadge(order.status)}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Items</CardTitle>
                            <CardDescription>
                                {orderItems.length} {orderItems.length === 1 ? "item" : "items"} in your order
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {orderItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex justify-between items-center pb-4 border-b last:border-0 last:pb-0"
                                    >
                                        <div className="flex items-center">
                                            <div
                                                className={`w-2 h-2 rounded-full mr-2 ${item.meal.food_type ? "bg-green-500" : "bg-red-500"}`}
                                            ></div>
                                            <div>
                                                <p className="font-medium">{item.meal.name}</p>
                                                <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">₹{item.total_price.toFixed(2)}</p>
                                            <p className="text-sm text-muted-foreground">₹{item.unit_price.toFixed(2)} each</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Delivery Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <User className="h-5 w-5 mr-3 text-gray-500" />
                                    <div>
                                        <p className="font-medium">Customer</p>
                                        <p>{order.profiles?.full_name || "Guest"}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <Phone className="h-5 w-5 mr-3 text-gray-500" />
                                    <div>
                                        <p className="font-medium">Phone Number</p>
                                        <p>{order.profiles?.phone_number || "N/A"}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <MapPin className="h-5 w-5 mr-3 text-gray-500" />
                                    <div>
                                        <p className="font-medium">Delivery Address</p>
                                        <p>{order.delivery_address}</p>
                                    </div>
                                </div>

                                {order.notes && (
                                    <div className="flex items-start">
                                        <div className="h-5 w-5 mr-3" />
                                        <div>
                                            <p className="font-medium">Special Instructions</p>
                                            <p className="text-muted-foreground">{order.notes}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>₹{(order.total_amount - 40).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Delivery Fee</span>
                                        <span>₹40.00</span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between font-medium">
                                        <span>Total</span>
                                        <span>₹{order.total_amount.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <div className="flex items-center">
                                        <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                                        <span className="text-sm">
                      Payment Method: <span className="font-medium">{order.payment_method}</span>
                    </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Order Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex">
                                    <div className="mr-3 relative">
                                        <div className="w-3 h-3 rounded-full bg-green-500 z-10 relative"></div>
                                        <div className="absolute top-3 bottom-0 left-1.5 -ml-px w-px bg-gray-200"></div>
                                    </div>
                                    <div>
                                        <p className="font-medium">Order Placed</p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(order.created_at), "MMM dd, yyyy 'at' h:mm a")}
                                        </p>
                                    </div>
                                </div>

                                {order.status !== "pending" && (
                                    <div className="flex">
                                        <div className="mr-3 relative">
                                            <div className="w-3 h-3 rounded-full bg-blue-500 z-10 relative"></div>
                                            <div className="absolute top-3 bottom-0 left-1.5 -ml-px w-px bg-gray-200"></div>
                                        </div>
                                        <div>
                                            <p className="font-medium">Order Approved</p>
                                            <p className="text-sm text-muted-foreground">Your order has been confirmed</p>
                                        </div>
                                    </div>
                                )}

                                {(order.status === "preparing" ||
                                    order.status === "out_for_delivery" ||
                                    order.status === "delivered") && (
                                    <div className="flex">
                                        <div className="mr-3 relative">
                                            <div
                                                className={`w-3 h-3 rounded-full ${order.status === "preparing" ? "bg-purple-500" : "bg-gray-300"} z-10 relative`}
                                            ></div>
                                            <div className="absolute top-3 bottom-0 left-1.5 -ml-px w-px bg-gray-200"></div>
                                        </div>
                                        <div>
                                            <p className="font-medium">Preparing</p>
                                            <p className="text-sm text-muted-foreground">Your meal is being prepared</p>
                                        </div>
                                    </div>
                                )}

                                {(order.status === "out_for_delivery" || order.status === "delivered") && (
                                    <div className="flex">
                                        <div className="mr-3 relative">
                                            <div
                                                className={`w-3 h-3 rounded-full ${order.status === "out_for_delivery" ? "bg-indigo-500" : "bg-gray-300"} z-10 relative`}
                                            ></div>
                                            <div className="absolute top-3 bottom-0 left-1.5 -ml-px w-px bg-gray-200"></div>
                                        </div>
                                        <div>
                                            <p className="font-medium">Out for Delivery</p>
                                            <p className="text-sm text-muted-foreground">Your order is on the way</p>
                                        </div>
                                    </div>
                                )}

                                {order.status === "delivered" && (
                                    <div className="flex">
                                        <div className="mr-3">
                                            <div className="w-3 h-3 rounded-full bg-green-500 z-10 relative"></div>
                                        </div>
                                        <div>
                                            <p className="font-medium">Delivered</p>
                                            <p className="text-sm text-muted-foreground">Your order has been delivered</p>
                                        </div>
                                    </div>
                                )}

                                {order.status === "cancelled" && (
                                    <div className="flex">
                                        <div className="mr-3">
                                            <div className="w-3 h-3 rounded-full bg-red-500 z-10 relative"></div>
                                        </div>
                                        <div>
                                            <p className="font-medium">Cancelled</p>
                                            <p className="text-sm text-muted-foreground">Your order has been cancelled</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

