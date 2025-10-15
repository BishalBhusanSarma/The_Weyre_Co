'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
    const [user, setUser] = useState<any>(null)
    const [showProfile, setShowProfile] = useState(false)
    const [showCategories, setShowCategories] = useState(false)
    const [showMobileMenu, setShowMobileMenu] = useState(false)
    const [showMobileSearch, setShowMobileSearch] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [categories, setCategories] = useState<any[]>([])
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        checkUser()
        loadCategories()
    }, [])

    const loadCategories = async () => {
        const { data } = await supabase
            .from('categories')
            .select('*')
            .order('name')

        if (data) setCategories(data)
    }

    // Close profile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showProfile || showCategories) {
                const target = event.target as HTMLElement
                if (!target.closest('.profile-menu-container') && !target.closest('.categories-menu-container')) {
                    setShowProfile(false)
                    setShowCategories(false)
                }
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showProfile, showCategories])

    const checkUser = () => {
        const userData = localStorage.getItem('user')
        if (userData) setUser(JSON.parse(userData))
    }

    const logout = () => {
        localStorage.removeItem('user')
        setUser(null)
        setShowProfile(false)
        router.push('/')
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchQuery)}`)
            setShowMobileMenu(false)
            setShowMobileSearch(false)
        }
    }

    const isActive = (path: string) => pathname === path

    const handleLinkClick = () => {
        setShowMobileMenu(false)
        setShowMobileSearch(false)
    }

    return (
        <nav className="bg-black text-white fixed top-0 left-0 right-0 z-50 border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16 md:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center flex-shrink-0" onClick={handleLinkClick}>
                        <div className="relative w-16 h-16 md:w-[100px] md:h-[100px]">
                            <Image
                                src="/logo.png"
                                alt="The Weyre Co."
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-8">
                        <div className="flex gap-6">
                            <Link
                                href="/products/men"
                                className={`text-lg font-medium transition ${isActive('/products/men')
                                    ? 'text-white border-b-2 border-white pb-1'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Men
                            </Link>
                            <Link
                                href="/products/women"
                                className={`text-lg font-medium transition ${isActive('/products/women')
                                    ? 'text-white border-b-2 border-white pb-1'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Women
                            </Link>
                            <Link href="/products" className="text-lg font-medium text-gray-400 hover:text-white transition">
                                Products
                            </Link>
                        </div>
                    </div>

                    {/* Desktop Search */}
                    <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-900 text-white px-4 py-2 pl-10 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
                            />
                            <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </form>

                    {/* Desktop Icons */}
                    <div className="hidden lg:flex items-center gap-6 flex-shrink-0">
                        {user ? (
                            <>
                                <Link href="/wishlist" className="hover:text-gray-300 transition flex items-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </Link>
                                <Link href="/cart" className="hover:text-gray-300 transition flex items-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </Link>
                                <div className="relative flex items-center profile-menu-container">
                                    <button onClick={() => setShowProfile(!showProfile)} className="hover:text-gray-300 transition flex items-center">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </button>
                                    {showProfile && (
                                        <div className="fixed right-4 top-16 md:top-20 w-56 bg-white text-black rounded-lg shadow-xl border border-gray-200 z-50">
                                            <div className="p-3 border-b">
                                                <p className="font-medium truncate">{user.name}</p>
                                                <p className="text-sm text-gray-600 truncate">{user.email}</p>
                                            </div>
                                            <Link href="/profile" onClick={() => setShowProfile(false)} className="block px-4 py-2 hover:bg-gray-100">Profile</Link>
                                            <Link href="/orders" onClick={() => setShowProfile(false)} className="block px-4 py-2 hover:bg-gray-100">Orders</Link>
                                            <div className="relative categories-menu-container">
                                                <button
                                                    onClick={() => setShowCategories(!showCategories)}
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between"
                                                >
                                                    Shop by Categories
                                                    <svg className={`w-4 h-4 transition-transform ${showCategories ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                                {showCategories && (
                                                    <div className="bg-gray-50 border-t border-gray-200">
                                                        {categories.map((category) => (
                                                            <Link
                                                                key={category.id}
                                                                href={`/products?category=${category.id}`}
                                                                onClick={() => {
                                                                    setShowProfile(false)
                                                                    setShowCategories(false)
                                                                }}
                                                                className="block px-6 py-2 text-sm hover:bg-gray-200"
                                                            >
                                                                {category.name}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <Link href="/about" onClick={() => setShowProfile(false)} className="block px-4 py-2 hover:bg-gray-100">About Us</Link>
                                            <Link href="/privacy" onClick={() => setShowProfile(false)} className="block px-4 py-2 hover:bg-gray-100">Privacy Policy</Link>
                                            <button onClick={logout} className="w-full text-left px-4 py-2 hover:bg-gray-100 border-t">Logout</button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="hover:text-gray-300 transition">Login</Link>
                                <Link href="/register" className="bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Search & Hamburger Buttons */}
                    <div className="lg:hidden flex items-center gap-2">
                        <button
                            onClick={() => {
                                setShowMobileSearch(!showMobileSearch)
                                setShowMobileMenu(false)
                            }}
                            className="p-2 hover:bg-gray-900 rounded-lg transition"
                            aria-label="Toggle search"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => {
                                setShowMobileMenu(!showMobileMenu)
                                setShowMobileSearch(false)
                            }}
                            className="p-2 hover:bg-gray-900 rounded-lg transition"
                            aria-label="Toggle menu"
                        >
                            {showMobileMenu ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                {showMobileSearch && (
                    <div className="lg:hidden border-t border-gray-800 py-4">
                        <form onSubmit={handleSearch}>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-gray-900 text-white px-4 py-2 pl-10 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
                                    autoFocus
                                />
                                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </form>
                    </div>
                )}

                {/* Mobile Menu */}
                {showMobileMenu && (
                    <div className="lg:hidden border-t border-gray-800 py-4">

                        {/* Mobile Navigation Links */}
                        <div className="space-y-2">
                            <Link
                                href="/products/men"
                                onClick={handleLinkClick}
                                className={`block px-4 py-3 rounded-lg transition ${isActive('/products/men')
                                    ? 'bg-white text-black font-medium'
                                    : 'text-gray-300 hover:bg-gray-900'
                                    }`}
                            >
                                Men
                            </Link>
                            <Link
                                href="/products/women"
                                onClick={handleLinkClick}
                                className={`block px-4 py-3 rounded-lg transition ${isActive('/products/women')
                                    ? 'bg-white text-black font-medium'
                                    : 'text-gray-300 hover:bg-gray-900'
                                    }`}
                            >
                                Women
                            </Link>
                            <Link
                                href="/products"
                                onClick={handleLinkClick}
                                className={`block px-4 py-3 rounded-lg transition ${isActive('/products')
                                    ? 'bg-white text-black font-medium'
                                    : 'text-gray-300 hover:bg-gray-900'
                                    }`}
                            >
                                Products
                            </Link>

                            {user ? (
                                <>
                                    <Link
                                        href="/wishlist"
                                        onClick={handleLinkClick}
                                        className="block px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-900 transition"
                                    >
                                        Wishlist
                                    </Link>
                                    <Link
                                        href="/cart"
                                        onClick={handleLinkClick}
                                        className="block px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-900 transition"
                                    >
                                        Cart
                                    </Link>
                                    <Link
                                        href="/profile"
                                        onClick={handleLinkClick}
                                        className="block px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-900 transition"
                                    >
                                        Profile
                                    </Link>
                                    <Link
                                        href="/orders"
                                        onClick={handleLinkClick}
                                        className="block px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-900 transition"
                                    >
                                        Orders
                                    </Link>
                                    <div className="border-t border-gray-800 my-2 pt-2">
                                        <div className="px-4 py-2 text-sm">
                                            <p className="font-medium">{user.name}</p>
                                            <p className="text-gray-400 truncate">{user.email}</p>
                                        </div>
                                        <button
                                            onClick={() => { logout(); handleLinkClick(); }}
                                            className="w-full text-left px-4 py-3 rounded-lg text-red-400 hover:bg-gray-900 transition"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        onClick={handleLinkClick}
                                        className="block px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-900 transition"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/register"
                                        onClick={handleLinkClick}
                                        className="block px-4 py-3 rounded-lg bg-white text-black font-medium hover:bg-gray-200 transition text-center"
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
