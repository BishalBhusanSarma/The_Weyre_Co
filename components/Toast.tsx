'use client'
import { useEffect } from 'react'

interface ToastProps {
    message: string
    onClose: () => void
    duration?: number
}

export default function Toast({ message, onClose, duration = 3000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration)
        return () => clearTimeout(timer)
    }, [duration, onClose])

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
            <div className="bg-gray-900 text-white px-6 py-4 rounded-full shadow-2xl border border-gray-700 flex items-center gap-3">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="font-medium">{message}</p>
            </div>
        </div>
    )
}
