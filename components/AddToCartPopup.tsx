'use client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface AddToCartPopupProps {
    show: boolean
    onClose: () => void
    type: 'cart' | 'wishlist'
    product?: {
        name: string
        image_url: string
        price: number
    }
    alreadyAdded?: boolean
}

export default function AddToCartPopup({ show, onClose, type, product, alreadyAdded = false }: AddToCartPopupProps) {
    const router = useRouter()

    if (!show || !product) return null

    const handleOpenDestination = () => {
        onClose()
        router.push(type === 'cart' ? '/cart' : '/wishlist')
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Popup Card */}
            <div className="relative bg-black text-white border border-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 animate-scale-in">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className={`w-16 h-16 ${alreadyAdded ? 'bg-blue-900' : 'bg-green-900'} rounded-full flex items-center justify-center`}>
                        {alreadyAdded ? (
                            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : (
                            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </div>
                </div>

                {/* Message */}
                <h2 className="text-2xl font-bold text-center mb-2 text-white">
                    {alreadyAdded ? 'Already Added!' : 'Success!'}
                </h2>
                <p className="text-center text-gray-400 mb-6">
                    {alreadyAdded
                        ? `This product is already in your ${type === 'cart' ? 'cart' : 'wishlist'}`
                        : `Product added to ${type === 'cart' ? 'cart' : 'wishlist'}`
                    }
                </p>

                {/* Product Info */}
                <div className="flex gap-4 mb-6 p-4 bg-gray-900 border border-gray-800 rounded-lg">
                    <div className="w-20 h-20 bg-gray-800 rounded-lg overflow-hidden relative flex-shrink-0">
                        <Image
                            src={product.image_url || '/placeholder.png'}
                            alt={product.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold mb-1 line-clamp-2 text-white">{product.name}</h3>
                        <p className="text-lg font-bold text-white">₹{product.price}</p>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 border-2 border-white text-white py-3 rounded-full hover:bg-white hover:text-black transition font-medium"
                    >
                        Continue Shopping
                    </button>
                    <button
                        onClick={handleOpenDestination}
                        className="flex-1 bg-white text-black py-3 rounded-full hover:bg-gray-200 transition font-medium"
                    >
                        {type === 'cart' ? 'Open Cart' : 'Open Wishlist'}
                    </button>
                </div>
            </div>

            <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
        </div>
    )
}
