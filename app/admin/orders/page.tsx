"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "react-hot-toast"
import {
    Search,
    Filter,
    Eye,
    Clock,
    CheckCircle,
    XCircle,
    Truck,
    Loader2,
    Calendar,
    User,
    MapPin,
    Phone,
    CreditCard,
    Send,
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
    profiles: {
        full_name: string | null
        phone_number: string | null
    }
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

export default function AdminOrders() {
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [orders, setOrders] = useState<Order[]>([])
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string | null>(null)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
    const [newStatus, setNewStatus] = useState("")
    const [statusNote, setStatusNote] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        async function fetchOrders() {
            setLoading(true)

            try {
                const { data, error } = await supabase
                    .from("orders")
                    .select(`
            *,
            profiles(full_name, phone_number),
            items:order_items(
              *,
              meal:meals(name, food_type)
            )
          `)
                    .order("created_at", { ascending: false })

                if (error) {
                    console.error("Error fetching orders:", error)
                    toast.error("Failed to load orders")
                } else {
                    setOrders(data || [])
                    setFilteredOrders(data || [])
                }
            } catch (error) {
                console.error("Error fetching orders:", error)
                toast.error("An error occurred while loading orders")
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()
    }, [supabase])

    // Filter orders
    useEffect(() => {
        let filtered = [...orders]

        // Apply search filter
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(
                (order) =>
                    order.id.toLowerCase().includes(query) ||
                    (order.profiles?.full_name && order.profiles.full_name.toLowerCase().includes(query)) ||
                    (order.profiles?.phone_number &&
                        order.profiles?.phone_number &&
                        order.profiles.phone_number.toLowerCase().includes(query)) ||
                    order.delivery_address.toLowerCase().includes(query),
            )
        }

        // Apply status filter
        if (statusFilter) {
            filtered = filtered.filter((order) => order.status === statusFilter)
        }

        setFilteredOrders(filtered)
    }, [orders, searchQuery, statusFilter])

    const handleViewOrder = (order: Order) => {
        setSelectedOrder(order)
        setIsViewDialogOpen(true)
    }

    const handleStatusChange = (order: Order) => {
        setSelectedOrder(order)
        setNewStatus(order.status)
        setStatusNote("")
        setIsStatusDialogOpen(true)
    }

    const updateOrderStatus = async () => {
        if (!selectedOrder || !newStatus) return

        setIsSubmitting(true)

        try {
            const { error } = await supabase
                .from("orders")
                .update({
                    status: newStatus,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", selectedOrder.id)

            if (error) {
                console.error("Error updating order status:", error)
                toast.error("Failed to update order status")
            } else {
                toast.success(`Order status updated to ${newStatus}`)

                // Send notification to customer (in a real app)
                // This would typically be handled by a server function

                // Refresh orders list
                const { data } = await supabase
                    .from("orders")
                    .select(`
            *,
            profiles(full_name, phone_number),
            items:order_items(
              *,
              meal:meals(name, food_type)
            )
          `)
                    .order("created_at", { ascending: false })

                setOrders(data || [])
                setIsStatusDialogOpen(false)
            }
        } catch (error) {
            console.error("Error updating order status:", error)
            toast.error("An error occurred while updating the order status")
        } finally {
            setIsSubmitting(false)
        }
    }

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
                return <Clock className="h-4 w-4 text-yellow-500" />
            case "approved":
                return <CheckCircle className="h-4 w-4 text-blue-500" />
            case "preparing":
                return <Loader2 className="h-4 w-4 text-purple-500" />
            case "out_for_delivery":
                return <Truck className="h-4 w-4 text-indigo-500" />
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
                <h1 className="text-2xl font-bold tracking-tight">Orders Management</h1>
                <p className="text-muted-foreground">Manage and track customer orders</p>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                type="text"
                                placeholder="Search orders by ID, customer name, or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-white border-gray-200"
                            />
                        </div>

                        <Select value={statusFilter || ""} onValueChange={(value) => setStatusFilter(value || null)}>
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="preparing">Preparing</SelectItem>
                                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Orders Table */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="relative w-16 h-16">
                                <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
                                <div className="absolute top-0 left-0 w-full h-full border-4 border-t-green-500 rounded-full animate-spin"></div>
                            </div>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Filter className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-700 mb-2">No orders found</h3>
                            <p className="text-gray-500 mb-4">Try adjusting your filters</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">#{order.id.substring(0, 8)}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{order.profiles?.full_name || "Guest"}</div>
                                                    <div className="text-sm text-muted-foreground">{order.profiles?.phone_number || "N/A"}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(order.created_at), "MMM dd, yyyy")}
                                                <div className="text-sm text-muted-foreground">
                                                    {format(new Date(order.created_at), "h:mm a")}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <span className="font-medium">{order.items.length}</span>
                                                    <span className="text-muted-foreground ml-1">items</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">₹{order.total_amount.toFixed(2)}</TableCell>
                                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleViewOrder(order)}>
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700"
                                                        onClick={() => handleStatusChange(order)}
                                                    >
                                                        Update
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* View Order Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Order Details</DialogTitle>
                        <DialogDescription>Complete information about this order</DialogDescription>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="space-y-6 py-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-medium">Order #{selectedOrder.id.substring(0, 8)}</h3>
                                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        {format(new Date(selectedOrder.created_at), "MMMM dd, yyyy • h:mm a")}
                                    </div>
                                </div>
                                {getStatusBadge(selectedOrder.status)}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-muted-foreground">Customer Information</h4>
                                    <div className="space-y-1">
                                        <div className="flex items-center">
                                            <User className="h-4 w-4 mr-2 text-gray-500" />
                                            <span>{selectedOrder.profiles?.full_name || "Guest"}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Phone className="h-4 w-4 mr-2 text-gray-500" />
                                            <span>{selectedOrder.profiles?.phone_number || "N/A"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-muted-foreground">Delivery Information</h4>
                                    <div className="flex items-start">
                                        <MapPin className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
                                        <span>{selectedOrder.delivery_address}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-muted-foreground">Payment Information</h4>
                                <div className="flex items-center">
                                    <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                                    <span>{selectedOrder.payment_method}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-muted-foreground">Order Items</h4>
                                <div className="border rounded-md divide-y">
                                    {selectedOrder.items.map((item) => (
                                        <div key={item.id} className="flex justify-between p-3">
                                            <div className="flex items-center">
                                                <div
                                                    className={`w-2 h-2 rounded-full mr-2 ${item.meal.food_type ? "bg-green-500" : "bg-red-500"}`}
                                                ></div>
                                                <span>
                          {item.meal.name} <span className="text-muted-foreground">× {item.quantity}</span>
                        </span>
                                            </div>
                                            <span className="font-medium">₹{item.total_price.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2 border-t pt-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>₹{(selectedOrder.total_amount - 40).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Delivery Fee</span>
                                    <span>₹40.00</span>
                                </div>
                                <div className="flex justify-between font-medium">
                                    <span>Total</span>
                                    <span>₹{selectedOrder.total_amount.toFixed(2)}</span>
                                </div>
                            </div>

                            {selectedOrder.notes && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-muted-foreground">Customer Notes</h4>
                                    <div className="bg-gray-50 p-3 rounded-md text-sm">{selectedOrder.notes}</div>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                            Close
                        </Button>
                        {selectedOrder && (
                            <Button
                                className="bg-green-500 hover:bg-green-600"
                                onClick={() => {
                                    setIsViewDialogOpen(false)
                                    handleStatusChange(selectedOrder)
                                }}
                            >
                                Update Status
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Update Status Dialog */}
            <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Update Order Status</DialogTitle>
                        <DialogDescription>Change the status of this order and notify the customer</DialogDescription>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="status">New Status</Label>
                                <Select value={newStatus} onValueChange={setNewStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="preparing">Preparing</SelectItem>
                                        <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                                        <SelectItem value="delivered">Delivered</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="note">Note (Optional)</Label>
                                <Textarea
                                    id="note"
                                    placeholder="Add a note about this status change"
                                    value={statusNote}
                                    onChange={(e) => setStatusNote(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={updateOrderStatus} className="bg-green-500 hover:bg-green-600" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Update Status
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

