"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

type CartItem = {
    id: string
    name: string
    price: number
    quantity: number
    [key: string]: any
}

type OrderData = {
    userId: string | undefined
    customerName: string
    customerPhone: string
    customerAddress: string
    customerNote: string
    cart: CartItem[]
    totalAmount: number
    paymentMethod: string
}

export async function createOrder(data: OrderData) {
    const supabase = await createClient()

    try {
        // Check if user is authenticated
        const {
            data: { user },
        } = await supabase.auth.getUser()

        let customerId = user?.id

        // If user is authenticated, update their profile
        if (customerId) {
            await supabase.from("profiles").upsert({
                id: customerId,
                full_name: data.customerName,
                phone_number: data.customerPhone,
                address: data.customerAddress,
                updated_at: new Date().toISOString(),
            })
        } else {
            // For guest checkout, create a temporary customer record
            // In a real app, you might want to handle this differently
            const { data: guestCustomer, error: guestError } = await supabase
                .from("guest_customers")
                .insert({
                    full_name: data.customerName,
                    phone_number: data.customerPhone,
                    address: data.customerAddress,
                })
                .select()
                .single()

            console.log(guestCustomer)


            if (guestError) {
                console.error("Error creating guest customer:", guestError)
                return { success: false, error: "Failed to create customer record" }
            }

            customerId = guestCustomer.id
        }

        // Create order record
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
                customer_id: customerId,
                total_amount: data.totalAmount,
                status: "pending",
                delivery_address: data.customerAddress,
                notes: data.customerNote || null,
                payment_method: data.paymentMethod,
                payment_status: "pending",
            })
            .select()

        if (orderError || !order || order.length === 0) {
            console.error("Error creating order:", orderError)
            return { success: false, error: "Failed to create order" }
        }

        const orderId = order[0].id
        console.log(orderId, "orderIDd")


        // Create order items
        const orderItems = data.cart.map((item) => ({
            order_id: orderId,
            meal_id: item.id,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity,
        }))
        console.log("hello")

        try {
            // Insert order items in batches to avoid potential size limits
            const batchSize = 10
            for (let i = 0; i < orderItems.length; i += batchSize) {
                const batch = orderItems.slice(i, i + batchSize)
                console.log(batch)

                const { error: itemsError } = await supabase.from("order_items").insert(batch)

                if (itemsError) {
                    console.error("Error creating order items batch:", itemsError)
                    throw new Error("Failed to create order items")
                }
            }
        } catch (error) {
            console.error("Error creating order items:", error)
            // Delete the order since items failed
            await supabase.from("orders").delete().eq("id", orderId)
            return { success: false, error: "Failed to create order items. Please try again." }
        }

        // Revalidate the orders page
        revalidatePath("/orders")
        revalidatePath("/admin/orders")

        return { success: true, orderId }
    } catch (error) {
        console.error("Error processing order:", error)
        return { success: false, error: "An unexpected error occurred" }
    }
}

export async function updateOrderStatus(orderId: string, status: string, note?: string) {
    const supabase =await createClient()

    try {
        const { error } = await supabase
            .from("orders")
            .update({
                status,
                updated_at: new Date().toISOString(),
                admin_notes: note || null,
            })
            .eq("id", orderId)

        if (error) {
            console.error("Error updating order status:", error)
            return { success: false, error: "Failed to update order status" }
        }

        // Revalidate the orders pages
        revalidatePath("/orders")
        revalidatePath(`/orders/${orderId}`)
        revalidatePath("/admin/orders")

        return { success: true }
    } catch (error) {
        console.error("Error updating order status:", error)
        return { success: false, error: "An unexpected error occurred" }
    }
}

