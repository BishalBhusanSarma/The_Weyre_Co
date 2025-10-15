'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { use } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function BuyNow({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const [product, setProduct] = useState<any>(null)
    const [user, setUser] = useState<any>(null)
    const [quantity, setQuantity] = useState(1)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const DELIVERY_CHARGE = 80

    useEffect(() => {
        // Clear any old checkout data to prevent conflicts
        localStorage.removeItem('buynow_checkout')

        checkUser()
        loadProduct()
        // Load quantity from localStorage if available
        const savedQuantity = localStorage.getItem(`buynow_quantity_${resolvedParams.id}`)
        if (savedQuantity) {
            setQuantity(parseInt(savedQuantity))
            // Clean up after reading
            localStorage.removeItem(`buynow_quantity_${resolvedParams.id}`)
        }
    }, [resolvedParams.id])

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

    if (loading || !product) {
        return (
            <div className="min-h-screen bg-black">
                <Navbar />
                <div className="flex items-center justify-center h-96">
                    <p className="text-white">Loading...</p>
                </div>
            </div>
        )
    }

    // Calculate amounts for display
    const subtotal = product.price * quantity
    const actualPrice = (product.actual_price || product.price) * quantity
    const productDiscount = actualPrice - subtotal

    return (
        <div className="min-h-screen bg-black pt-16 md:pt-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
                <div className="mb-6 md:mb-8">
                    <div className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-2">
                        BUY NOW MODE - Single Product Only
                    </div>
                    <h1 className="text-2xl md:text-4xl font-bold text-white">Buy Now - Quick Checkout</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    {/* Product Info */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 md:p-6">
                            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white">Order Details</h2>
                            <div className="flex gap-3 md:gap-6">
                                <div className="w-20 h-20 md:w-32 md:h-32 bg-gray-800 rounded-lg overflow-hidden relative flex-shrink-0">
                                    <Image
                                        src={product.image_url || '/placeholder.png'}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-base md:text-xl mb-1 md:mb-2 text-white line-clamp-2">{product.name}</h3>
                                    <p className="text-xs md:text-sm text-gray-400 mb-2 md:mb-3">{product.categories?.name}</p>
                                    <div className="mb-3 md:mb-4">
                                        <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                                            <p className="text-lg md:text-2xl font-bold text-white">₹{product.price}</p>
                                            {product.actual_price && product.actual_price > product.price && (
                                                <>
                                                    <p className="text-sm md:text-lg text-gray-500 line-through">₹{product.actual_price}</p>
                                                    <span className="text-xs bg-green-900 text-green-300 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full font-bold">
                                                        {(((product.actual_price - product.price) / product.actual_price) * 100).toFixed(0)}% OFF
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 md:gap-4">
                                        <label className="font-medium text-white text-sm md:text-base">Quantity:</label>
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="w-7 h-7 md:w-8 md:h-8 text-sm md:text-base border border-white text-white rounded-full hover:bg-white hover:text-black transition"
                                            >
                                                -
                                            </button>
                                            <span className="text-base md:text-lg font-medium w-6 md:w-8 text-center text-white">{quantity}</span>
                                            <button
                                                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                                className="w-7 h-7 md:w-8 md:h-8 text-sm md:text-base border border-white text-white rounded-full hover:bg-white hover:text-black transition"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 md:p-6 lg:sticky lg:top-24">
                            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white">Order Summary</h2>

                            <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
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

                                <div className="flex justify-between">
                                    <span className="text-gray-400">Delivery Charge</span>
                                    <span className="font-medium text-white">₹{DELIVERY_CHARGE.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between text-green-400 font-medium">
                                    <span>Delivery Discount</span>
                                    <span>-₹{DELIVERY_CHARGE.toFixed(2)}</span>
                                </div>

                                {(productDiscount > 0 || DELIVERY_CHARGE > 0) && (
                                    <div className="flex justify-between text-green-400 font-bold text-lg border-t border-gray-800 pt-3">
                                        <span>Total Savings</span>
                                        <span>₹{(productDiscount + DELIVERY_CHARGE).toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="border-t border-gray-800 pt-3 flex justify-between text-xl font-bold">
                                    <span className="text-white">Estimated Total</span>
                                    <span className="text-white">₹{subtotal.toFixed(2)}</span>
                                </div>
                                <p className="text-xs text-gray-400 text-center">Apply coupon at checkout</p>
                            </div>

                            <button
                                onClick={() => {
                                    // Save quantity and navigate to checkout
                                    localStorage.setItem(`buynow_quantity_${product.id}`, quantity.toString())
                                    router.push(`/buynow/${product.id}/checkout`)
                                }}
                                className="w-full bg-white text-black py-3 md:py-4 rounded-full hover:bg-gray-200 transition font-medium mb-2 md:mb-3 text-sm md:text-base"
                            >
                                Proceed to Checkout
                            </button>

                            <Link href={`/products/${product.id}`} className="block text-center text-gray-400 hover:text-white text-sm md:text-base">
                                Back to Product
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
