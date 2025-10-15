'use client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'

export default function AdminNavbar() {
    const router = useRouter()
    const pathname = usePathname()
    const [menuOpen, setMenuOpen] = useState(false)

    const handleLogout = () => {
        localStorage.removeItem('user')
        router.push('/login')
    }

    const isActive = (path: string) => {
        return pathname === path
    }

    const menuItems = [
        { href: '/admin/products', label: 'Products', icon: '📦' },
        { href: '/admin/categories', label: 'Categories', icon: '🏷️' },
        { href: '/admin/orders', label: 'Orders', icon: '📋' },
        { href: '/admin/coupons', label: 'Coupons', icon: '🎟️' },
        { href: '/admin/users', label: 'Users', icon: '👥' }
    ]

    return (
        <nav className="bg-black text-white sticky top-0 z-50 backdrop-blur-lg bg-opacity-95 border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/admin/dashboard" className="text-xl font-bold hover:text-gray-300 transition">
                        The Weyre Co. ADMIN
                    </Link>

                    {/* Hamburger Menu Button */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="p-2 rounded-lg hover:bg-gray-800 transition"
                        aria-label="Toggle menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {menuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Dropdown Menu */}
            {menuOpen && (
                <div className="absolute top-16 right-0 w-64 bg-gray-900 border border-gray-800 rounded-bl-2xl shadow-2xl">
                    <div className="py-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMenuOpen(false)}
                                className={`flex items-center gap-3 px-6 py-3 hover:bg-gray-800 transition ${isActive(item.href) ? 'bg-gray-800 border-l-4 border-white' : ''
                                    }`}
                            >
                                <span className="text-2xl">{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Overlay to close menu when clicking outside */}
            {menuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[-1]"
                    onClick={() => setMenuOpen(false)}
                ></div>
            )}
        </nav>
    )
}
