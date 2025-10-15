'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface ProductCardProps {
    product: any
    user: any
    isInWishlist: boolean
    isInCart: boolean
    onAddToWishlist: (product: any, e: React.MouseEvent) => void
    onAddToCart: (product: any, e: React.MouseEvent) => void
    onBuyNow: (productId: string, e: React.MouseEvent) => void
    onRemoveFromWishlist?: (product: any, e: React.MouseEvent) => void
    showRemoveButton?: boolean
}

export default function ProductCard({
    product,
    user,
    isInWishlist,
    isInCart,
    onAddToWishlist,
    onAddToCart,
    onBuyNow,
    onRemoveFromWishlist,
    showRemoveButton = false
}: ProductCardProps) {
    const router = useRouter()
    const discount = product.actual_price && product.actual_price > product.price
        ? product.actual_price - product.price
        : 0
    const isOutOfStock = !product.stock || product.stock === 0

    const handleGoToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        router.push('/cart')
    }

    return (
        <div className="group relative">
            <Link
                href={`/products/${product.id}`}
                className="block bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-white transition-all duration-300 hover:-translate-y-2"
            >
                <div className="aspect-square bg-gray-800 relative overflow-hidden">
                    <Image
                        src={product.image_url || '/placeholder.png'}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {/* Wishlist/Remove Button */}
                    {showRemoveButton && onRemoveFromWishlist ? (
                        <button
                            onClick={(e) => onRemoveFromWishlist(product, e)}
                            className="absolute top-2 right-2 md:top-3 md:right-3 bg-red-500 text-white p-1.5 md:p-2 rounded-full shadow-lg hover:bg-red-600 transition z-10"
                        >
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    ) : (
                        <button
                            onClick={(e) => onAddToWishlist(product, e)}
                            className={`absolute top-2 right-2 md:top-3 md:right-3 p-1.5 md:p-2 rounded-full shadow-lg transition z-10 ${isInWishlist
                                ? 'bg-red-500 text-white'
                                : 'bg-white text-black hover:bg-gray-200'
                                }`}
                        >
                            <svg
                                className="w-4 h-4 md:w-5 md:h-5"
                                fill={isInWishlist ? 'currentColor' : 'none'}
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg>
                        </button>
                    )}

                    {/* Out of Stock Badge */}
                    {isOutOfStock ? (
                        <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-red-500 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-bold z-10">
                            Out of Stock
                        </div>
                    ) : discount > 0 ? (
                        <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-green-500 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-bold z-10">
                            Save ₹{discount.toFixed(2)}
                        </div>
                    ) : null}
                </div>

                <div className="p-3 md:p-4 flex flex-col h-full">
                    <p className="text-xs text-gray-400 mb-1">{product.categories?.name}</p>
                    <h3 className="font-bold text-sm md:text-base text-white mb-1.5 truncate">{product.name}</h3>

                    {/* Price Display - Stacked Vertically */}
                    <div className="mb-2 md:mb-3">
                        <div className="text-lg md:text-xl font-bold text-white">
                            ₹{product.price}
                        </div>
                        {discount > 0 && (
                            <>
                                <div className="text-xs text-gray-500 line-through">
                                    ₹{product.actual_price}
                                </div>
                                <p className="text-xs text-green-400 font-bold mt-0.5">
                                    {((discount / product.actual_price) * 100).toFixed(0)}% OFF
                                </p>
                            </>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-auto">
                        {/* Buy Now Button */}
                        <button
                            onClick={(e) => isOutOfStock ? e.preventDefault() : onBuyNow(product.id, e)}
                            disabled={isOutOfStock}
                            className={`flex-1 py-2 rounded-full transition font-medium flex items-center justify-center gap-1.5 ${isOutOfStock
                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    : 'bg-white text-black hover:bg-gray-200'
                                }`}
                        >
                            {/* Shopping Bag Icon - Below 1280px */}
                            <svg className="w-4 h-4 xl:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            {/* Text - 1280px+ */}
                            <span className="hidden xl:inline text-sm">{isOutOfStock ? 'Out of Stock' : 'Buy Now'}</span>
                        </button>

                        {/* Add to Cart / Go to Cart Button */}
                        {isInCart ? (
                            <button
                                onClick={handleGoToCart}
                                className="flex-1 bg-red-500 text-white py-2 rounded-full hover:bg-red-600 transition font-medium flex items-center justify-center gap-1.5"
                            >
                                {/* Cart Icon */}
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {/* Text - 1280px+ */}
                                <span className="hidden xl:inline text-sm">Go to Cart</span>
                            </button>
                        ) : (
                            <button
                                onClick={(e) => isOutOfStock ? e.preventDefault() : onAddToCart(product, e)}
                                disabled={isOutOfStock}
                                className={`flex-1 py-2 rounded-full transition font-medium flex items-center justify-center gap-1.5 ${isOutOfStock
                                        ? 'border border-gray-700 text-gray-500 cursor-not-allowed'
                                        : 'border border-white text-white hover:bg-white hover:text-black'
                                    }`}
                            >
                                {/* Cart Icon */}
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {/* Text - 1280px+ */}
                                <span className="hidden xl:inline text-sm">{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                            </button>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    )
}