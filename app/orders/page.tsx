"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "react-hot-toast"
import {
    ArrowLeft,
    Clock,
    CheckCircle,
    XCircle,
    Truck,
    ShoppingCart,
    Calendar,
    AlertCircle,
    RefreshCw,
} from "lucide-react"
import { format } from "date-fns"

type Order = {
    id: string
    user_id: string
    order_date: string
    total_amount: number
    status: string
    delivery_address: string
    notes: string | null
    payment_method: string
    created_at: string
    items: OrderItem[]
}

type OrderItem = {
    id: string
    order_id: string
    meal_id: string
    quantity: number
    unit_price: number
    total_price: number
    meal: {
        name: string
        food_type: boolean
    }
}

export default function OrdersPage() {
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [orders, setOrders] = useState<Order[]>([])
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isReorderDialogOpen, setIsReorderDialogOpen] = useState(false)
    const [isReordering, setIsReordering] = useState(false)

    useEffect(() => {
        async function fetchOrders() {
            setLoading(true)

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

            // Fetch orders with items
            const { data: ordersData, error: ordersError } = await supabase
                .from("orders")
                .select(`
          *,
          items:order_items(
            *,
            meal:meals(name, food_type)
          )
        `)
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })

            if (ordersError) {
                console.error("Error fetching orders:", ordersError)
                toast.error("Failed to load orders")
            } else {
                setOrders(ordersData || [])
            }

            setLoading(false)
        }

        fetchOrders()
    }, [supabase])

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
            case "approved":
                return <CheckCircle className="h-5 w-5 text-blue-500" />
            case "preparing":
                return <RefreshCw className="h-5 w-5 text-purple-500" />
            case "out_for_delivery":
                return <Truck className="h-5 w-5 text-indigo-500" />
            case "delivered":
                return <CheckCircle className="h-5 w-5 text-green-500" />
            case "cancelled":
                return <XCircle className="h-5 w-5 text-red-500" />
            default:
                return <AlertCircle className="h-5 w-5 text-gray-500" />
        }
    }

    const handleReorder = async () => {
        if (!selectedOrder) return

        setIsReordering(true)

        try {
            // Create a cart from the order items
            const cart = selectedOrder.items.map((item) => ({
                id: item.meal_id,
                name: item.meal.name,
                price: item.unit_price,
                quantity: item.quantity,
                food_type: item.meal.food_type,
            }))

            // Save to localStorage
            localStorage.setItem("honestMealsCart", JSON.stringify(cart))

            toast.success("Items added to cart")
            setIsReorderDialogOpen(false)

            // Redirect to checkout
            router.push("/meals")
        } catch (error) {
            console.error("Error reordering:", error)
            toast.error("Failed to reorder")
        } finally {
            setIsReordering(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <Button variant="ghost" className="mb-6" onClick={() => router.push("/profile")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Profile
                </Button>

                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold mb-6">Order History</h1>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="relative w-16 h-16">
                                <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
                                <div className="absolute top-0 left-0 w-full h-full border-4 border-t-green-500 rounded-full animate-spin"></div>
                            </div>
                        </div>
                    ) : !isAuthenticated ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
                                <h3 className="text-xl font-medium text-gray-900 mb-2">Authentication Required</h3>
                                <p className="text-gray-500 text-center mb-6">You need to be logged in to view your order history.</p>
                                <Button onClick={() => router.push("/login")} className="bg-green-500 hover:bg-green-600">
                                    Log In
                                </Button>
                            </CardContent>
                        </Card>
                    ) : orders.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <ShoppingCart className="h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-xl font-medium text-gray-900 mb-2">No Orders Yet</h3>
                                <p className="text-gray-500 text-center mb-6">
                                    You haven't placed any orders yet. Start ordering delicious meals!
                                </p>
                                <Button onClick={() => router.push("/meals")} className="bg-green-500 hover:bg-green-600">
                                    Browse Meals
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => (
                                <Card key={order.id} className="overflow-hidden">
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg flex items-center">
                                                    Order #{order.id.substring(0, 8)}
                                                    {getStatusIcon(order.status)}
                                                </CardTitle>
                                                <CardDescription className="flex items-center mt-1">
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    {format(new Date(order.created_at), "MMM dd, yyyy • h:mm a")}
                                                </CardDescription>
                                            </div>
                                            {getStatusBadge(order.status)}
                                        </div>
                                    </CardHeader>

                                    <CardContent>
                                        <div className="space-y-3">
                                            {order.items.slice(0, 3).map((item) => (
                                                <div key={item.id} className="flex justify-between text-sm">
                                                    <div className="flex items-center">
                                                        <div
                                                            className={`w-2 h-2 rounded-full mr-2 ${item.meal.food_type ? "bg-green-500" : "bg-red-500"}`}
                                                        ></div>
                                                        <span>
                              {item.meal.name} × {item.quantity}
                            </span>
                                                    </div>
                                                    <span>₹{item.total_price.toFixed(2)}</span>
                                                </div>
                                            ))}

                                            {order.items.length > 3 && (
                                                <div className="text-sm text-gray-500">+ {order.items.length - 3} more items</div>
                                            )}
                                        </div>

                                        <Separator className="my-3" />

                                        <div className="flex justify-between font-medium">
                                            <span>Total</span>
                                            <span>₹{order.total_amount.toFixed(2)}</span>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="bg-gray-50 border-t">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="ml-auto"
                                            onClick={() => {
                                                setSelectedOrder(order)
                                                setIsReorderDialogOpen(true)
                                            }}
                                        >
                                            <RefreshCw className="mr-2 h-4 w-4" />
                                            Reorder
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={isReorderDialogOpen} onOpenChange={setIsReorderDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reorder Items</DialogTitle>
                        <DialogDescription>Would you like to add these items to your cart?</DialogDescription>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="space-y-4 py-4">
                            <div className="max-h-60 overflow-y-auto space-y-2">
                                {selectedOrder.items.map((item) => (
                                    <div key={item.id} className="flex justify-between py-2 border-b">
                                        <div>
                                            <p className="font-medium">{item.meal.name}</p>
                                            <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                        </div>
                                        <p className="font-medium">₹{item.total_price.toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between font-medium">
                                <span>Total</span>
                                <span>₹{selectedOrder.total_amount.toFixed(2)}</span>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsReorderDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleReorder} className="bg-green-500 hover:bg-green-600" disabled={isReordering}>
                            {isReordering ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    Add to Cart
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

