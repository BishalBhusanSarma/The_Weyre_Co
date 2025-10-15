'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import bcrypt from 'bcryptjs'

export default function Register() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipcode: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // Hash password
            const hashedPassword = await bcrypt.hash(formData.password, 10)

            // Insert user
            const { data, error } = await supabase
                .from('users')
                .insert([{ ...formData, password: hashedPassword }])
                .select()
                .single()

            if (error) throw error

            alert('Registration successful! Please login.')
            router.push('/login')
        } catch (err: any) {
            setError(err.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <Link href="/" className="text-4xl font-bold">The Weyre Co.</Link>
                    <h2 className="mt-6 text-3xl font-bold">Create Account</h2>
                </div>

                <form onSubmit={handleSubmit} className="card space-y-4">
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
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            className="input"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Full Name</label>
                        <input
                            type="text"
                            required
                            className="input"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Phone</label>
                        <input
                            type="tel"
                            className="input"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Address</label>
                        <input
                            type="text"
                            required
                            className="input"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2 font-medium">City</label>
                            <input
                                type="text"
                                required
                                className="input"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium">State</label>
                            <input
                                type="text"
                                required
                                className="input"
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">ZIP Code</label>
                        <input
                            type="text"
                            required
                            className="input"
                            value={formData.zipcode}
                            onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    <p className="text-center">
                        Already have an account?{' '}
                        <Link href="/login" className="underline font-medium">Login</Link>
                    </p>
                </form>
            </div>
        </div>
    )
}
