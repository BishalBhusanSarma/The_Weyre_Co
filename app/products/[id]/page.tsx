'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { use } from 'react'
import Navbar from '@/components/Navbar'
import AddToCartPopup from '@/components/AddToCartPopup'
import ProductCard from '@/components/ProductCard'
import Footer from '@/components/Footer'
import LoginRequiredPopup from '@/components/LoginRequiredPopup'

export default function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const [product, setProduct] = useState<any>(null)
    const [relatedProducts, setRelatedProducts] = useState<any[]>([])
    const [user, setUser] = useState<any>(null)
    const [quantity, setQuantity] = useState(1)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [images, setImages] = useState<string[]>([])
    const [showPopup, setShowPopup] = useState(false)
    const [popupType, setPopupType] = useState<'cart' | 'wishlist'>('cart')
    const [popupProduct, setPopupProduct] = useState<any>(null)
    const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set())
    const [cartIds, setCartIds] = useState<Set<string>>(new Set())
    const [showLoginPopup, setShowLoginPopup] = useState(false)
    const [loginMessage, setLoginMessage] = useState('')
    const router = useRouter()

    useEffect(() => {
        loadProduct()
        checkUser()
    }, [resolvedParams.id])

    const loadProduct = async () => {
        const { data } = await supabase
            .from('products')
            .select('*, categories(name)')
            .eq('id', resolvedParams.id)
            .single()

        if (data) {
            setProduct(data)

            // Collect all images
            const productImages = [
                data.image_url,
                data.image_url_2,
                data.image_url_3,
                data.image_url_4,
                data.image_url_5
            ].filter(Boolean)
            setImages(productImages)

            // Load related products (same category)
            const { data: related } = await supabase
                .from('products')
                .select('*, categories(name)')
                .eq('category_id', data.category_id)
                .neq('id', data.id)
                .limit(8)
            if (related) setRelatedProducts(related)
        }
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

    const addToCart = async () => {
        if (!user) {
            setLoginMessage('add to cart')
            setShowLoginPopup(true)
            return
        }

        const alreadyInCart = cartIds.has(product.id)

        try {
            const { error } = await supabase
                .from('cart')
                .upsert([{
                    user_id: user.id,
                    product_id: product.id,
                    quantity: quantity
                }], {
                    onConflict: 'user_id,product_id'
                })

            if (!error) {
                setCartIds(prev => new Set(prev).add(product.id))
                setPopupType('cart')
                setPopupProduct({ ...product, alreadyAdded: alreadyInCart })
                setShowPopup(true)
            }
        } catch (err) {
            console.error('Cart error:', err)
        }
    }

    const addToWishlist = async (productId?: string) => {
        if (!user) {
            setLoginMessage('add to wishlist')
            setShowLoginPopup(true)
            return
        }

        const targetId = productId || product.id
        const alreadyInWishlist = wishlistIds.has(targetId)

        try {
            const { error } = await supabase
                .from('wishlist')
                .insert([{ user_id: user.id, product_id: targetId }])

            if (!error || error.code === '23505') {
                setWishlistIds(prev => new Set(prev).add(targetId))
                setPopupType('wishlist')
                setPopupProduct({ ...product, alreadyAdded: alreadyInWishlist })
                setShowPopup(true)
            }
        } catch (err) {
            console.error('Wishlist error:', err)
        }
    }

    const addToWishlistForProduct = async (prod: any, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!user) {
            setLoginMessage('add to wishlist')
            setShowLoginPopup(true)
            return
        }

        const alreadyInWishlist = wishlistIds.has(prod.id)

        try {
            const { error } = await supabase
                .from('wishlist')
                .insert([{ user_id: user.id, product_id: prod.id }])

            if (!error || error.code === '23505') {
                setWishlistIds(prev => new Set(prev).add(prod.id))
                setPopupProduct({ ...prod, alreadyAdded: alreadyInWishlist })
                setPopupType('wishlist')
                setShowPopup(true)
            }
        } catch (err) {
            console.error('Wishlist error:', err)
        }
    }

    const buyNow = async () => {
        if (!user) {
            setLoginMessage('buy this product')
            setShowLoginPopup(true)
            return
        }

        // Navigate to buy now page with quantity
        localStorage.setItem(`buynow_quantity_${product.id}`, quantity.toString())
        router.push(`/buynow/${product.id}`)
    }

    // Helper functions for ProductCard component
    const addToCartForProduct = async (prod: any, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!user) {
            setLoginMessage('add to cart')
            setShowLoginPopup(true)
            return
        }

        const alreadyInCart = cartIds.has(prod.id)

        try {
            const { error } = await supabase
                .from('cart')
                .upsert([{
                    user_id: user.id,
                    product_id: prod.id,
                    quantity: 1
                }], {
                    onConflict: 'user_id,product_id'
                })

            if (!error) {
                setCartIds(prev => new Set(prev).add(prod.id))
                setPopupProduct({ ...prod, alreadyAdded: alreadyInCart })
                setPopupType('cart')
                setShowPopup(true)
            }
        } catch (err) {
            console.error('Cart error:', err)
        }
    }

    const buyNowForProduct = (productId: string, e: React.MouseEvent) => {
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

    if (!product) {
        return (
            <div className="min-h-screen bg-black pt-16 md:pt-20">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Image Skeleton */}
                        <div>
                            <div className="aspect-square bg-gray-900 rounded-2xl animate-pulse mb-4"></div>
                            <div className="flex justify-center gap-2">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="w-2 h-2 rounded-full bg-gray-800 animate-pulse"></div>
                                ))}
                            </div>
                        </div>

                        {/* Info Skeleton */}
                        <div className="space-y-6">
                            <div className="h-4 bg-gray-900 rounded w-1/4 animate-pulse"></div>
                            <div className="h-12 bg-gray-900 rounded w-3/4 animate-pulse"></div>
                            <div className="h-16 bg-gray-900 rounded w-1/2 animate-pulse"></div>
                            <div className="h-24 bg-gray-900 rounded animate-pulse"></div>
                            <div className="h-12 bg-gray-900 rounded w-1/3 animate-pulse"></div>
                            <div className="space-y-3">
                                <div className="h-14 bg-gray-900 rounded-full animate-pulse"></div>
                                <div className="h-14 bg-gray-900 rounded-full animate-pulse"></div>
                                <div className="h-14 bg-gray-900 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black pt-16 md:pt-20">
            <Navbar />

            <AddToCartPopup
                show={showPopup}
                onClose={() => setShowPopup(false)}
                type={popupType}
                product={popupProduct || product}
                alreadyAdded={popupProduct?.alreadyAdded}
            />

            <LoginRequiredPopup
                show={showLoginPopup}
                onClose={() => setShowLoginPopup(false)}
                message={loginMessage}
            />

            <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
                <Link href="/products" className="text-gray-400 hover:text-white mb-4 inline-block text-sm md:text-base">
                    ← Back to Products
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                    {/* Product Images */}
                    <div>
                        <div className="aspect-square bg-gray-900 rounded-2xl overflow-hidden relative mb-4 border border-gray-800 group">
                            <Image
                                src={images[currentImageIndex] || '/placeholder.png'}
                                alt={product.name}
                                fill
                                className="object-cover"
                            />

                            {/* Arrow Navigation Buttons */}
                            {images.length > 1 && (
                                <>
                                    {/* Previous Button */}
                                    <button
                                        onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                                        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-2 md:p-3 rounded-full transition-all backdrop-blur-sm"
                                        aria-label="Previous image"
                                    >
                                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>

                                    {/* Next Button */}
                                    <button
                                        onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                                        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-2 md:p-3 rounded-full transition-all backdrop-blur-sm"
                                        aria-label="Next image"
                                    >
                                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>

                                    {/* Image Counter */}
                                    <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                                        {currentImageIndex + 1} / {images.length}
                                    </div>
                                </>
                            )}
                        </div>
                        {/* Image Dots */}
                        {images.length > 1 && (
                            <div className="flex justify-center gap-2">
                                {images.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`w-2 h-2 rounded-full transition ${index === currentImageIndex ? 'bg-white w-8' : 'bg-gray-700'
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        <p className="text-gray-400 mb-2 text-sm md:text-base">{product.categories?.name}</p>
                        <h1 className="text-2xl md:text-4xl font-bold mb-4 text-white">{product.name}</h1>

                        {/* Dual Pricing */}
                        <div className="mb-4 md:mb-6">
                            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                                <p className="text-2xl md:text-4xl font-bold text-white">₹{product.price}</p>
                                {product.actual_price && product.actual_price > product.price && (
                                    <p className="text-lg md:text-2xl text-gray-500 line-through">₹{product.actual_price}</p>
                                )}
                            </div>
                            {product.actual_price && product.actual_price > product.price && (
                                <div className="flex items-center gap-2 md:gap-3 mt-2 flex-wrap">
                                    <span className="bg-green-500 text-white px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-bold">
                                        Save ₹{(product.actual_price - product.price).toFixed(2)}!
                                    </span>
                                    <span className="text-green-400 text-sm md:text-base font-bold">
                                        {((product.actual_price - product.price) / product.actual_price * 100).toFixed(0)}% OFF
                                    </span>
                                </div>
                            )}
                        </div>

                        {product.description && (
                            <div className="mb-4 md:mb-6">
                                <h3 className="font-bold mb-2 text-white text-sm md:text-base">Description</h3>
                                <p className="text-gray-400 text-sm md:text-base">{product.description}</p>
                            </div>
                        )}

                        <div className="mb-4 md:mb-6">
                            <p className="text-xs md:text-sm">
                                {product.stock > 0 ? (
                                    <span className="text-green-400">✓ In Stock ({product.stock} available)</span>
                                ) : (
                                    <span className="text-red-400">Out of Stock</span>
                                )}
                            </p>
                        </div>

                        {/* Quantity */}
                        {product.stock > 0 && (
                            <div className="mb-4 md:mb-6">
                                <label className="block font-medium mb-2 text-white text-sm md:text-base">Quantity</label>
                                <div className="flex items-center gap-3 md:gap-4">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-9 h-9 md:w-10 md:h-10 border border-white text-white rounded-full hover:bg-white hover:text-black transition text-sm md:text-base"
                                    >
                                        -
                                    </button>
                                    <span className="text-lg md:text-xl font-medium w-10 md:w-12 text-center text-white">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                        className="w-9 h-9 md:w-10 md:h-10 border border-white text-white rounded-full hover:bg-white hover:text-black transition text-sm md:text-base"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="space-y-4">
                            <button
                                onClick={buyNow}
                                disabled={product.stock === 0}
                                className="w-full bg-white text-black py-4 rounded-full hover:bg-gray-200 transition font-medium disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
                            >
                                {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
                            </button>

                            <button
                                onClick={addToCart}
                                disabled={product.stock === 0}
                                className="w-full border-2 border-white text-white py-4 rounded-full hover:bg-white hover:text-black transition font-medium disabled:border-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
                            >
                                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>

                            <button
                                onClick={() => addToWishlist()}
                                className="w-full border border-gray-700 text-white py-4 rounded-full hover:border-white transition font-medium flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                Add to Wishlist
                            </button>
                        </div>
                    </div>
                </div>



                {/* Similar Products (Same Category) */}
                {relatedProducts.length > 0 && (
                    <section className="mt-20">
                        <h2 className="text-3xl font-bold mb-8 text-white">Similar Products</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                            {relatedProducts.map((prod) => (
                                <ProductCard
                                    key={prod.id}
                                    product={prod}
                                    user={user}
                                    isInWishlist={wishlistIds.has(prod.id)}
                                    isInCart={cartIds.has(prod.id)}
                                    onAddToWishlist={addToWishlistForProduct}
                                    onAddToCart={addToCartForProduct}
                                    onBuyNow={buyNowForProduct}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
            <Footer />
        </div>
    )
}
