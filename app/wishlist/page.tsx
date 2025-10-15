'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import AddToCartPopup from '@/components/AddToCartPopup'
import ProductCard from '@/components/ProductCard'
import Footer from '@/components/Footer'
import LoginRequiredPopup from '@/components/LoginRequiredPopup'

export default function Wishlist() {
    const [wishlistItems, setWishlistItems] = useState<any[]>([])
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [showPopup, setShowPopup] = useState(false)
    const [popupType, setPopupType] = useState<'cart' | 'wishlist'>('cart')
    const [popupProduct, setPopupProduct] = useState<any>(null)
    const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set())
    const [cartIds, setCartIds] = useState<Set<string>>(new Set())
    const [showLoginPopup, setShowLoginPopup] = useState(false)
    const [loginMessage, setLoginMessage] = useState('')
    const router = useRouter()

    useEffect(() => {
        checkUser()
    }, [])

    useEffect(() => {
        if (user) {
            loadWishlist()
            loadCart(user.id)
        }
    }, [user])

    const checkUser = () => {
        const userData = localStorage.getItem('user')
        if (userData) {
            setUser(JSON.parse(userData))
        } else {
            router.push('/login')
        }
    }

    const loadWishlist = async () => {
        const { data } = await supabase
            .from('wishlist')
            .select('*, products(*, categories(name))')
            .eq('user_id', user.id)

        if (data) {
            setWishlistItems(data)
            setWishlistIds(new Set(data.map(item => item.product_id)))
        }
        setLoading(false)
    }

    const loadCart = async (userId: string) => {
        const { data } = await supabase
            .from('cart')
            .select('product_id')
            .eq('user_id', userId)

        if (data) {
            setCartIds(new Set(data.map(item => item.product_id)))
        }
    }

    const removeFromWishlist = async (product: any, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        await supabase
            .from('wishlist')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', product.id)

        setWishlistItems(prev => prev.filter(item => item.product_id !== product.id))
        setWishlistIds(prev => {
            const newSet = new Set(prev)
            newSet.delete(product.id)
            return newSet
        })
    }

    const addToWishlist = async (product: any, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        // Already in wishlist, do nothing
    }

    const addToCart = async (product: any, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        try {
            const { error } = await supabase
                .from('cart')
                .insert([{
                    user_id: user.id,
                    product_id: product.id,
                    quantity: 1
                }])

            if (!error || error.code === '23505') {
                setCartIds(prev => new Set(prev).add(product.id))
                setPopupProduct({ ...product, alreadyAdded: error?.code === '23505' })
                setPopupType('cart')
                setShowPopup(true)
            }
        } catch (err) {
            console.error('Cart error:', err)
        }
    }

    const buyNow = (productId: string, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!user) {
            setLoginMessage('buy this product')
            setShowLoginPopup(true)
            return
        }

        // Navigate to buy now page with default quantity
        localStorage.setItem(`buynow_quantity_${productId}`, '1')
        router.push(`/buynow/${productId}`)
    }

    // Skeleton for wishlist items
    const WishlistSkeleton = () => (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="aspect-square bg-gray-800 animate-pulse" />
            <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-800 rounded animate-pulse w-1/3" />
                <div className="h-6 bg-gray-800 rounded animate-pulse w-3/4" />
                <div className="h-8 bg-gray-800 rounded animate-pulse w-1/2" />
                <div className="flex gap-2">
                    <div className="flex-1 h-10 bg-gray-800 rounded-full animate-pulse" />
                    <div className="flex-1 h-10 bg-gray-800 rounded-full animate-pulse" />
                </div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-black pt-16 md:pt-20">
            <Navbar />

            <AddToCartPopup
                show={showPopup}
                onClose={() => setShowPopup(false)}
                type={popupType}
                product={popupProduct}
                alreadyAdded={popupProduct?.alreadyAdded}
            />

            <LoginRequiredPopup
                show={showLoginPopup}
                onClose={() => setShowLoginPopup(false)}
                message={loginMessage}
            />

            <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
                <Link href="/products" className="text-gray-400 hover:text-white mb-4 inline-block text-sm md:text-base">
                    ← Back to Shop
                </Link>
                <h1 className="text-2xl md:text-4xl font-bold mb-6 md:mb-8 text-white">My Wishlist</h1>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                        {[...Array(4)].map((_, i) => <WishlistSkeleton key={i} />)}
                    </div>
                ) : wishlistItems.length === 0 ? (
                    <div className="text-center py-20">
                        <svg className="w-24 h-24 mx-auto mb-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <h2 className="text-2xl font-bold mb-4 text-white">Your wishlist is empty</h2>
                        <p className="text-gray-400 mb-8">Start adding products you love!</p>
                        <Link href="/products" className="bg-white text-black px-8 py-3 rounded-full hover:bg-gray-200 transition font-medium inline-block">
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                        {wishlistItems.map((item) => (
                            <ProductCard
                                key={item.id}
                                product={item.products}
                                user={user}
                                isInWishlist={true}
                                isInCart={cartIds.has(item.products.id)}
                                onAddToWishlist={addToWishlist}
                                onAddToCart={addToCart}
                                onBuyNow={buyNow}
                                onRemoveFromWishlist={removeFromWishlist}
                                showRemoveButton={true}
                            />
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    )
}
