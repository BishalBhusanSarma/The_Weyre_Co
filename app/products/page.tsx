'use client'
import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import AddToCartPopup from '@/components/AddToCartPopup'
import ProductCard from '@/components/ProductCard'
import Footer from '@/components/Footer'
import LoginRequiredPopup from '@/components/LoginRequiredPopup'

function ProductsContent() {
    const [products, setProducts] = useState<any[]>([])
    const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
    const [trendingProducts, setTrendingProducts] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [showPopup, setShowPopup] = useState(false)
    const [popupType, setPopupType] = useState<'cart' | 'wishlist'>('cart')
    const [popupProduct, setPopupProduct] = useState<any>(null)
    const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set())
    const [cartIds, setCartIds] = useState<Set<string>>(new Set())
    const [showLoginPopup, setShowLoginPopup] = useState(false)
    const [loginMessage, setLoginMessage] = useState('')
    const [displayedProducts, setDisplayedProducts] = useState(24)
    const [initialized, setInitialized] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const searchQuery = searchParams.get('search')
    const categoryParam = searchParams.get('category')

    // Initialize on mount
    useEffect(() => {
        loadCategories()
        checkUser()

        // Set initial category from URL
        if (categoryParam) {
            setSelectedCategory(categoryParam)
        }

        setInitialized(true)
    }, [])

    // Update category when URL changes (after initial mount)
    useEffect(() => {
        if (initialized) {
            if (categoryParam) {
                setSelectedCategory(categoryParam)
            } else {
                setSelectedCategory('')
            }
        }
    }, [categoryParam, initialized])

    // Load products when category or search changes (only after initialized)
    useEffect(() => {
        if (initialized) {
            loadProducts()
        }
    }, [selectedCategory, searchQuery, initialized])

    const checkUser = async () => {
        const userData = localStorage.getItem('user')
        if (userData) {
            const user = JSON.parse(userData)
            setUser(user)
            await loadWishlist(user.id)
            await loadCart(user.id)
        }
    }

    const loadWishlist = async (userId: string) => {
        const { data } = await supabase
            .from('wishlist')
            .select('product_id')
            .eq('user_id', userId)

        if (data) {
            setWishlistIds(new Set(data.map(item => item.product_id)))
        }
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

    const loadCategories = async () => {
        const { data } = await supabase.from('categories').select('*')
        if (data) setCategories(data)
    }

    const loadProducts = async () => {
        setLoading(true)
        setDisplayedProducts(24) // Reset to initial display count

        if (searchQuery) {
            // Search only in product names and categories
            const { data } = await supabase
                .from('products')
                .select('*, categories(name)')

            if (data) {
                const filtered = data.filter(p =>
                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.categories?.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                setProducts(filtered)

                // Load featured and trending for "no results" case
                if (filtered.length === 0) {
                    const { data: featured } = await supabase
                        .from('products')
                        .select('*, categories(name)')
                        .eq('is_featured', true)
                        .limit(8)
                    const { data: trending } = await supabase
                        .from('products')
                        .select('*, categories(name)')
                        .eq('is_trending', true)
                        .limit(8)
                    if (featured) setFeaturedProducts(featured)
                    if (trending) setTrendingProducts(trending)
                }
            }
            setLoading(false)
            return
        }

        // Apply category filter - load all products, we'll handle display limit in UI
        let query = supabase
            .from('products')
            .select('*, categories(name)')

        if (selectedCategory) {
            query = query.eq('category_id', selectedCategory)
        }

        const { data } = await query
        if (data) setProducts(data)
        setLoading(false)
    }

    const addToWishlist = async (product: any, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!user) {
            setLoginMessage('add to wishlist')
            setShowLoginPopup(true)
            return
        }

        const alreadyInWishlist = wishlistIds.has(product.id)

        try {
            const { error } = await supabase
                .from('wishlist')
                .insert([{ user_id: user.id, product_id: product.id }])

            if (!error || error.code === '23505') {
                setWishlistIds(prev => new Set(prev).add(product.id))
                setPopupProduct({ ...product, alreadyAdded: alreadyInWishlist })
                setPopupType('wishlist')
                setShowPopup(true)
            }
        } catch (err) {
            console.error('Wishlist error:', err)
        }
    }

    const addToCart = async (product: any, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!user) {
            setLoginMessage('add to cart')
            setShowLoginPopup(true)
            return
        }

        try {
            const { error } = await supabase
                .from('cart')
                .insert([{
                    user_id: user.id,
                    product_id: product.id,
                    quantity: 1
                }])

            // Check if it's a duplicate error (23505) or success
            if (!error || error.code === '23505') {
                setCartIds(prev => new Set(prev).add(product.id))
                setPopupProduct({ ...product, alreadyAdded: error?.code === '23505' })
                setPopupType('cart')
                setShowPopup(true)
            } else {
                console.error('Cart error:', error)
                alert('Failed to add to cart. Please try again.')
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

    // Skeleton for product cards
    const ProductSkeleton = () => (
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

            <div className="max-w-7xl mx-auto px-4 py-12">
                <h1 className="text-5xl font-bold mb-8 text-white">
                    {searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'}
                </h1>

                {/* Category Filter */}
                <div className="flex gap-4 mb-12 flex-wrap">
                    <button
                        onClick={() => {
                            setSelectedCategory('')
                            router.push('/products')
                        }}
                        className={`px-6 py-2 rounded-full transition ${!selectedCategory
                            ? 'bg-white text-black'
                            : 'border border-white text-white hover:bg-white hover:text-black'
                            }`}
                    >
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setSelectedCategory(cat.id)
                                router.push(`/products?category=${cat.id}`)
                            }}
                            className={`px-6 py-2 rounded-full transition ${selectedCategory === cat.id
                                ? 'bg-white text-black'
                                : 'border border-white text-white hover:bg-white hover:text-black'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                        {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
                    </div>
                ) : products.length === 0 ? (
                    <div>
                        <div className="text-center py-20">
                            <p className="text-2xl font-bold text-white mb-2">No products found</p>
                            <p className="text-gray-400">Try searching with different keywords</p>
                        </div>

                        {/* Show Featured Products */}
                        {featuredProducts.length > 0 && (
                            <section className="mt-12">
                                <h2 className="text-3xl font-bold mb-8 text-white">Featured Products</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                                    {featuredProducts.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            user={user}
                                            isInWishlist={wishlistIds.has(product.id)}
                                            isInCart={cartIds.has(product.id)}
                                            onAddToWishlist={addToWishlist}
                                            onAddToCart={addToCart}
                                            onBuyNow={buyNow}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Show Trending Products */}
                        {trendingProducts.length > 0 && (
                            <section className="mt-12">
                                <h2 className="text-3xl font-bold mb-8 text-white">Trending Now</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                                    {trendingProducts.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            user={user}
                                            isInWishlist={wishlistIds.has(product.id)}
                                            isInCart={cartIds.has(product.id)}
                                            onAddToWishlist={addToWishlist}
                                            onAddToCart={addToCart}
                                            onBuyNow={buyNow}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                            {products.slice(0, displayedProducts).map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    user={user}
                                    isInWishlist={wishlistIds.has(product.id)}
                                    isInCart={cartIds.has(product.id)}
                                    onAddToWishlist={addToWishlist}
                                    onAddToCart={addToCart}
                                    onBuyNow={buyNow}
                                />
                            ))}
                        </div>

                        {products.length > displayedProducts ? (
                            <div className="text-center mt-8">
                                <button
                                    onClick={() => setDisplayedProducts(prev => prev + 12)}
                                    className="bg-white text-black px-8 py-3 rounded-full hover:bg-gray-200 transition font-medium"
                                >
                                    Show More
                                </button>
                            </div>
                        ) : products.length > 24 && (
                            <div className="text-center mt-8">
                                <p className="text-gray-400 text-lg">No more products to load</p>
                            </div>
                        )}
                    </>
                )}
            </div>
            <Footer />
        </div>
    )
}

export default function Products() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black"><Navbar /><div className="max-w-7xl mx-auto px-4 py-16 text-center text-white">Loading...</div></div>}>
            <ProductsContent />
        </Suspense>
    )
}
