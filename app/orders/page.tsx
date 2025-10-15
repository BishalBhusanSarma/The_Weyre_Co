'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Toast from '@/components/Toast'
import Invoice from '@/components/Invoice'
import { canCancelOrder, getTimeRemaining } from '@/lib/orderUtils'

export default function Orders() {
    const [user, setUser] = useState<any>(null)
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [timeRemainingMap, setTimeRemainingMap] = useState<{ [key: string]: string }>({})
    const [showInvoice, setShowInvoice] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        checkUser()
    }, [])

    // Update timer every minute for cancel countdown
    useEffect(() => {
        const updateTimers = () => {
            const newTimeMap: { [key: string]: string } = {}
            orders.forEach(order => {
                if (canCancelOrder(order)) {
                    newTimeMap[order.id] = getTimeRemaining(order)
                }
            })
            setTimeRemainingMap(newTimeMap)
        }

        updateTimers()
        const interval = setInterval(updateTimers, 60000) // Update every minute

        return () => clearInterval(interval)
    }, [orders])

    const checkUser = async () => {
        const userData = localStorage.getItem('user')
        if (!userData) {
            router.push('/login')
            return
        }

        const user = JSON.parse(userData)
        setUser(user)
        await loadOrders(user.id)
    }

    const loadOrders = async (userId: string) => {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    *,
                    products (*)
                )
            `)
            .eq('user_id', userId)
            .eq('payment_status', 'paid')  // Only show paid orders
            .order('created_at', { ascending: false })

        if (data) {
            setOrders(data)
        }
        setLoading(false)
    }

    const canReportIssue = (order: any) => {
        if (order.delivery_status !== 'delivered' || !order.delivered_at) return false

        const deliveredDate = new Date(order.delivered_at)
        const now = new Date()
        const daysSinceDelivery = Math.floor((now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24))

        return daysSinceDelivery <= 7
    }

    const handleCancelOrder = async (order: any) => {
        if (!canCancelOrder(order)) {
            setToastMessage('Order cannot be cancelled')
            setShowToast(true)
            return
        }

        if (!confirm('Are you sure you want to cancel this order? Refund will be processed within 5-7 business days.')) {
            return
        }

        try {
            const { error } = await supabase
                .from('orders')
                .update({
                    delivery_status: 'return_refund',
                    payment_status: 'refunded'
                })
                .eq('id', order.id)

            if (error) throw error

            setToastMessage('Order cancelled successfully! Refund will be processed soon.')
            setShowToast(true)
            await loadOrders(user.id)
        } catch (error) {
            console.error('Error cancelling order:', error)
            setToastMessage('Failed to cancel order. Please try again.')
            setShowToast(true)
        }
    }

    const handleReportIssue = async (order: any) => {
        try {
            // Mark order as having an issue in database
            const { error } = await supabase
                .from('orders')
                .update({
                    has_issue: true,
                    issue_reported_at: new Date().toISOString()
                })
                .eq('id', order.id)

            if (error) {
                console.error('Error updating order:', error)
                setToastMessage('Failed to report issue. Please try again.')
                setShowToast(true)
                return
            }

            // Get order details for email
            const orderItems = order.order_items.map((item: any) =>
                `- ${item.products.name} (Qty: ${item.quantity})`
            ).join('\n')

            const subject = `Order Issue Report - Order ID: ${order.order_id}`
            const body = `Dear The Weyre Co. Team,

I am writing to report an issue with my recent order.

Order Details:
- Order ID: ${order.order_id}
- Order Date: ${new Date(order.created_at).toLocaleDateString()}
- Total Amount: ₹${order.total.toFixed(2)}

Products Ordered:
${orderItems}

Issue Description:
[Please describe your issue here]

IMPORTANT: 
- Please attach a video of the product unboxing (MANDATORY)
- You may also attach related pictures if available

Customer Details:
- Name: ${user.name}
- Email: ${user.email}
- Phone: ${user.phone || 'Not provided'}

Thank you for your assistance.

