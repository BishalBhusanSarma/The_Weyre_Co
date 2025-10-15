'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function Profile() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteConfirmation, setDeleteConfirmation] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipcode: ''
    })
    const router = useRouter()

    useEffect(() => {
        checkUser()
    }, [])

    const checkUser = async () => {
        const userData = localStorage.getItem('user')
        if (!userData) {
            router.push('/login')
            return
        }

        const user = JSON.parse(userData)
        setUser(user)

        // Load user data from database
        const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

        if (data) {
            setFormData({
                name: data.name || '',
                email: data.email || '',
                phone: data.phone || '',
                address: data.address || '',
                city: data.city || '',
                state: data.state || '',
                zipcode: data.zipcode || ''
            })
        }
        setLoading(false)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage('')

        try {
            const { error } = await supabase
                .from('users')
                .update({
                    name: formData.name,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    zipcode: formData.zipcode
                })
                .eq('id', user.id)

            if (error) throw error

            // Update localStorage
            const updatedUser = { ...user, ...formData }
            localStorage.setItem('user', JSON.stringify(updatedUser))
            setUser(updatedUser)

            setMessage('Profile updated successfully!')
            setTimeout(() => setMessage(''), 3000)
        } catch (error) {
            console.error('Error updating profile:', error)
            setMessage('Error updating profile. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== 'DELETE') {
            setMessage('Please type DELETE to confirm account deletion')
            return
        }

        setSaving(true)
        setMessage('')

        try {
            // Delete user's data
            await supabase.from('wishlist').delete().eq('user_id', user.id)
            await supabase.from('cart').delete().eq('user_id', user.id)
            await supabase.from('order_items').delete().eq('order_id', user.id)
            await supabase.from('orders').delete().eq('user_id', user.id)

            // Delete user account
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', user.id)

            if (error) throw error

            // Clear localStorage and redirect
            localStorage.removeItem('user')
            setMessage('Account deleted successfully. Redirecting...')
            setTimeout(() => {
                router.push('/')
            }, 2000)
        } catch (error) {
            console.error('Error deleting account:', error)
            setMessage('Error deleting account. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black pt-16 md:pt-20">
                <Navbar />
                <div className="flex items-center justify-center h-96">
                    <p className="text-white">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black pt-16 md:pt-20">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 py-6 md:py-12">
                <div className="flex items-center justify-between mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-4xl font-bold text-white">My Profile</h1>
                    <Link
                        href="/products"
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm md:text-base"
                    >
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Shop
                    </Link>
                </div>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg ${message.includes('success') ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 md:p-6">
                    <div className="space-y-4 md:space-y-6">
                        {/* Name */}
                        <div>
                            <label className="block text-white font-medium mb-2 text-sm md:text-base">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 md:py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-sm md:text-base"
                            />
                        </div>

                        {/* Email (Read-only) */}
                        <div>
                            <label className="block text-white font-medium mb-2 text-sm md:text-base">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                disabled
                                className="w-full px-4 py-2 md:py-3 bg-gray-800 text-gray-500 border border-gray-700 rounded-lg cursor-not-allowed text-sm md:text-base"
                            />
                            <p className="text-xs md:text-sm text-gray-400 mt-1">Email cannot be changed</p>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-white font-medium mb-2 text-sm md:text-base">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-2 md:py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-sm md:text-base"
                            />
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-white font-medium mb-2 text-sm md:text-base">Street Address</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-2 md:py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-sm md:text-base"
                            />
                        </div>

                        {/* City, State, Zipcode */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-white font-medium mb-2 text-sm md:text-base">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 md:py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-sm md:text-base"
                                />
                            </div>
                            <div>
                                <label className="block text-white font-medium mb-2 text-sm md:text-base">State</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 md:py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-sm md:text-base"
                                />
                            </div>
                            <div>
                                <label className="block text-white font-medium mb-2 text-sm md:text-base">Zipcode</label>
                                <input
                                    type="text"
                                    name="zipcode"
                                    value={formData.zipcode}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 md:py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-sm md:text-base"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 bg-white text-black py-3 md:py-4 rounded-full hover:bg-gray-200 transition font-medium disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-sm md:text-base"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 border-2 border-white text-white py-3 md:py-4 rounded-full hover:bg-white hover:text-black transition font-medium text-sm md:text-base"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>

                {/* Delete Account Section */}
                <div className="mt-8 bg-red-900/20 border border-red-800 rounded-2xl p-4 md:p-6">
                    <h2 className="text-xl md:text-2xl font-bold mb-4 text-red-400">Danger Zone</h2>
                    <p className="text-gray-400 mb-4 text-sm md:text-base">
                        Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition font-medium text-sm md:text-base"
                    >
                        Delete Account
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
                    <div className="bg-gray-900 border border-red-800 rounded-2xl p-6 md:p-8 max-w-md w-full">
                        <h3 className="text-2xl font-bold mb-4 text-red-400">Delete Account</h3>
                        <p className="text-gray-300 mb-6">
                            This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                        </p>
                        <p className="text-white font-medium mb-4">
                            Please type <span className="text-red-400 font-bold">DELETE</span> to confirm:
                        </p>
                        <input
                            type="text"
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-6"
                            placeholder="Type DELETE"
                        />
                        <div className="flex gap-4">
                            <button
                                onClick={handleDeleteAccount}
                                disabled={saving || deleteConfirmation !== 'DELETE'}
                                className="flex-1 bg-red-600 text-white py-3 rounded-full hover:bg-red-700 transition font-medium disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Deleting...' : 'Delete Account'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false)
                                    setDeleteConfirmation('')
                                }}
                                className="flex-1 border-2 border-white text-white py-3 rounded-full hover:bg-white hover:text-black transition font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    )
}
