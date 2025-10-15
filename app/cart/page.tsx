'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function Cart() {
    const [cartItems, setCartItems] = useState<any[]>([])
    const [user, setUser] = useState<any>(null)
    const [total, setTotal] = useState(0)
    const [actualTotal, setActualTotal] = useState(0)
    const [productDiscount, setProductDiscount] = useState(0)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        checkUser()
    }, [])

    const checkUser = () => {
        const userData = localStorage.getItem('user')
        if (userData) {
            setUser(JSON.parse(userData))
            loadCart(JSON.parse(userData).id)
        } else {
            router.push('/login')
        }
    }

    const loadCart = async (userId: string) => {
        const { data } = await supabase
            .from('cart')
            .select('*, products(*, categories(name))')
            .eq('user_id', userId)

        if (data) {
            // Filter out items where product is out of stock and remove them from cart
            const outOfStockItems = data.filter(item => !item.products.stock || item.products.stock === 0)
            const inStockItems = data.filter(item => item.products.stock && item.products.stock > 0)

            // Remove out of stock items from database
            if (outOfStockItems.length > 0) {
                const outOfStockIds = outOfStockItems.map(item => item.id)
                await supabase
                    .from('cart')
                    .delete()
                    .in('id', outOfStockIds)

                // Show notification if items were removed
                if (outOfStockItems.length === 1) {
                    alert('1 out of stock item was removed from your cart.')
                } else {
                    alert(`${outOfStockItems.length} out of stock items were removed from your cart.`)
                }
            }

            setCartItems(inStockItems)
            calculateTotal(inStockItems)
        }
        setLoading(false)
    }

    const calculateTotal = (items: any[]) => {
        // Calculate selling price total
        const sellingTotal = items.reduce((acc, item) => acc + (item.products.price * item.quantity), 0)

        // Calculate actual price total
        const actualPriceTotal = items.reduce((acc, item) => {
            const actualPrice = item.products.actual_price || item.products.price
            return acc + (actualPrice * item.quantity)
        }, 0)

        // Calculate product discount (difference between actual and selling)
        const discount = actualPriceTotal - sellingTotal

        setActualTotal(actualPriceTotal)
        setProductDiscount(discount)
        setTotal(sellingTotal)
    }

    const updateQuantity = async (cartId: string, newQuantity: number) => {
        if (newQuantity < 1) return

        await supabase
            .from('cart')
            .update({ quantity: newQuantity })
            .eq('id', cartId)

        if (user) loadCart(user.id)
    }

    const removeFromCart = async (cartId: string) => {
        await supabase.from('cart').delete().eq('id', cartId)
        if (user) loadCart(user.id)
    }

    const checkout = () => {
        router.push('/checkout')
    }

    const CartSkeleton = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-4 bg-gray-900 border border-gray-800 rounded-2xl p-4">
                        <div className="w-24 h-24 bg-gray-800 rounded-lg animate-pulse" />
                        <div className="flex-1 space-y-3">
                            <div className="h-6 bg-gray-800 rounded animate-pulse w-3/4" />
                            <div className="h-4 bg-gray-800 rounded animate-pulse w-1/4" />
                            <div className="h-8 bg-gray-800 rounded animate-pulse w-1/3" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="lg:col-span-1">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <div className="h-8 bg-gray-800 rounded animate-pulse w-1/2 mb-6" />
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-6 bg-gray-800 rounded animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-black pt-16 md:pt-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
                <Link href="/products" className="text-gray-400 hover:text-white mb-4 inline-block text-sm md:text-base">
                    ← Back to Shop
                </Link>
                <h1 className="text-2xl md:text-4xl font-bold mb-6 md:mb-8 text-white">Shopping Cart</h1>

                {loading ? (
                    <CartSkeleton />
                ) : cartItems.length === 0 ? (
                    <div className="text-center py-20">
                        <svg className="w-24 h-24 mx-auto text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-xl text-gray-400 mb-4">Your cart is empty</p>
                        <Link href="/products" className="inline-block bg-white text-black px-6 py-3 rounded-full hover:bg-gray-200 transition">
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-3 md:space-y-4">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex gap-3 md:gap-4 bg-gray-900 border border-gray-800 rounded-2xl p-3 md:p-4">
                                    <Link href={`/products/${item.products.id}`} className="w-20 h-20 md:w-24 md:h-24 bg-gray-800 rounded-lg overflow-hidden relative flex-shrink-0">
                                        <Image
                                            src={item.products.image_url || '/placeholder.png'}
                                            alt={item.products.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </Link>

                                    <div className="flex-1 min-w-0">
                                        <Link href={`/products/${item.products.id}`}>
                                            <h3 className="font-bold text-sm md:text-lg mb-1 hover:underline text-white line-clamp-2">{item.products.name}</h3>
                                        </Link>
                                        <p className="text-xs md:text-sm text-gray-400 mb-2">{item.products.categories?.name}</p>
                                        <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                                            <p className="text-base md:text-xl font-bold text-white">₹{item.products.price}</p>
                                            {item.products.actual_price && item.products.actual_price > item.products.price && (
                                                <>
                                                    <p className="text-xs md:text-sm text-gray-500 line-through">₹{item.products.actual_price}</p>
                                                    <span className="text-xs bg-green-900 text-green-300 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full font-bold">
                                                        {(((item.products.actual_price - item.products.price) / item.products.actual_price) * 100).toFixed(0)}% OFF
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end justify-between">
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>

                                        <div className="flex items-center gap-1 md:gap-2">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-7 h-7 md:w-8 md:h-8 text-sm md:text-base border border-white text-white rounded-full hover:bg-white hover:text-black transition"
                                            >
                                                -
                                            </button>
                                            <span className="w-6 md:w-8 text-center text-sm md:text-base font-medium text-white">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-7 h-7 md:w-8 md:h-8 text-sm md:text-base border border-white text-white rounded-full hover:bg-white hover:text-black transition"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 md:p-6 lg:sticky lg:top-20">
                                <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white">Order Summary</h2>

                                <div className="space-y-3 mb-6">
                                    {productDiscount > 0 && (
                                        <div className="flex justify-between text-gray-500">
                                            <span>Original Price</span>
                                            <span className="line-through">₹{actualTotal.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {productDiscount > 0 && (
                                        <div className="flex justify-between text-green-400 font-medium">
                                            <span>Product Discount</span>
                                            <span>-₹{productDiscount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Subtotal</span>
                                        <span className="font-medium text-white">₹{total.toFixed(2)}</span>
                                    </div>

                                    {/* Delivery Charge */}
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Delivery Charge ({cartItems.length} items × ₹80)</span>
                                        <span className="font-medium text-white">₹{(cartItems.length * 80).toFixed(2)}</span>
                                    </div>

                                    {/* Delivery Discount */}
                                    <div className="flex justify-between text-green-400 font-medium">
                                        <span>Delivery Discount</span>
                                        <span>-₹{(cartItems.length * 80).toFixed(2)}</span>
                                    </div>

                                    {/* Total Savings */}
                                    {(productDiscount > 0 || cartItems.length > 0) && (
                                        <div className="flex justify-between text-green-400 font-bold text-lg border-t border-gray-800 pt-3">
                                            <span>Total Savings</span>
                                            <span>₹{(productDiscount + (cartItems.length * 80)).toFixed(2)}</span>
                                        </div>
                                    )}

                                    <div className="border-t border-gray-800 pt-3 flex justify-between text-xl font-bold">
                                        <span className="text-white">Estimated Total</span>
                                        <span className="text-white">₹{total.toFixed(2)}</span>
                                    </div>

                                    <p className="text-xs text-gray-400 text-center pt-2">Apply coupon at checkout</p>
                                </div>

                                <button
                                    onClick={checkout}
                                    className="w-full bg-white text-black py-4 rounded-full hover:bg-gray-200 transition font-medium"
                                >
                                    Proceed to Checkout
                                </button>

                                <Link href="/products" className="block text-center mt-4 text-gray-400 hover:text-white">
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    )
}
