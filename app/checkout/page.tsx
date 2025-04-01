"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "react-hot-toast"

type CartItem = {
    id: string
    name: string
    price: number
    quantity: number
    calories: number
    protein: number
}

export default function CheckoutPage() {
    const router = useRouter()
    const [cart, setCart] = useState<CartItem[]>([])
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [address, setAddress] = useState("")
    const [note, setNote] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        // Get cart from localStorage
        const savedCart = localStorage.getItem("honestMealsCart")
        if (savedCart) {
            setCart(JSON.parse(savedCart))
        } else {
            // Redirect to meals page if cart is empty
            router.push("/meals")
            toast.error("Your cart is empty")
        }
    }, [router])

    // Calculate cart total
    const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const deliveryFee = 40
    const cartTotal = cartSubtotal + deliveryFee

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!name || !phone || !address) {
            toast.error("Please fill in all required fields")
            return
        }

        setIsSubmitting(true)

        // Format the order message
        let message = `*New Order from Honest Meals*\n\n`
        message += `*Name:* ${name}\n`
        message += `*Phone:* ${phone}\n`
        message += `*Address:* ${address}\n`

        message += `\n*Order Details:*\n`

        cart.forEach((item, index) => {
            message += `${index + 1}. ${item.name} x ${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}\n`
        })

        message += `\n*Subtotal:* ₹${cartSubtotal.toFixed(2)}\n`
        message += `*Delivery Fee:* ₹${deliveryFee.toFixed(2)}\n`
        message += `*Total:* ₹${cartTotal.toFixed(2)}\n`

        if (note) {
            message += `\n*Note:* ${note}\n`
        }

        // Encode the message for WhatsApp
        const encodedMessage = encodeURIComponent(message)

        // Create WhatsApp link (replace with your actual phone number)
        const whatsappLink = `https://wa.me/918888756746?text=${encodedMessage}`

        // Open WhatsApp in a new tab
        window.open(whatsappLink, "_blank")

        // Clear cart after successful order
        localStorage.removeItem("honestMealsCart")

        setIsSubmitting(false)
        toast.success("Order sent to WhatsApp!")

        // Redirect to home page
        setTimeout(() => {
            router.push("/")
        }, 1500)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <Button variant="ghost" className="mb-6" onClick={() => router.push("/meals")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Meals
                </Button>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="Your full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">
                                    Phone Number <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="phone"
                                    placeholder="Your phone number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">
                                    Delivery Address <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    id="address"
                                    placeholder="Your complete delivery address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="resize-none"
                                    rows={3}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="note">Special Instructions (Optional)</Label>
                                <Textarea
                                    id="note"
                                    placeholder="Any special instructions for your order"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="resize-none"
                                    rows={2}
                                />
                            </div>

                            <Button type="submit" className="w-full bg-green-500 hover:bg-green-600" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Send to WhatsApp
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                        <div className="space-y-4 mb-6">
                            {cart.map((item) => (
                                <div key={item.id} className="flex justify-between pb-3 border-b">
                                    <div>
                                        <p className="font-medium">
                                            {item.name} <span className="text-gray-500">x{item.quantity}</span>
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {item.calories} cal | {item.protein}g protein
                                        </p>
                                    </div>
                                    <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span>₹{cartSubtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Delivery Fee</span>
                                <span>₹{deliveryFee.toFixed(2)}</span>
                            </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>₹{cartTotal.toFixed(2)}</span>
                        </div>

                        <div className="mt-6 bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
                            <p className="mb-2">
                                <span className="font-medium text-gray-700">Payment Method:</span> Cash on Delivery
                            </p>
                            <p>
                                <span className="font-medium text-gray-700">Delivery Time:</span> 30-45 minutes after order confirmation
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

