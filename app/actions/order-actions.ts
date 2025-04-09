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

export async function createOrder({
                                      userId,
                                      customerName,
                                      customerPhone,
                                      customerAddress,
                                      customerNote,
                                      cart,
                                      totalAmount,
                                      paymentMethod = "COD",
                                  }: {
    userId: string
    customerName: string
    customerPhone: string
    customerAddress: string
    customerNote?: string
    cart: CartItem[]
    totalAmount: number
    paymentMethod: string
}) {
    try {
        const supabase =  await createClient()

        // First, update the user's profile with the latest information
        await supabase.from("profiles").upsert({
            id: userId,
            full_name: customerName,
            phone_number: customerPhone,
            address: customerAddress,
            updated_at: new Date().toISOString(),
        })

        // Create the order
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
                customer_id: userId, // This now references auth.users directly
                total_amount: totalAmount,
                status: "pending",
                payment_status: "pending",
                payment_method: paymentMethod,
                delivery_address: customerAddress,
                notes: customerNote,
            })
            .select()
            .single()

        if (orderError) {
            console.error("Error creating order:", orderError)
            return { success: false, error: orderError.message }
        }

        // Add order items
        const orderItems = cart.map((item) => ({
            order_id: order.id,
            meal_id: item.id, // This can be null for custom meals
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity,
        }))

        const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

        if (itemsError) {
            console.error("Error adding order items:", itemsError)
            return { success: false, error: itemsError.message }
        }

        revalidatePath("/orders")
        return { success: true, orderId: order.id }
    } catch (error) {
        console.error("Error in createOrder:", error)
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

