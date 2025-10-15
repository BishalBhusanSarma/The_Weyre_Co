'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import bcrypt from 'bcryptjs'

export default function Login() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // Get user by email
            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single()

            if (error || !user) throw new Error('Invalid credentials')

            // Verify password
            const validPassword = await bcrypt.compare(password, user.password)
            if (!validPassword) throw new Error('Invalid credentials')

            // Store user in localStorage
            localStorage.setItem('user', JSON.stringify({
                id: user.id,
                email: user.email,
                name: user.name
            }))

            router.push('/')
        } catch (err: any) {
            setError(err.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <Link href="/" className="text-4xl font-bold">The Weyre Co.</Link>
                    <h2 className="mt-6 text-3xl font-bold">Welcome Back</h2>
                </div>

                <form onSubmit={handleSubmit} className="card space-y-6">
                    {error && (
                        <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3">
                            {error}
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
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="font-medium">Password</label>
                            <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                                Forgot Password?
                            </Link>
                        </div>
                        <input
                            type="password"
                            required
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                    <p className="text-center">
                        Don't have an account?{' '}
                        <Link href="/register" className="underline font-medium">Sign Up</Link>
                    </p>
                </form>
            </div>
        </div>
    )
}
