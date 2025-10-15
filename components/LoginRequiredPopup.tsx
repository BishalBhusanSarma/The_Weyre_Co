'use client'
import { useRouter } from 'next/navigation'

interface LoginRequiredPopupProps {
    show: boolean
    onClose: () => void
    message?: string
}

export default function LoginRequiredPopup({ show, onClose, message = 'add to cart' }: LoginRequiredPopupProps) {
    const router = useRouter()

    if (!show) return null

    const handleLogin = () => {
        onClose()
        router.push('/login')
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Popup Card */}
            <div className="relative bg-black text-white border-2 border-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 animate-scale-in">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-gray-900 border-2 border-white rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                </div>

                {/* Message */}
                <h2 className="text-2xl font-bold text-center mb-2 text-white">
                    Login Required
                </h2>
                <p className="text-center text-gray-400 mb-8">
                    You need to login to {message}
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 border-2 border-white text-white py-3 rounded-full hover:bg-white hover:text-black transition font-medium"
                    >
                        Back to Store
                    </button>
                    <button
                        onClick={handleLogin}
                        className="flex-1 bg-white text-black py-3 rounded-full hover:bg-gray-200 transition font-medium"
                    >
                        Login
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
