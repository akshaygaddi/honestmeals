"use client"

import Image from "next/image"
import { X, Plus, Minus, ShoppingCart, ArrowRight, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { motion, AnimatePresence } from "framer-motion"
import { CartItem } from "@/types/meals"
import { useRouter } from "next/navigation"

interface CartSheetProps {
  isOpen: boolean
  onClose: () => void
  cartItems: CartItem[]
  onAddToCart: (item: CartItem) => void
  onRemoveFromCart: (itemId: string) => void
  onRemoveItemCompletely: (itemId: string) => void
}

export function CartSheet({
  isOpen,
  onClose,
  cartItems,
  onAddToCart,
  onRemoveFromCart,
  onRemoveItemCompletely
}: CartSheetProps) {
  const router = useRouter()
  
  // Calculate totals
  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = cartItems.length > 0 ? 40 : 0
  const total = subtotal + deliveryFee
  
  // Apply conditional discount
  const discount = subtotal > 500 ? 50 : 0
  const finalTotal = total - discount
  
  const proceedToCheckout = () => {
    router.push("/checkout")
    onClose()
  }
  
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5 text-green-500" />
              Your Cart
              {cartItemsCount > 0 && (
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                  {cartItemsCount} {cartItemsCount === 1 ? 'item' : 'items'}
                </Badge>
              )}
            </SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart size={36} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6 max-w-xs mx-auto">
                Add some delicious and healthy meals to get started!
              </p>
              <Button 
                onClick={onClose} 
                className="bg-green-500 hover:bg-green-600 px-6"
              >
                Browse Meals
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex border-b border-gray-100 pb-5"
                  >
                    <div className="w-20 h-20 bg-gray-100 rounded-lg relative flex-shrink-0 overflow-hidden">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-400 rounded-lg">
                          <span className="text-white font-bold">
                            {item.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="absolute top-0 left-0 w-6 h-6 flex items-center justify-center">
                        {item.food_type ? (
                          <div className="bg-green-500 rounded-full w-3 h-3 border border-white"></div>
                        ) : (
                          <div className="bg-red-500 rounded-full w-3 h-3 border border-white"></div>
                        )}
                      </div>
                    </div>

                    <div className="ml-4 flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium text-gray-800">{item.name}</h4>
                        <div className="flex items-center">
                          <span className="font-medium text-green-600 mr-2">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-gray-400 hover:text-red-500"
                            onClick={() => onRemoveItemCompletely(item.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          onClick={() => onRemoveFromCart(item.id)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="mx-3 font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          onClick={() => onAddToCart(item)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                          {item.calories} cal
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                          {item.protein}g protein
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery Fee</span>
                <span>₹{deliveryFee.toFixed(2)}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {subtotal < 500 && subtotal > 0 && (
              <div className="mb-4 bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-800">
                <p>Add ₹{(500 - subtotal).toFixed(2)} more to get ₹50 off!</p>
              </div>
            )}

            <Button
              onClick={proceedToCheckout}
              className="w-full bg-green-500 hover:bg-green-600 h-12"
            >
              Proceed to Checkout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
} 