'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AdminNavbar from '@/components/AdminNavbar'

interface User {
    id: string
    email: string
    name: string
    phone: string | null
    address: string
    city: string
    state: string
    zipcode: string
    created_at: string
}

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setUsers(data || [])
        } catch (error) {
            console.error('Error loading users:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone?.includes(searchQuery)
    )

    const UserSkeleton = () => (
        <tr className="border-b border-gray-800">
            <td className="px-6 py-4"><div className="h-4 bg-gray-800 rounded w-3/4 animate-pulse"></div></td>
            <td className="px-6 py-4"><div className="h-4 bg-gray-800 rounded w-1/2 animate-pulse"></div></td>
            <td className="px-6 py-4"><div className="h-4 bg-gray-800 rounded w-1/3 animate-pulse"></div></td>
            <td className="px-6 py-4"><div className="h-4 bg-gray-800 rounded w-2/3 animate-pulse"></div></td>
            <td className="px-6 py-4"><div className="h-4 bg-gray-800 rounded w-1/2 animate-pulse"></div></td>
        </tr>
    )

    return (
        <div className="min-h-screen bg-black">
            <AdminNavbar />

            <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Users Management</h1>
                    <p className="text-gray-400">View and manage all registered users</p>
                </div>

                {/* Stats Card */}
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400 mb-1">Total Users</p>
                            <h2 className="text-4xl font-bold text-white">{users.length}</h2>
                        </div>
                        <div className="bg-blue-500/20 p-4 rounded-xl">
                            <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by email, name, or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-900 text-white border border-gray-800 rounded-lg px-4 py-3 pl-12 focus:outline-none focus:border-white transition"
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-800">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Email</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Phone</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Location</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <>
                                        {[...Array(5)].map((_, i) => <UserSkeleton key={i} />)}
                                    </>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="text-gray-400">
                                                <svg className="w-16 h-16 mx-auto mb-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                <p className="text-lg font-medium">No users found</p>
                                                <p className="text-sm mt-1">
                                                    {searchQuery ? 'Try a different search term' : 'No users registered yet'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                                            <td className="px-6 py-4 text-white">{user.email}</td>
                                            <td className="px-6 py-4 text-white">{user.name}</td>
                                            <td className="px-6 py-4 text-gray-400">{user.phone || 'N/A'}</td>
                                            <td className="px-6 py-4 text-gray-400">{user.city}, {user.state}</td>
                                            <td className="px-6 py-4 text-gray-400">
                                                {new Date(user.created_at).toLocaleDateString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Results Count */}
                {!loading && filteredUsers.length > 0 && (
                    <div className="mt-4 text-center text-gray-400 text-sm">
                        Showing {filteredUsers.length} of {users.length} users
                    </div>
                )}
            </div>
        </div>
    )
}
