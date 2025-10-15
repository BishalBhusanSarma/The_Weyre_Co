'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AdminNavbar from '@/components/AdminNavbar'

export default function AdminCoupons() {
    const [coupons, setCoupons] = useState<any[]>([])
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        min_purchase: '',
        max_discount: '',
        usage_limit: '',
        valid_until: ''
    })

    useEffect(() => {
        loadCoupons()
    }, [])

    const loadCoupons = async () => {
        const { data } = await supabase
            .from('coupons')
            .select('*')
            .order('created_at', { ascending: false })
        if (data) setCoupons(data)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const couponData = {
            ...formData,
            discount_value: parseFloat(formData.discount_value),
            min_purchase: formData.min_purchase ? parseFloat(formData.min_purchase) : 0,
            max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
            usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
            valid_until: formData.valid_until || null
        }

        let error
        if (editingId) {
            const result = await supabase
                .from('coupons')
                .update(couponData)
                .eq('id', editingId)
            error = result.error
        } else {
            const result = await supabase.from('coupons').insert([couponData])
            error = result.error
        }

        if (!error) {
            alert(editingId ? 'Coupon updated!' : 'Coupon created!')
            resetForm()
            loadCoupons()
        } else {
            alert('Error: ' + error.message)
        }
    }

    const resetForm = () => {
        setShowForm(false)
        setEditingId(null)
        setFormData({
            code: '',
            discount_type: 'percentage',
            discount_value: '',
            min_purchase: '',
            max_discount: '',
            usage_limit: '',
            valid_until: ''
        })
    }

    const editCoupon = (coupon: any) => {
        setFormData({
            code: coupon.code,
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value.toString(),
            min_purchase: coupon.min_purchase?.toString() || '',
            max_discount: coupon.max_discount?.toString() || '',
            usage_limit: coupon.usage_limit?.toString() || '',
            valid_until: coupon.valid_until ? new Date(coupon.valid_until).toISOString().split('T')[0] : ''
        })
        setEditingId(coupon.id)
        setShowForm(true)
    }

    const deleteCoupon = async (id: string) => {
        if (confirm('Delete this coupon?')) {
            await supabase.from('coupons').delete().eq('id', id)
            loadCoupons()
        }
    }

    const toggleActive = async (id: string, currentStatus: boolean) => {
        await supabase
            .from('coupons')
            .update({ is_active: !currentStatus })
            .eq('id', id)
        loadCoupons()
    }

    return (
        <div className="min-h-screen bg-black">
            <AdminNavbar />
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Coupons Management</h1>
                        <p className="text-gray-400">Create and manage discount coupons</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-200 transition font-medium flex items-center gap-2"
                    >
                        {showForm ? (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Cancel
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create Coupon
                            </>
                        )}
                    </button>
                </div>

                {/* Stats Card */}
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400 mb-1">Total Coupons</p>
                            <h2 className="text-4xl font-bold text-white">{coupons.length}</h2>
                        </div>
                        <div className="bg-green-500/20 p-4 rounded-xl">
                            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {showForm && (
                <div className="max-w-7xl mx-auto px-4 mb-8">
                    <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
                        <h2 className="text-2xl font-bold text-white">{editingId ? 'Edit' : 'Create'} Coupon</h2>

                        <input
                            type="text"
                            placeholder="Coupon Code (e.g., SAVE20)"
                            required
                            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-white transition uppercase"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select
                                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-white transition"
                                value={formData.discount_type}
                                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (₹)</option>
                            </select>

                            <input
                                type="number"
                                step="0.01"
                                placeholder={formData.discount_type === 'percentage' ? 'Discount % (e.g., 10)' : 'Discount ₹ (e.g., 20)'}
                                required
                                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-white transition"
                                value={formData.discount_value}
                                onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Min Purchase Amount (optional)"
                                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-white transition"
                                value={formData.min_purchase}
                                onChange={(e) => setFormData({ ...formData, min_purchase: e.target.value })}
                            />

                            <input
                                type="number"
                                step="0.01"
                                placeholder="Max Discount Amount (optional)"
                                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-white transition"
                                value={formData.max_discount}
                                onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="number"
                                placeholder="Usage Limit (optional)"
                                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-white transition"
                                value={formData.usage_limit}
                                onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                            />

                            <input
                                type="date"
                                placeholder="Valid Until (optional)"
                                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-white transition"
                                value={formData.valid_until}
                                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                            />
                        </div>

                        <button type="submit" className="w-full bg-white text-black py-3 rounded-lg hover:bg-gray-200 transition font-medium">
                            {editingId ? 'Update' : 'Create'} Coupon
                        </button>
                    </form>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-800">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Code</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Type</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Value</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Min Purchase</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Usage</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Valid Until</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coupons.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center">
                                            <div className="text-gray-400">
                                                <svg className="w-16 h-16 mx-auto mb-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                                </svg>
                                                <p className="text-lg font-medium">No coupons yet</p>
                                                <p className="text-sm mt-1">Create your first coupon to get started</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    coupons.map((coupon) => (
                                        <tr key={coupon.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                                            <td className="px-6 py-4 font-bold text-white">{coupon.code}</td>
                                            <td className="px-6 py-4 text-gray-400 capitalize">{coupon.discount_type}</td>
                                            <td className="px-6 py-4 text-white">
                                                {coupon.discount_type === 'percentage'
                                                    ? `${coupon.discount_value}%`
                                                    : `₹${coupon.discount_value}`}
                                            </td>
                                            <td className="px-6 py-4 text-gray-400">₹{coupon.min_purchase || 0}</td>
                                            <td className="px-6 py-4 text-gray-400">
                                                {coupon.used_count || 0}
                                                {coupon.usage_limit ? ` / ${coupon.usage_limit}` : ' / ∞'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-400">
                                                {coupon.valid_until
                                                    ? new Date(coupon.valid_until).toLocaleDateString('en-IN', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })
                                                    : 'No expiry'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => toggleActive(coupon.id, coupon.is_active)}
                                                    className={`px-3 py-1 rounded-full text-sm font-bold ${coupon.is_active
                                                        ? 'bg-green-500/20 text-green-500 border border-green-500/20'
                                                        : 'bg-red-500/20 text-red-500 border border-red-500/20'
                                                        }`}
                                                >
                                                    {coupon.is_active ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => editCoupon(coupon)}
                                                        className="px-3 py-1 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => deleteCoupon(coupon.id)}
                                                        className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
