'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { generateOrderId } from '@/lib/generateOrderId'

export default function Checkout() {
    const [cartItems, setCartItems] = useState<any[]>([])
    const [user, setUser] = useState<any>(null)
    const [total, setTotal] = useState(0)
    const [actualTotal, setActualTotal] = useState(0)
    const [productDiscount, setProductDiscount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [couponCode, setCouponCode] = useState('')
    const [couponDiscount, setCouponDiscount] = useState(0)
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
    const [couponError, setCouponError] = useState('')
    const [testMode, setTestMode] = useState(false) // For testing without payment

    const router = useRouter()

    const DELIVERY_CHARGE_PER_ITEM = 80 // ₹80 delivery charge per item

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
            setCartItems(data)
            calculateTotal(data)
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

    const applyCoupon = async () => {
        setCouponError('')
        setCouponDiscount(0)
        setAppliedCoupon(null)

        if (!couponCode.trim()) {
            setCouponError('Please enter a coupon code')
            return
        }

        try {
            // Fetch coupon
            const { data: coupon, error } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', couponCode.toUpperCase())
                .eq('is_active', true)
                .single()

            if (error || !coupon) {
                setCouponError('Invalid coupon code')
                return
            }

            // Check validity
            if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
                setCouponError('Coupon has expired')
                return
            }

            // Check minimum purchase
            if (coupon.min_purchase && total < coupon.min_purchase) {
                setCouponError(`Minimum purchase of ₹${coupon.min_purchase} required`)
                return
            }

            // Check usage limit
            if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
                setCouponError('Coupon usage limit reached')
                return
            }

            // Check if user already used this coupon
            const { data: usage } = await supabase
                .from('coupon_usage')
                .select('*')
                .eq('coupon_id', coupon.id)
                .eq('user_id', user.id)
                .single()

            if (usage) {
                setCouponError('You have already used this coupon')
                return
            }

            // Calculate discount
            let discount = 0
            if (coupon.discount_type === 'percentage') {
                discount = (total * coupon.discount_value) / 100
                if (coupon.max_discount && discount > coupon.max_discount) {
                    discount = coupon.max_discount
                }
            } else {
                discount = coupon.discount_value
            }

            setCouponDiscount(discount)
            setAppliedCoupon(coupon)
        } catch (err) {
            console.error('Coupon error:', err)
            setCouponError('Error applying coupon')
        }
    }

    const removeCoupon = () => {
        setCouponCode('')
        setCouponDiscount(0)
        setAppliedCoupon(null)
        setCouponError('')
    }

    // Calculate total delivery charge based on number of items
    const totalDeliveryCharge = cartItems.length * DELIVERY_CHARGE_PER_ITEM
    const finalTotal = total - couponDiscount // Delivery charge is discounted

    const placeOrder = async () => {
        if (!user || cartItems.length === 0) return

        try {
            // Generate custom order ID
            const customOrderId = generateOrderId()

            // Create order in database
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert([{
                    id: customOrderId,
                    user_id: user.id,
                    total: finalTotal,
                    actual_total: actualTotal + totalDeliveryCharge,
                    discount_amount: productDiscount + couponDiscount + totalDeliveryCharge,
                    coupon_code: appliedCoupon?.code || null,
                    coupon_discount: couponDiscount || 0,
                    delivery_charge: totalDeliveryCharge, // Save total delivery charge for admin tracking
                    rto_charge: 0,
                    delivery_status: 'pending',
                    payment_status: testMode ? 'paid' : 'pending',
                    shipping_address: `${user.address}, ${user.city}, ${user.state} ${user.zipcode}`
                }])
                .select()
                .single()

            if (orderError) throw orderError

            // Create order items from cart
            const orderItems = cartItems.map(item => ({
                order_id: order.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.products.price
            }))

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems)

            if (itemsError) throw itemsError

            // Record coupon usage if applied
            if (appliedCoupon) {
                await supabase
                    .from('coupon_usage')
                    .insert([{
                        coupon_id: appliedCoupon.id,
                        user_id: user.id,
                        order_id: order.id,
                        discount_amount: couponDiscount
                    }])

                // Increment coupon used count
                await supabase
                    .from('coupons')
                    .update({ used_count: appliedCoupon.used_count + 1 })
                    .eq('id', appliedCoupon.id)
            }

            // Clear cart after successful order
            await supabase
                .from('cart')
                .delete()
                .eq('user_id', user.id)

            // If test mode, redirect to orders page
            if (testMode) {
                alert('Test order placed successfully!')
                router.push('/orders')
                return
            }

            // Initiate Cashfree payment
            const cashfreeResponse = await fetch('/api/cashfree/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: order.id,
                    orderAmount: finalTotal,
                    customerName: user.name,
                    customerEmail: user.email,
                    customerPhone: user.phone || '9999999999'
                })
            })

            if (!cashfreeResponse.ok) {
                throw new Error('Failed to create payment order')
            }

            const cashfreeData = await cashfreeResponse.json()

            // Redirect to Cashfree payment page
            if (cashfreeData.payment_link) {
                window.location.href = cashfreeData.payment_link
            } else if (cashfreeData.payment_session_id) {
                window.location.href = cashfreeData.payment_session_id
            } else {
                throw new Error('No payment URL received')
            }
        } catch (error) {
            console.error('Order error:', error)
            alert('Failed to place order. Please try again.')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black pt-16 md:pt-20">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="mb-8">
                        <div className="h-8 w-64 bg-gray-900 rounded-full mb-2 animate-pulse"></div>
                        <div className="h-12 w-48 bg-gray-900 rounded animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                        {/* Order Items Skeleton */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="h-8 w-48 bg-gray-900 rounded animate-pulse mb-4"></div>
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex gap-4 bg-gray-900 border border-gray-800 rounded-2xl p-4">
                                    <div className="w-20 h-20 bg-gray-800 rounded-lg animate-pulse flex-shrink-0"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-6 bg-gray-800 rounded w-3/4 animate-pulse"></div>
                                        <div className="h-4 bg-gray-800 rounded w-1/4 animate-pulse"></div>
                                        <div className="h-5 bg-gray-800 rounded w-1/2 animate-pulse"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Payment Summary Skeleton */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
                                <div className="h-8 bg-gray-800 rounded w-3/4 animate-pulse"></div>
                                <div className="space-y-3">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="h-6 bg-gray-800 rounded animate-pulse"></div>
                                    ))}
                                </div>
                                <div className="h-12 bg-gray-800 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black pt-16 md:pt-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white">Checkout</h1>
                </div>

                {cartItems.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-xl text-gray-400 mb-4">Your cart is empty</p>
                        <Link href="/products" className="inline-block bg-white text-black px-6 py-3 rounded-full hover:bg-gray-200 transition">
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                        {/* Order Items */}
                        <div className="lg:col-span-2 space-y-3 md:space-y-4">
                            <h2 className="text-xl md:text-2xl font-bold mb-4 text-white">Order Summary</h2>
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex gap-3 md:gap-4 bg-gray-900 border border-gray-800 rounded-2xl p-3 md:p-4">
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-800 rounded-lg overflow-hidden relative flex-shrink-0">
                                        <Image
                                            src={item.products.image_url || '/placeholder.png'}
                                            alt={item.products.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-sm md:text-lg mb-1 text-white line-clamp-2">{item.products.name}</h3>
                                        <p className="text-xs md:text-sm text-gray-400 mb-2">{item.products.categories?.name}</p>
                                        <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                                            <p className="text-sm md:text-lg font-bold text-white">₹{item.products.price} x {item.quantity}</p>
                                            {item.products.actual_price && item.products.actual_price > item.products.price && (
                                                <span className="text-xs bg-green-900 text-green-300 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full font-bold">
                                                    {(((item.products.actual_price - item.products.price) / item.products.actual_price) * 100).toFixed(0)}% OFF
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-base md:text-xl font-bold text-white">₹{(item.products.price * item.quantity).toFixed(2)}</p>
                                        {item.products.actual_price && item.products.actual_price > item.products.price && (
                                            <p className="text-xs md:text-sm text-gray-500 line-through">₹{(item.products.actual_price * item.quantity).toFixed(2)}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Payment Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 md:p-6 lg:sticky lg:top-24">
                                <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white">Payment Details</h2>

                                <div className="space-y-3 mb-6">
                                    {/* Original Price */}
                                    {productDiscount > 0 && (
                                        <div className="flex justify-between text-gray-500">
                                            <span>Original Price</span>
                                            <span className="line-through">₹{actualTotal.toFixed(2)}</span>
                                        </div>
                                    )}

                                    {/* Product Discount */}
                                    {productDiscount > 0 && (
                                        <div className="flex justify-between text-green-400 font-medium">
                                            <span>Product Discount</span>
                                            <span>-₹{productDiscount.toFixed(2)}</span>
                                        </div>
                                    )}

                                    {/* Subtotal */}
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Subtotal</span>
                                        <span className="font-medium text-white">₹{total.toFixed(2)}</span>
                                    </div>

                                    {/* Coupon Section */}
                                    <div className="border-t border-gray-800 pt-3">
                                        <label className="block text-sm font-medium mb-2 text-white">Have a coupon?</label>
                                        {!appliedCoupon ? (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={couponCode}
                                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                    placeholder="Enter code"
                                                    className="flex-1 px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-sm"
                                                />
                                                <button
                                                    onClick={applyCoupon}
                                                    className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between bg-green-900 border border-green-700 rounded-lg p-3">
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span className="text-sm font-medium text-green-300">{appliedCoupon.code}</span>
                                                </div>
                                                <button
                                                    onClick={removeCoupon}
                                                    className="text-red-400 hover:text-red-300 text-sm"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        )}
                                        {couponError && (
                                            <p className="text-red-400 text-sm mt-2">{couponError}</p>
                                        )}
                                    </div>

                                    {/* Coupon Discount */}
                                    {couponDiscount > 0 && (
                                        <div className="flex justify-between text-green-400 font-medium">
                                            <span>Coupon Discount</span>
                                            <span>-₹{couponDiscount.toFixed(2)}</span>
                                        </div>
                                    )}

                                    {/* Delivery Charge */}
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Delivery Charge ({cartItems.length} items × ₹80)</span>
                                        <span className="font-medium text-white">₹{totalDeliveryCharge.toFixed(2)}</span>
                                    </div>

                                    {/* Delivery Discount */}
                                    <div className="flex justify-between text-green-400 font-medium">
                                        <span>Delivery Discount</span>
                                        <span>-₹{totalDeliveryCharge.toFixed(2)}</span>
                                    </div>

                                    {/* Total Savings */}
                                    {(productDiscount > 0 || couponDiscount > 0 || totalDeliveryCharge > 0) && (
                                        <div className="flex justify-between text-green-400 font-bold text-lg border-t border-gray-800 pt-3">
                                            <span>Total Savings</span>
                                            <span>₹{(productDiscount + couponDiscount + totalDeliveryCharge).toFixed(2)}</span>
                                        </div>
                                    )}

                                    {/* Final Total */}
                                    <div className="border-t border-gray-800 pt-3 flex justify-between text-xl font-bold">
                                        <span className="text-white">Total</span>
                                        <span className="text-white">₹{finalTotal.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h3 className="font-bold mb-3 text-white">Shipping Address</h3>
                                    <div className="text-sm text-gray-400">
                                        <p>{user?.name}</p>
                                        <p>{user?.address}</p>
                                        <p>{user?.city}, {user?.state} {user?.zipcode}</p>
                                        <p>{user?.phone}</p>
                                    </div>
                                </div>

                                {/* Test Mode Toggle */}
                                <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-500/20 rounded-lg">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={testMode}
                                            onChange={(e) => setTestMode(e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm text-yellow-400">Test Mode (Skip Payment)</span>
                                    </label>
                                </div>

                                <button
                                    onClick={placeOrder}
                                    className="w-full bg-white text-black py-4 rounded-full hover:bg-gray-200 transition font-medium mb-3"
                                >
                                    {testMode ? 'Place Test Order' : 'Proceed to Payment'}
                                </button>

                                <Link href="/cart" className="block text-center text-gray-400 hover:text-white">
                                    Back to Cart
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
