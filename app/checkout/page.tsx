"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { toast } from "react-hot-toast"
import { ArrowLeft, CreditCard, Loader2, ShoppingBag, Truck } from "lucide-react"
import { createOrder } from "@/app/actions/order-actions"

type CartItem = {
    id: string
    name: string
    description: string | null
    price: number
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number | null
    image_url: string | null
    category_id: string
    dietary_type_id: string | null
    food_type: boolean | null
    is_available: boolean
    spice_level: number | null
    cooking_time_minutes: number | null
    quantity: number
}

export default function CheckoutPage() {
    const router = useRouter()
    const supabase = createClient()

    const [cart, setCart] = useState<CartItem[]>([])
    const [customerName, setCustomerName] = useState("")
    const [customerPhone, setCustomerPhone] = useState("")
    const [customerAddress, setCustomerAddress] = useState("")
    const [customerNote, setCustomerNote] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    // Calculate cart total
    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const deliveryFee = 40
    const totalAmount = cartTotal + deliveryFee

    useEffect(() => {
        // Get cart from localStorage
        const savedCart = localStorage.getItem("honestMealsCart")
        if (savedCart) {
            setCart(JSON.parse(savedCart))
        } else {
            router.push("/meals")
            toast.error("Your cart is empty")
        }

        // Get user data from localStorage
        const userData = localStorage.getItem("honestMealsUser")
        if (userData) {
            const user = JSON.parse(userData)
            setCustomerName(user.name || "")
            setCustomerPhone(user.phone || "")
            setCustomerAddress(user.address || "")
        }

        // Check if user is authenticated
        async function checkAuth() {
            const { data } = await supabase.auth.getSession()
            if (data.session) {
                setIsAuthenticated(true)
                const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.session.user.id).single()
                if (profile) {
                    setCustomerName(profile.full_name || "")
                    setCustomerPhone(profile.phone_number || "")
                    setCustomerAddress(profile.address || "")
                }
            }
        }
        checkAuth()
    }, [router, supabase])

    const createWhatsAppOrder = () => {
        let message = `*New Order from Honest Meals*\n\n`
        message += `*Customer Details:*\n`
        message += `*Name:* ${customerName}\n`
        message += `*Phone:* ${customerPhone}\n`
        message += `*Address:* ${customerAddress}\n`
        message += `\n*Order Details:*\n`
        cart.forEach((item, index) => {
            message += `${index + 1}. ${item.name} x ${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}\n`
        })
        message += `\n*Subtotal:* ₹${cartTotal.toFixed(2)}\n`
        message += `*Delivery Fee:* ₹40.00\n`
        message += `*Total:* ₹${(cartTotal + 40).toFixed(2)}\n`
        if (customerNote) {
            message += `\n*Special Instructions:* ${customerNote}\n`
        }
        message += `\n*Order Time:* ${new Date().toLocaleString()}\n`
        return encodeURIComponent(message)
    }

    const handleWhatsAppCheckout = async () => {
        if (cart.length === 0) {
            toast.error("Your cart is empty")
            return
        }
        if (!customerName || !customerPhone || !customerAddress) {
            toast.error("Please fill in all required fields")
            return
        }

        setIsSubmitting(true)

        try {
            const userData = { name: customerName, phone: customerPhone, address: customerAddress }
            localStorage.setItem("honestMealsUser", JSON.stringify(userData))

            const { data: { user } } = await supabase.auth.getUser()
            let orderId = null

            if (user) {
                const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
                if (profile) {
                    setCustomerName(profile.full_name || customerName)
                    setCustomerPhone(profile.phone_number || customerPhone)
                    setCustomerAddress(profile.address || customerAddress)
                }

                await supabase.from("profiles").upsert({
                    id: user.id,
                    full_name: customerName,
                    phone_number: customerPhone,
                    address: customerAddress,
                    updated_at: new Date().toISOString(),
                })

                const result = await createOrder({
                    userId: user.id,
                    customerName,
                    customerPhone,
                    customerAddress,
                    customerNote,
                    cart,
                    totalAmount,
                    paymentMethod: "COD",
                })

                if (result.success) {
                    orderId = result.orderId
                } else {
                    console.error("Order creation failed:", result.error)
                }
            }

            const whatsappMessage = createWhatsAppOrder()
            const whatsappLink = `https://wa.me/918888756746?text=${whatsappMessage}`

            // Clear cart and redirect
            localStorage.removeItem("honestMealsCart")
            setCart([])

            // Open WhatsApp directly
            window.location.href = whatsappLink
            // Redirect to order confirmation page
            if (orderId) {
                router.push(`/orders/${orderId}`)
            } else {
                router.push('/orders') // Fallback if no order ID
            }

        } catch (error) {
            console.error("Error during checkout:", error)
            toast.error("An error occurred during checkout")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Button variant="ghost" className="mb-6" onClick={() => router.push("/meals")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Meals
            </Button>

            <h1 className="text-2xl font-bold mb-6">Checkout</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Delivery Information</CardTitle>
                            <CardDescription>Enter your details for delivery</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Your full name"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    placeholder="Your phone number"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Delivery Address</Label>
                                <Textarea
                                    id="address"
                                    placeholder="Your complete delivery address"
                                    value={customerAddress}
                                    onChange={(e) => setCustomerAddress(e.target.value)}
                                    rows={3}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="note">Special Instructions (Optional)</Label>
                                <Textarea
                                    id="note"
                                    placeholder="Any special instructions for your order or delivery"
                                    value={customerNote}
                                    onChange={(e) => setCustomerNote(e.target.value)}
                                    rows={2}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Method</CardTitle>
                            <CardDescription>Choose how you want to pay</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center p-3 border rounded-md bg-gray-50">
                                <CreditCard className="h-5 w-5 mr-2 text-green-500" />
                                <div className="flex-1">
                                    <p className="font-medium">Cash on Delivery</p>
                                    <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
                                </div>
                                <div className="w-5 h-5 rounded-full border-2 border-green-500 flex items-center justify-center">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                            <CardDescription>
                                {cart.length} {cart.length === 1 ? "item" : "items"} in your cart
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm pb-2 border-b">
                                        <div>
                                            <span className="font-medium">{item.name}</span>
                                            <span className="text-muted-foreground"> × {item.quantity}</span>
                                        </div>
                                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                                <div className="space-y-2 pt-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>₹{cartTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Delivery Fee</span>
                                        <span>₹{deliveryFee.toFixed(2)}</span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between font-medium">
                                        <span>Total</span>
                                        <span>₹{totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full bg-green-500 hover:bg-green-600 h-12"
                                onClick={handleWhatsAppCheckout}
                                disabled={isSubmitting || cart.length === 0}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <ShoppingBag className="mr-2 h-4 w-4" />
                                        Place Order via WhatsApp
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>

                    <div className="bg-gray-50 p-4 rounded-lg border">
                        <div className="flex items-start">
                            <Truck className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                            <div>
                                <p className="font-medium">Delivery Information</p>
                                <p className="text-sm text-muted-foreground">
                                    Orders are typically delivered within 30-45 minutes depending on your location.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}