Best regards,
${user.name}`

            // Create Gmail compose URL (opens in new tab)
            const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=theweyreco.official@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

            // Open Gmail in new tab
            window.open(gmailUrl, '_blank')

            // Show success message
            setToastMessage('Gmail opened in new tab. Please attach video and send email.')
            setShowToast(true)

            // Reload orders to update UI
            await loadOrders(user.id)
        } catch (error) {
            console.error('Error reporting issue:', error)
            setToastMessage('Failed to report issue. Please try again.')
            setShowToast(true)
        }
    }

    const copyTrackingId = (trackingNumber: string) => {
        navigator.clipboard.writeText(trackingNumber)
        setToastMessage('Delivery ID copied! Paste it in the "Delhivery" app for status.')
        setShowToast(true)
    }

    const downloadInvoice = (orderId: string) => {
        setShowInvoice(orderId)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return 'text-green-400'
            case 'shipped': return 'text-blue-400'
            case 'pending': return 'text-yellow-400'
            case 'cancelled': return 'text-red-400'
            case 'return_refund': return 'text-purple-400'
            default: return 'text-gray-400'
        }
    }

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'text-green-400'
            case 'pending': return 'text-yellow-400'
            case 'failed': return 'text-red-400'
            case 'refunded': return 'text-blue-400'
            default: return 'text-gray-400'
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black">
                <Navbar />
                <div className="flex items-center justify-center h-96">
                    <p className="text-white">Loading orders...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black pt-16 md:pt-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
                <div className="flex items-center justify-between mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-4xl font-bold text-white">My Orders</h1>
                    <Link
                        href="/products"
                        className="text-gray-400 hover:text-white transition text-sm md:text-base"
                    >
                        Continue Shopping →
                    </Link>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-20">
                        <svg className="w-24 h-24 mx-auto text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <p className="text-xl text-gray-400 mb-4">No orders yet</p>
                        <Link href="/products" className="inline-block bg-white text-black px-6 py-3 rounded-full hover:bg-gray-200 transition">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4 md:space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 md:p-6">
                                {/* Order Header */}
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 pb-4 border-b border-gray-800">
                                    <div className="mb-3 md:mb-0">
                                        <p className="text-xs md:text-sm text-gray-400">Order ID</p>
                                        <p className="text-sm md:text-base text-white font-mono">{order.order_id}</p>
                                    </div>
                                    <div className="mb-3 md:mb-0">
                                        <p className="text-xs md:text-sm text-gray-400">Date</p>
                                        <p className="text-sm md:text-base text-white">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="mb-3 md:mb-0">
                                        <p className="text-xs md:text-sm text-gray-400">Total</p>
                                        <p className="text-lg md:text-xl font-bold text-white">₹{order.total.toFixed(2)}</p>
                                    </div>
                                    <div className="mb-3 md:mb-0">
                                        <p className="text-xs md:text-sm text-gray-400">Delivery Status</p>
                                        <p className={`text-sm md:text-base font-bold ${getStatusColor(order.delivery_status)}`}>
                                            {order.delivery_status === 'return_refund' ? 'Return/Refund' :
                                                order.delivery_status.charAt(0).toUpperCase() + order.delivery_status.slice(1)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs md:text-sm text-gray-400">Payment</p>
                                        <p className={`text-sm md:text-base font-bold ${getPaymentStatusColor(order.payment_status)}`}>
                                            {order.payment_status === 'refunded' ? 'Refunded' :
                                                order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                                        </p>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="space-y-3 mb-4">
                                    {order.order_items.map((item: any) => (
                                        <div key={item.id} className="flex gap-3 md:gap-4">
                                            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-800 rounded-lg overflow-hidden relative flex-shrink-0">
                                                <Image
                                                    src={item.products.image_url || '/placeholder.png'}
                                                    alt={item.products.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm md:text-base font-bold text-white line-clamp-1">{item.products.name}</h3>
                                                <p className="text-xs md:text-sm text-gray-400">Quantity: {item.quantity}</p>
                                                <p className="text-sm md:text-base font-bold text-white">₹{item.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    {/* Download Invoice Button - Show for paid orders */}
                                    {order.payment_status === 'paid' && (
                                        <button
                                            onClick={() => downloadInvoice(order.id)}
                                            className="w-full bg-blue-600 text-white py-2 md:py-3 rounded-full hover:bg-blue-700 transition font-medium text-sm md:text-base flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Download Invoice
                                        </button>
                                    )}

                                    {/* Main Action Button */}
                                    <div>
                                        {canCancelOrder(order) ? (
                                            <div>
                                                <button
                                                    onClick={() => handleCancelOrder(order)}
                                                    className="w-full bg-red-600 text-white py-2 md:py-3 rounded-full hover:bg-red-700 transition font-medium text-sm md:text-base"
                                                >
                                                    Cancel Order
                                                </button>
                                                {timeRemainingMap[order.id] && (
                                                    <p className="text-xs text-yellow-400 mt-1 text-center">
                                                        ⏱️ {timeRemainingMap[order.id]}
                                                    </p>
                                                )}
                                            </div>
                                        ) : canReportIssue(order) ? (
                                            <button
                                                onClick={() => handleReportIssue(order)}
                                                className="w-full bg-red-600 text-white py-2 md:py-3 rounded-full hover:bg-red-700 transition font-medium text-sm md:text-base"
                                            >
                                                Having an Issue?
                                            </button>
                                        ) : order.delivery_status === 'delivered' ? (
                                            <Link
                                                href="/products"
                                                className="block w-full bg-white text-black py-2 md:py-3 rounded-full hover:bg-gray-200 transition font-medium text-center text-sm md:text-base"
                                            >
                                                Buy More Products
                                            </Link>
                                        ) : (
                                            <div className="w-full bg-gray-800 text-gray-500 py-2 md:py-3 rounded-full text-center font-medium text-sm md:text-base cursor-not-allowed">
                                                {order.delivery_status === 'pending' && 'Order Processing'}
                                                {order.delivery_status === 'shipped' && 'Order Shipped'}
                                                {order.delivery_status === 'cancelled' && 'Order Cancelled'}
                                                {order.delivery_status === 'return_refund' && 'Return/Refund Processing'}
                                            </div>
                                        )}
                                    </div>

                                    {/* Tracking Number Section */}
                                    {order.tracking_number && (
                                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                                            <p className="text-xs text-gray-400 mb-1">Delhivery Tracking ID:</p>
                                            <div className="flex items-center gap-2">
                                                <code className="flex-1 text-white font-mono text-sm break-all">{order.tracking_number}</code>
                                                <button
                                                    onClick={() => copyTrackingId(order.tracking_number)}
                                                    className="bg-white text-black px-3 py-1 rounded hover:bg-gray-200 transition text-xs font-medium flex-shrink-0"
                                                    title="Copy tracking ID"
                                                >
                                                    Copy
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                📦 Paste this ID in Delhivery app to track
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showToast && (
                <Toast
                    message={toastMessage}
                    onClose={() => setShowToast(false)}
                />
            )}

            {/* Invoice Modal */}
            {showInvoice && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl">
                        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
                            <h2 className="text-xl font-bold text-black">Invoice</h2>
                            <button
                                onClick={() => setShowInvoice(null)}
                                className="text-gray-600 hover:text-black transition"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <Invoice
                            order={orders.find(o => o.id === showInvoice)}
                            user={user}
                        />
                    </div>
                </div>
            )}

            <Footer />
        </div>
    )
}
