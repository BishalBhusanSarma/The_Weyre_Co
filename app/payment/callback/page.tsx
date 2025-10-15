'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function PaymentCallback() {
    const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
    const [message, setMessage] = useState('')
    const router = useRouter()
    const searchParams = useSearchParams()
    const orderId = searchParams.get('order_id')

    useEffect(() => {
        verifyPayment()
    }, [])

    const verifyPayment = async () => {
        if (!orderId) {
            setStatus('failed')
            setMessage('Invalid order ID')
            return
        }

        try {
            const response = await fetch(`/api/cashfree/verify-payment?orderId=${orderId}`)
            const data = await response.json()

            if (data.order_status === 'PAID') {
                setStatus('success')
                setMessage('Payment successful! Your order has been confirmed.')
            } else if (data.order_status === 'ACTIVE') {
                setStatus('loading')
                setMessage('Payment is being processed...')
                // Retry after 2 seconds
                setTimeout(verifyPayment, 2000)
            } else {
                setStatus('failed')
                setMessage('Payment failed. Please try again.')
            }
        } catch (error) {
            console.error('Payment verification error:', error)
            setStatus('failed')
            setMessage('Error verifying payment. Please contact support.')
        }
    }

    return (
        <div className="min-h-screen bg-black">
            <Navbar />

            <div className="max-w-2xl mx-auto px-4 py-12 md:py-20">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 md:p-12 text-center">
                    {status === 'loading' && (
                        <>
                            <div className="w-20 h-20 mx-auto mb-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">Processing Payment...</h1>
                            <p className="text-gray-400">{message}</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="w-20 h-20 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">Payment Successful!</h1>
                            <p className="text-gray-400 mb-8">{message}</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/orders"
                                    className="bg-white text-black px-8 py-3 rounded-full hover:bg-gray-200 transition font-medium"
                                >
                                    View Orders
                                </Link>
                                <Link
                                    href="/products"
                                    className="border-2 border-white text-white px-8 py-3 rounded-full hover:bg-white hover:text-black transition font-medium"
                                >
                                    Continue Shopping
                                </Link>
                            </div>
                        </>
                    )}

                    {status === 'failed' && (
                        <>
                            <div className="w-20 h-20 mx-auto mb-6 bg-red-500 rounded-full flex items-center justify-center">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">Payment Failed</h1>
                            <p className="text-gray-400 mb-8">{message}</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/cart"
                                    className="bg-white text-black px-8 py-3 rounded-full hover:bg-gray-200 transition font-medium"
                                >
                                    Try Again
                                </Link>
                                <Link
                                    href="/products"
                                    className="border-2 border-white text-white px-8 py-3 rounded-full hover:bg-white hover:text-black transition font-medium"
                                >
                                    Continue Shopping
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
