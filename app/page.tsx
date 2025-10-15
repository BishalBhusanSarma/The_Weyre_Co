'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import AddToCartPopup from '@/components/AddToCartPopup'
import ProductCard from '@/components/ProductCard'
import Footer from '@/components/Footer'
import LoginRequiredPopup from '@/components/LoginRequiredPopup'

export default function Home() {
    const [trendingProducts, setTrendingProducts] = useState<any[]>([])
    const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [displayedFeatured, setDisplayedFeatured] = useState(12)
    const [displayedTrending, setDisplayedTrending] = useState(12)
    const [currentSlide, setCurrentSlide] = useState(0)
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
        loadProducts()
        checkUser()
    }, [])

    useEffect(() => {
        if (trendingProducts.length > 0) {
            const interval = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % Math.min(trendingProducts.length, 5))
            }, 5000)
            return () => clearInterval(interval)
        }
    }, [trendingProducts])

    const loadProducts = async () => {
        const { data: trending } = await supabase
            .from('products')
            .select('*, categories(name)')
            .eq('is_trending', true)

        const { data: featured } = await supabase
            .from('products')
            .select('*, categories(name)')
            .eq('is_featured', true)

        const { data: cats } = await supabase
            .from('categories')
            .select('*')
            .order('name')

        if (trending) setTrendingProducts(trending)
        if (featured) setFeaturedProducts(featured)
        if (cats) setCategories(cats)
        setLoading(false)
    }

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

    const buyNow = async (productId: string, e: React.MouseEvent) => {
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

    const carouselProducts = trendingProducts.slice(0, 5)

    // Skeleton for carousel
    const CarouselSkeleton = () => (
        <div className="bg-black py-20">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-2 gap-12 items-center h-96">
                    <div className="h-full bg-gray-800 rounded-2xl animate-pulse" />
                    <div className="space-y-6">
                        <div className="h-6 bg-gray-800 rounded animate-pulse w-1/4" />
                        <div className="h-16 bg-gray-800 rounded animate-pulse w-3/4" />
                        <div className="h-4 bg-gray-800 rounded animate-pulse" />
                        <div className="h-12 bg-gray-800 rounded animate-pulse w-1/3" />
                    </div>
                </div>
            </div>
        </div>
    )

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

            {/* Trending Carousel */}
            {loading ? (
                <CarouselSkeleton />
            ) : carouselProducts.length > 0 && (
                <section className="bg-black text-white py-6 md:py-12 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="relative min-h-[300px] md:h-96">
                            {carouselProducts.map((product, index) => (
                                <div
                                    key={product.id}
                                    className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                        }`}
                                >
                                    {/* Mobile View - Image + Buy Now Button Only */}
                                    <div className="md:hidden h-full flex flex-col">
                                        <div className="relative flex-1 rounded-2xl overflow-hidden border-4 border-white">
                                            <Image
                                                src={product.image_url || '/placeholder.png'}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                            />
                                            {/* Trending Now Overlay */}
                                            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full">
                                                <p className="text-white font-bold text-sm tracking-wider">TRENDING NOW</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                buyNow(product.id, e);
                                            }}
                                            className="mt-4 w-full bg-white text-black px-6 py-3 rounded-full hover:bg-gray-200 transition font-bold text-base"
                                        >
                                            Buy Now
                                        </button>
                                    </div>

                                    {/* Desktop View - Full Details */}
                                    <Link
                                        href={`/products/${product.id}`}
                                        className="hidden md:block cursor-pointer h-full"
                                    >
                                        <div className="grid grid-cols-2 gap-12 items-center h-full p-8">
                                            <div className="relative h-full rounded-2xl overflow-hidden border-4 border-white">
                                                <Image
                                                    src={product.image_url || '/placeholder.png'}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-white mb-3">TRENDING NOW</p>
                                                <h2 className="text-5xl font-bold mb-4 line-clamp-2">{product.name}</h2>
                                                <p className="text-gray-300 mb-6 line-clamp-2">{product.description}</p>

                                                {/* Dual Pricing */}
                                                <div className="mb-8">
                                                    <div className="flex items-center gap-3">
                                                        <p className="text-4xl font-bold">₹{product.price}</p>
                                                        {product.actual_price && product.actual_price > product.price && (
                                                            <p className="text-2xl text-gray-500 line-through">₹{product.actual_price}</p>
                                                        )}
                                                    </div>
                                                    {product.actual_price && product.actual_price > product.price && (
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                                                Save ₹{(product.actual_price - product.price).toFixed(2)}!
                                                            </span>
                                                            <span className="text-green-400 font-bold">
                                                                {((product.actual_price - product.price) / product.actual_price * 100).toFixed(0)}% OFF
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={(e) => buyNow(product.id, e)}
                                                        className="bg-white text-black px-8 py-3 rounded-full hover:bg-gray-200 transition font-medium"
                                                    >
                                                        Buy Now
                                                    </button>
                                                    <button
                                                        onClick={(e) => addToCart(product, e)}
                                                        className="border-2 border-white px-8 py-3 rounded-full hover:bg-white hover:text-black transition font-medium"
                                                    >
                                                        Add to Cart
                                                    </button>
                                                    <button
                                                        onClick={(e) => addToWishlist(product, e)}
                                                        className="border border-white p-3 rounded-full hover:bg-white hover:text-black transition"
                                                    >
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center gap-2 mt-6 md:mt-8">
                            {carouselProducts.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`w-2 h-2 rounded-full transition ${index === currentSlide ? 'bg-white w-8' : 'bg-gray-600'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Shop by Category - Horizontal Scroll */}
            <section className="max-w-7xl mx-auto px-4 py-6 md:py-12">
                <h2 className="text-xl md:text-4xl font-bold mb-4 md:mb-8 text-center text-white">Shop by Category</h2>
                {loading ? (
                    <div className="flex gap-3 md:gap-6 overflow-x-auto pb-4 scrollbar-hide">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="flex-shrink-0 w-32 h-32 md:w-48 md:h-48 bg-gray-900 border border-gray-800 rounded-xl md:rounded-2xl animate-pulse"
                            />
                        ))}
                    </div>
                ) : categories.length > 0 ? (
                    <div className="flex gap-3 md:gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/products?category=${category.id}`}
                                className="group relative overflow-hidden rounded-xl md:rounded-2xl flex-shrink-0 w-32 h-32 md:w-48 md:h-48 bg-black border border-gray-800 hover:border-white transition-all duration-300 snap-start"
                            >
                                {/* Content */}
                                <div className="relative h-full flex flex-col items-center justify-center p-3 md:p-6 text-center">
                                    <h3 className="text-sm md:text-xl font-bold text-white mb-1 md:mb-2 transition-transform duration-300 group-hover:scale-110">
                                        {category.name}
                                    </h3>
                                    <div className="w-8 md:w-12 h-0.5 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : null}
            </section>

            {/* Trending Products - Show products after carousel (not in carousel) */}
            <section className="max-w-7xl mx-auto px-4 py-8 md:py-12">
                <h2 className="text-2xl md:text-4xl font-bold mb-8 md:mb-12 text-center text-white">Trending Now</h2>
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                        {[...Array(12)].map((_, i) => <ProductSkeleton key={i} />)}
                    </div>
                ) : trendingProducts.length > 5 ? (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                            {trendingProducts.slice(5, 5 + displayedTrending).map((product) => (
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

                        {trendingProducts.length > (5 + displayedTrending) && (
                            <div className="text-center mt-8">
                                <button
                                    onClick={() => setDisplayedTrending(prev => prev + 12)}
                                    className="bg-white text-black px-8 py-3 rounded-full hover:bg-gray-200 transition font-medium"
                                >
                                    Show More
                                </button>
                            </div>
                        )}
                    </>
                ) : null}
            </section>

            {/* Featured Products */}
            <section className="max-w-7xl mx-auto px-4 py-8 md:py-12">
                <h2 className="text-2xl md:text-4xl font-bold mb-8 md:mb-12 text-center text-white">Featured Collection</h2>
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                        {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                            {featuredProducts.slice(0, displayedFeatured).map((product) => (
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

                        {featuredProducts.length > displayedFeatured && (
                            <div className="text-center mt-8">
                                <button
                                    onClick={() => setDisplayedFeatured(prev => prev + 12)}
                                    className="bg-white text-black px-8 py-3 rounded-full hover:bg-gray-200 transition font-medium"
                                >
                                    Show More
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>

            <Footer />
        </div>
    )
}
