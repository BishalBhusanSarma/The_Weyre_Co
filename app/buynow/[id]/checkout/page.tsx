'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { use } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { generateOrderId } from '@/lib/generateOrderId'

export default function BuyNowCheckout({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const [product, setProduct] = useState<any>(null)
    const [user, setUser] = useState<any>(null)
    const [quantity, setQuantity] = useState(1)
    const [loading, setLoading] = useState(true)
    const [couponCode, setCouponCode] = useState('')
    const [couponDiscount, setCouponDiscount] = useState(0)
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
    const [couponError, setCouponError] = useState('')
    const [cashfree, setCashfree] = useState<any>(null)
    const router = useRouter()

    const DELIVERY_CHARGE = 80

    useEffect(() => {
        checkUser()
        loadProduct()
        initializeCashfree()
        // Load quantity from localStorage
        const savedQuantity = localStorage.getItem(`buynow_quantity_${resolvedParams.id}`)
        if (savedQuantity) {
            setQuantity(parseInt(savedQuantity))
        }
    }, [resolvedParams.id])

    const initializeCashfree = async () => {
        try {
            const { load } = await import('@cashfreepayments/cashfree-js')
            const cashfreeInstance = await load({
                mode: 'sandbox' // Change to 'production' for live
            })
            setCashfree(cashfreeInstance)
        } catch (error) {
            console.error('Failed to load Cashfree SDK:', error)
        }
    }

    const checkUser = () => {
        const userData = localStorage.getItem('user')
        if (userData) {
            setUser(JSON.parse(userData))
        } else {
            router.push('/login')
        }
    }

    const loadProduct = async () => {
        const { data } = await supabase
            .from('products')
            .select('*, categories(name)')
            .eq('id', resolvedParams.id)
            .single()

        if (data) {
            setProduct(data)
        }
        setLoading(false)
    }

    const applyCoupon = async () => {
        setCouponError('')
        setCouponDiscount(0)
        setAppliedCoupon(null)

        if (!couponCode.trim()) {
            setCouponError('Please enter a coupon code')
            return
        }

        const subtotal = product.price * quantity

        try {
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

            if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
                setCouponError('Coupon has expired')
                return
            }

            if (coupon.min_purchase && subtotal < coupon.min_purchase) {
                setCouponError(`Minimum purchase of ₹${coupon.min_purchase} required`)
                return
            }

            if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
                setCouponError('Coupon usage limit reached')
                return
            }

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

            let discount = 0
            if (coupon.discount_type === 'percentage') {
                discount = (subtotal * coupon.discount_value) / 100
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

    const placeOrder = async () => {
        if (!user || !product) {
            alert('Please ensure you are logged in')
            return
        }

        // Check if Cashfree SDK is loaded
        if (!cashfree) {
            alert('Payment system is loading. Please wait a moment and try again.')
            return
        }

        try {
            const customOrderId = generateOrderId()

            const subtotal = product.price * quantity
            const actualPrice = (product.actual_price || product.price) * quantity
            const productDiscount = actualPrice - subtotal
            const finalTotal = subtotal - couponDiscount

            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert([{
                    order_id: customOrderId,
                    user_id: user.id,
                    total: finalTotal,
                    actual_total: actualPrice + DELIVERY_CHARGE,
                    discount_amount: productDiscount + couponDiscount + DELIVERY_CHARGE,
                    coupon_code: appliedCoupon?.code || null,
                    coupon_discount: couponDiscount,
                    delivery_charge: DELIVERY_CHARGE,
                    delivery_status: 'pending',
                    payment_status: 'pending',
                    shipping_address: `${user.address}, ${user.city}, ${user.state} ${user.zipcode}`
                }])
                .select()
                .single()

            if (orderError) {
                console.error('Order creation error:', orderError)
                throw new Error(`Failed to create order: ${orderError.message || JSON.stringify(orderError)}`)
            }

            const { error: itemError } = await supabase
                .from('order_items')
                .insert([{
                    order_id: order.id,
                    product_id: product.id,
                    quantity: quantity,
                    price: product.price
                }])

            if (itemError) throw itemError

            if (appliedCoupon) {
                await supabase
                    .from('coupon_usage')
                    .insert([{
                        coupon_id: appliedCoupon.id,
                        user_id: user.id,
                        order_id: order.id,
                        discount_amount: couponDiscount
                    }])

                await supabase
                    .from('coupons')
                    .update({ used_count: appliedCoupon.used_count + 1 })
                    .eq('id', appliedCoupon.id)
            }

            // Clean up localStorage
            localStorage.removeItem(`buynow_quantity_${resolvedParams.id}`)

            // Create Cashfree payment order
            const cashfreeResponse = await fetch('/api/cashfree/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: order.order_id,
                    orderAmount: finalTotal,
                    customerName: user.name,
                    customerEmail: user.email,
                    customerPhone: user.phone || '9999999999'
                })
            })

            if (!cashfreeResponse.ok) {
                const errorData = await cashfreeResponse.json()
                console.error('Cashfree API Error:', errorData)
                const errorMsg = errorData.message || errorData.details?.message || 'Unknown error'
                throw new Error(`Failed to create payment order: ${errorMsg}`)
            }

            const cashfreeData = await cashfreeResponse.json()

            if (!cashfreeData.payment_session_id) {
                throw new Error('No payment session ID received')
            }

            // Initialize Cashfree checkout
            if (!cashfree) {
                throw new Error('Cashfree SDK not loaded')
            }

            const checkoutOptions = {
                paymentSessionId: cashfreeData.payment_session_id,
                redirectTarget: '_self'
            }

            cashfree.checkout(checkoutOptions)
        } catch (error: any) {
            console.error('Order error:', error)
            const errorMessage = error?.message || error?.toString() || 'Unknown error occurred'
            alert(`Failed to place order: ${errorMessage}\n\nPlease try again or contact support.`)
        }
    }

    if (loading || !product) {
        return (
            <div className="min-h-screen bg-black pt-16 md:pt-20">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
                    <div className="mb-6 md:mb-8">
                        <div className="h-8 w-80 bg-gray-900 rounded-full mb-2 animate-pulse"></div>
                        <div className="h-10 w-64 bg-gray-900 rounded animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                        {/* Order Item Skeleton */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="h-8 w-48 bg-gray-900 rounded animate-pulse mb-4"></div>
                            <div className="flex gap-4 bg-gray-900 border border-gray-800 rounded-2xl p-4">
                                <div className="w-20 h-20 bg-gray-800 rounded-lg animate-pulse flex-shrink-0"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-6 bg-gray-800 rounded w-3/4 animate-pulse"></div>
                                    <div className="h-4 bg-gray-800 rounded w-1/4 animate-pulse"></div>
                                    <div className="h-5 bg-gray-800 rounded w-1/2 animate-pulse"></div>
                                </div>
                            </div>
                            {/* Billing Form Skeleton */}
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
                                <div className="h-8 bg-gray-800 rounded w-1/2 animate-pulse mb-4"></div>
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-12 bg-gray-800 rounded animate-pulse"></div>
                                ))}
                            </div>
                        </div>
                        {/* Payment Summary Skeleton */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
                                <div className="h-8 bg-gray-800 rounded w-3/4 animate-pulse"></div>
                                <div className="space-y-3">
                                    {[...Array(6)].map((_, i) => (
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

    const subtotal = product.price * quantity
    const actualPrice = (product.actual_price || product.price) * quantity
    const productDiscount = actualPrice - subtotal
    const finalTotal = subtotal - couponDiscount

    return (
        <div className="min-h-screen bg-black pt-16 md:pt-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
                <div className="mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-4xl font-bold text-white">Quick Checkout</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    {/* Order Items */}
                    <div className="lg:col-span-2 space-y-3 md:space-y-4">
                        <h2 className="text-xl md:text-2xl font-bold mb-4 text-white">Order Summary</h2>
                        <div className="flex gap-3 md:gap-4 bg-gray-900 border border-gray-800 rounded-2xl p-3 md:p-4">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-800 rounded-lg overflow-hidden relative flex-shrink-0">
                                <Image
                                    src={product.image_url || '/placeholder.png'}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-sm md:text-lg mb-1 text-white line-clamp-2">{product.name}</h3>
                                <p className="text-xs md:text-sm text-gray-400 mb-2">{product.categories?.name}</p>
                                <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                                    <p className="text-sm md:text-lg font-bold text-white">₹{product.price} x {quantity}</p>
                                    {product.actual_price && product.actual_price > product.price && (
                                        <span className="text-xs bg-green-900 text-green-300 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full font-bold">
                                            {(((product.actual_price - product.price) / product.actual_price) * 100).toFixed(0)}% OFF
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-base md:text-xl font-bold text-white">₹{(product.price * quantity).toFixed(2)}</p>
                                {product.actual_price && product.actual_price > product.price && (
                                    <p className="text-xs md:text-sm text-gray-500 line-through">₹{(product.actual_price * quantity).toFixed(2)}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 md:p-6 lg:sticky lg:top-24">
                            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white">Payment Details</h2>

                            <div className="space-y-3 mb-6">
                                {productDiscount > 0 && (
                                    <div className="flex justify-between text-gray-500">
                                        <span>Original Price</span>
                                        <span className="line-through">₹{actualPrice.toFixed(2)}</span>
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
                                    <span className="font-medium text-white">₹{subtotal.toFixed(2)}</span>
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

                                {couponDiscount > 0 && (
                                    <div className="flex justify-between text-green-400 font-medium">
                                        <span>Coupon Discount</span>
                                        <span>-₹{couponDiscount.toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between">
                                    <span className="text-gray-400">Delivery Charge</span>
                                    <span className="font-medium text-white">₹{DELIVERY_CHARGE.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between text-green-400 font-medium">
                                    <span>Delivery Discount</span>
                                    <span>-₹{DELIVERY_CHARGE.toFixed(2)}</span>
                                </div>

                                {(productDiscount > 0 || couponDiscount > 0 || DELIVERY_CHARGE > 0) && (
                                    <div className="flex justify-between text-green-400 font-bold text-lg border-t border-gray-800 pt-3">
                                        <span>Total Savings</span>
                                        <span>₹{(productDiscount + couponDiscount + DELIVERY_CHARGE).toFixed(2)}</span>
                                    </div>
                                )}

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

                            <button
                                onClick={placeOrder}
                                className="w-full bg-white text-black py-4 rounded-full hover:bg-gray-200 transition font-medium mb-3"
                            >
                                Proceed to Payment
                            </button>

                            <Link href={`/buynow/${product.id}`} className="block text-center text-gray-400 hover:text-white">
                                Back to Product Details
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
