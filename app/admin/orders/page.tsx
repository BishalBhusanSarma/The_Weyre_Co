'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import AdminNavbar from '@/components/AdminNavbar'
import Invoice from '@/components/Invoice'

export default function AdminOrders() {
    const [orders, setOrders] = useState<any[]>([])
    const [filteredOrders, setFilteredOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState<string | null>(null)
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [showInvoice, setShowInvoice] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        loadOrders()
    }, [])

    useEffect(() => {
        filterOrders()
    }, [orders, statusFilter, searchQuery])

    const loadOrders = async () => {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                users (name, email, phone, address, city, state, zipcode),
                order_items (
                    *,
                    products (name, image_url, price)
                )
            `)
            .order('created_at', { ascending: false })

        if (data) {
            setOrders(data)
            setFilteredOrders(data)
        }
        setLoading(false)
    }

    const filterOrders = () => {
        let filtered = [...orders]

        // Filter by status
        if (statusFilter !== 'all') {
            if (statusFilter === 'having_issue') {
                // Show only orders where customer clicked "Having an Issue?"
                filtered = filtered.filter(order => order.has_issue === true)
            } else {
                filtered = filtered.filter(order => order.delivery_status === statusFilter)
            }
        }

        // Filter by search query (order ID)
        if (searchQuery.trim()) {
            filtered = filtered.filter(order =>
                order.id.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        setFilteredOrders(filtered)
    }

    const getOrderCount = (status: string) => {
        if (status === 'all') return orders.length
        if (status === 'having_issue') {
            return orders.filter(o => o.has_issue === true).length
        }
        return orders.filter(o => o.delivery_status === status).length
    }

    const updateOrderStatus = async (orderId: string, field: string, value: string) => {
        setUpdating(orderId)

        try {
            const updateData: any = { [field]: value }

            // If setting to delivered, set delivered_at timestamp
            if (field === 'delivery_status' && value === 'delivered') {
                updateData.delivered_at = new Date().toISOString()
            }

            const { error } = await supabase
                .from('orders')
                .update(updateData)
                .eq('id', orderId)

            if (error) throw error

            // Reload orders
            await loadOrders()
            alert('Order updated successfully!')
        } catch (error) {
            console.error('Error updating order:', error)
            alert('Failed to update order')
        } finally {
            setUpdating(null)
        }
    }

    const updateTrackingNumber = async (orderId: string, trackingNumber: string) => {
        setUpdating(orderId)

        try {
            const { error } = await supabase
                .from('orders')
                .update({ tracking_number: trackingNumber })
                .eq('id', orderId)

            if (error) throw error

            await loadOrders()
            alert('Tracking number updated!')
        } catch (error) {
            console.error('Error updating tracking:', error)
            alert('Failed to update tracking number')
        } finally {
            setUpdating(null)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        alert('Copied to clipboard!')
    }

    const downloadInvoice = (orderId: string) => {
        setShowInvoice(orderId)
    }

    const removeFromHavingIssue = async (orderId: string) => {
        if (!confirm('Remove this order from "Having Issue" list?')) {
            return
        }

        setUpdating(orderId)

        try {
            const { error } = await supabase
                .from('orders')
                .update({
                    has_issue: false,
                    issue_reported_at: null
                })
                .eq('id', orderId)

            if (error) throw error

            await loadOrders()
            alert('Order removed from having issue list!')
        } catch (error) {
            console.error('Error updating order:', error)
            alert('Failed to update order')
        } finally {
            setUpdating(null)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return 'bg-green-900 text-green-300'
            case 'shipped': return 'bg-blue-900 text-blue-300'
            case 'pending': return 'bg-yellow-900 text-yellow-300'
            case 'cancelled': return 'bg-red-900 text-red-300'
            case 'return_refund': return 'bg-purple-900 text-purple-300'
            default: return 'bg-gray-800 text-gray-300'
        }
    }

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-900 text-green-300'
            case 'pending': return 'bg-yellow-900 text-yellow-300'
            case 'failed': return 'bg-red-900 text-red-300'
            case 'refunded': return 'bg-blue-900 text-blue-300'
            default: return 'bg-gray-800 text-gray-300'
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <AdminNavbar />
                <div className="flex items-center justify-center h-96">
                    <p>Loading orders...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black">
            <AdminNavbar />

            <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Order Management</h1>
                    <p className="text-gray-400">View and manage all customer orders</p>
                </div>

                {/* Stats Card */}
                <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400 mb-1">Total Orders</p>
                            <h2 className="text-4xl font-bold text-white">{orders.length}</h2>
                        </div>
                        <div className="bg-orange-500/20 p-4 rounded-xl">
                            <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="mb-8 space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by Order ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-900 text-white border border-gray-800 rounded-lg px-4 py-3 pl-12 focus:outline-none focus:border-white transition"
                        />
                        <svg
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Status Filter Tabs */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition ${statusFilter === 'all'
                                ? 'bg-white text-black'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            All Orders ({getOrderCount('all')})
                        </button>
                        <button
                            onClick={() => setStatusFilter('pending')}
                            className={`px-4 py-2 rounded-lg font-medium transition ${statusFilter === 'pending'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 hover:bg-yellow-500/20'
                                }`}
                        >
                            Pending ({getOrderCount('pending')})
                        </button>
                        <button
                            onClick={() => setStatusFilter('shipped')}
                            className={`px-4 py-2 rounded-lg font-medium transition ${statusFilter === 'shipped'
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20'
                                }`}
                        >
                            Shipped ({getOrderCount('shipped')})
                        </button>
                        <button
                            onClick={() => setStatusFilter('delivered')}
                            className={`px-4 py-2 rounded-lg font-medium transition ${statusFilter === 'delivered'
                                ? 'bg-green-600 text-white'
                                : 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20'
                                }`}
                        >
                            Delivered ({getOrderCount('delivered')})
                        </button>
                        <button
                            onClick={() => setStatusFilter('cancelled')}
                            className={`px-4 py-2 rounded-lg font-medium transition ${statusFilter === 'cancelled'
                                ? 'bg-red-600 text-white'
                                : 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20'
                                }`}
                        >
                            Cancelled ({getOrderCount('cancelled')})
                        </button>
                        <button
                            onClick={() => setStatusFilter('return_refund')}
                            className={`px-4 py-2 rounded-lg font-medium transition ${statusFilter === 'return_refund'
                                ? 'bg-purple-600 text-white'
                                : 'bg-purple-500/10 text-purple-500 border border-purple-500/20 hover:bg-purple-500/20'
                                }`}
                        >
                            Return/Refund ({getOrderCount('return_refund')})
                        </button>
                        <button
                            onClick={() => setStatusFilter('having_issue')}
                            className={`px-4 py-2 rounded-lg font-medium transition ${statusFilter === 'having_issue'
                                ? 'bg-orange-600 text-white'
                                : 'bg-orange-500/10 text-orange-500 border border-orange-500/20 hover:bg-orange-500/20'
                                }`}
                        >
                            Having Issue ({getOrderCount('having_issue')})
                        </button>
                    </div>

                    {/* Results Count */}
                    <div className="text-sm text-gray-400">
                        Showing {filteredOrders.length} of {orders.length} orders
                        {searchQuery && ` matching "${searchQuery}"`}
                    </div>
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="text-center py-20">
                        <svg className="w-24 h-24 mx-auto text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-xl text-gray-400 mb-2">
                            {searchQuery ? 'No orders found matching your search' : 'No orders in this category'}
                        </p>
                        {(searchQuery || statusFilter !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchQuery('')
                                    setStatusFilter('all')
                                }}
                                className="text-blue-500 hover:text-blue-400 font-medium"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredOrders.map((order) => (
                            <div key={order.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                                {/* Order Header */}
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 pb-6 border-b border-gray-800">
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">Order ID</p>
                                        <p className="font-mono text-sm font-bold break-all text-white">{order.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">Customer</p>
                                        <p className="font-bold text-white">{order.users?.name}</p>
                                        <p className="text-sm text-gray-400">{order.users?.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">Date</p>
                                        <p className="font-bold text-white">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">Total</p>
                                        <p className="text-xl font-bold text-white">₹{order.total.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">Payment Status</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold capitalize ${getPaymentStatusColor(order.payment_status)}`}>
                                            {order.payment_status}
                                        </span>
                                    </div>
                                </div>

                                {/* Customer Address */}
                                <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                                    <p className="font-bold mb-2 text-white">Shipping Address:</p>
                                    <p className="text-sm text-gray-400">{order.users?.address}</p>
                                    <p className="text-sm text-gray-400">{order.users?.city}, {order.users?.state} {order.users?.zipcode}</p>
                                    <p className="text-sm text-gray-400">Phone: {order.users?.phone}</p>
                                </div>

                                {/* Order Items */}
                                <div className="mb-6">
                                    <p className="font-bold mb-3 text-white">Order Items:</p>
                                    <div className="space-y-3">
                                        {order.order_items.map((item: any) => (
                                            <div key={item.id} className="flex gap-4 items-center">
                                                <div className="w-16 h-16 bg-gray-800 rounded-lg overflow-hidden relative flex-shrink-0">
                                                    <Image
                                                        src={item.products.image_url || '/placeholder.png'}
                                                        alt={item.products.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-white">{item.products.name}</p>
                                                    <p className="text-sm text-gray-400">Qty: {item.quantity} × ₹{item.price}</p>
                                                </div>
                                                <p className="font-bold text-white">₹{(item.quantity * item.price).toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Status Management */}
                                <div className="space-y-4 mb-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block font-bold mb-2 text-white">Delivery Status</label>
                                            <select
                                                value={order.delivery_status}
                                                onChange={(e) => updateOrderStatus(order.id, 'delivery_status', e.target.value)}
                                                disabled={updating === order.id}
                                                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-white transition"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                                <option value="return_refund">Return/Refund</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block font-bold mb-2 text-white">Payment Status</label>
                                            <select
                                                value={order.payment_status}
                                                onChange={(e) => updateOrderStatus(order.id, 'payment_status', e.target.value)}
                                                disabled={updating === order.id}
                                                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-white transition"
                                            >
                                                <option value="paid">Paid</option>
                                                <option value="refunded">Refunded</option>
                                            </select>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Payment confirmed via gateway. Change to Refunded if order is returned.
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block font-bold mb-2 text-white">Delhivery Tracking ID</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={order.tracking_number || ''}
                                                onChange={(e) => {
                                                    const updatedOrders = orders.map(o =>
                                                        o.id === order.id ? { ...o, tracking_number: e.target.value } : o
                                                    )
                                                    setOrders(updatedOrders)
                                                }}
                                                placeholder="Enter Delhivery tracking ID"
                                                className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-white transition"
                                            />
                                            <button
                                                onClick={() => updateTrackingNumber(order.id, order.tracking_number || '')}
                                                disabled={updating === order.id}
                                                className="bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-200 transition font-medium whitespace-nowrap"
                                            >
                                                Save
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Customer can copy this ID to track on Delhivery app
                                        </p>
                                    </div>
                                </div>

                                {/* Delivery Info */}
                                {order.delivered_at && (
                                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                        <p className="font-bold text-green-500">
                                            Delivered on: {new Date(order.delivered_at).toLocaleString()}
                                        </p>
                                        <p className="text-sm text-green-400">
                                            Customer can report issues for 7 days from delivery date
                                        </p>
                                    </div>
                                )}

                                {/* Having Issue Alert */}
                                {order.has_issue && (
                                    <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-orange-500 mb-1">⚠️ Customer Reported Issue</p>
                                                <p className="text-sm text-orange-400">
                                                    Reported on: {new Date(order.issue_reported_at).toLocaleString()}
                                                </p>
                                                <p className="text-xs text-orange-300 mt-1">
                                                    Customer should have sent email with details and unboxing video
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => removeFromHavingIssue(order.id)}
                                                disabled={updating === order.id}
                                                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition font-medium text-sm whitespace-nowrap"
                                            >
                                                Mark as Resolved
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Download Invoice Button - Show for paid orders */}
                                {order.payment_status === 'paid' && (
                                    <div className="mt-4">
                                        <button
                                            onClick={() => downloadInvoice(order.id)}
                                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Download Invoice (PDF)
                                        </button>
                                    </div>
                                )}

                                {updating === order.id && (
                                    <div className="text-center py-2">
                                        <p className="text-sm text-gray-400">Updating...</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

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
                            user={orders.find(o => o.id === showInvoice)?.users}
                            isAdmin={true}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
