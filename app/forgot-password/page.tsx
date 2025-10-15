'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import bcrypt from 'bcryptjs'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [step, setStep] = useState<'email' | 'reset'>('email')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [userId, setUserId] = useState('')

    const handleCheckEmail = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setMessage('')
        setLoading(true)

        try {
            const { data: user, error } = await supabase
                .from('users')
                .select('id, email')
                .eq('email', email)
                .single()

            if (error || !user) {
                throw new Error('Email not found')
            }

            setUserId(user.id)
            setStep('reset')
            setMessage('Email verified! Please enter your new password.')
        } catch (err: any) {
            setError(err.message || 'Email not found')
        } finally {
            setLoading(false)
        }
    }

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setMessage('')

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)

        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10)

            const { error } = await supabase
                .from('users')
                .update({ password: hashedPassword })
                .eq('id', userId)

            if (error) throw error

            setMessage('Password reset successfully! Redirecting to login...')
            setTimeout(() => {
                window.location.href = '/login'
            }, 2000)
        } catch (err: any) {
            setError(err.message || 'Failed to reset password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <Link href="/" className="text-4xl font-bold">The Weyre Co.</Link>
                    <h2 className="mt-6 text-3xl font-bold">Reset Password</h2>
                    <p className="mt-2 text-gray-600">
                        {step === 'email' ? 'Enter your email to reset your password' : 'Enter your new password'}
                    </p>
                </div>

                {step === 'email' ? (
                    <form onSubmit={handleCheckEmail} className="card space-y-6">
                        {error && (
                            <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3">
                                {error}
                            </div>
                        )}
                        {message && (
                            <div className="bg-green-100 border-2 border-green-500 text-green-700 px-4 py-3">
                                {message}
                            </div>
                        )}

                        <div>
                            <label className="block mb-2 font-medium">Email</label>
                            <input
                                type="email"
                                required
                                className="input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full"
                        >
                            {loading ? 'Verifying...' : 'Continue'}
                        </button>

                        <p className="text-center">
                            Remember your password?{' '}
                            <Link href="/login" className="underline font-medium">Login</Link>
                        </p>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="card space-y-6">
                        {error && (
                            <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3">
                                {error}
                            </div>
                        )}
                        {message && (
                            <div className="bg-green-100 border-2 border-green-500 text-green-700 px-4 py-3">
                                {message}
                            </div>
                        )}

                        <div>
                            <label className="block mb-2 font-medium">New Password</label>
                            <input
                                type="password"
                                required
                                className="input"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                minLength={6}
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-medium">Confirm Password</label>
                            <input
                                type="password"
                                required
                                className="input"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full"
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep('email')}
                            className="btn btn-secondary w-full"
                        >
                            Back
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
