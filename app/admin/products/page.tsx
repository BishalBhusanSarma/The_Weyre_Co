'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AdminNavbar from '@/components/AdminNavbar'

export default function AdminProducts() {
    const [products, setProducts] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        actual_price: '',
        price: '',
        image_url: '',
        image_url_2: '',
        image_url_3: '',
        image_url_4: '',
        image_url_5: '',
        category_id: '',
        stock: '',
        is_featured: false,
        is_trending: false,
        gender: 'all'
    })

    useEffect(() => {
        loadProducts()
        loadCategories()
    }, [])

    const loadProducts = async () => {
        const { data } = await supabase
            .from('products')
            .select('*, categories(name)')
            .order('created_at', { ascending: false })
        if (data) setProducts(data)
    }

    const loadCategories = async () => {
        const { data } = await supabase.from('categories').select('*')
        if (data) setCategories(data)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const productData = {
            ...formData,
            actual_price: parseFloat(formData.actual_price),
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock)
        }

        let error
        if (editingId) {
            const result = await supabase
                .from('products')
                .update(productData)
                .eq('id', editingId)
            error = result.error
        } else {
            const result = await supabase.from('products').insert([productData])
            error = result.error
        }

        if (!error) {
            alert(editingId ? 'Product updated!' : 'Product added!')
            resetForm()
            loadProducts()
        }
    }

    const resetForm = () => {
        setShowForm(false)
        setEditingId(null)
        setFormData({
            name: '',
            description: '',
            actual_price: '',
            price: '',
            image_url: '',
            image_url_2: '',
            image_url_3: '',
            image_url_4: '',
            image_url_5: '',
            category_id: '',
            stock: '',
            is_featured: false,
            is_trending: false,
            gender: 'all'
        })
    }

    const editProduct = (product: any) => {
        setFormData({
            name: product.name,
            description: product.description || '',
            actual_price: product.actual_price?.toString() || product.price.toString(),
            price: product.price.toString(),
            image_url: product.image_url || '',
            image_url_2: product.image_url_2 || '',
            image_url_3: product.image_url_3 || '',
            image_url_4: product.image_url_4 || '',
            image_url_5: product.image_url_5 || '',
            category_id: product.category_id,
            stock: product.stock.toString(),
            is_featured: product.is_featured || false,
            is_trending: product.is_trending || false,
            gender: product.gender || 'all'
        })
        setEditingId(product.id)
        setShowForm(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const deleteProduct = async (id: string) => {
        if (confirm('Delete this product?')) {
            await supabase.from('products').delete().eq('id', id)
            loadProducts()
        }
    }

    return (
        <div className="min-h-screen bg-black">
            <AdminNavbar />

            <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Products Management</h1>
                        <p className="text-gray-400">Manage your product catalog</p>
                    </div>
                    <button
                        onClick={() => showForm ? resetForm() : setShowForm(true)}
                        className="bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-200 transition font-medium flex items-center gap-2"
                    >
                        {showForm ? (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Cancel
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Product
                            </>
                        )}
                    </button>
                </div>

                {/* Stats Card */}
                <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400 mb-1">Total Products</p>
                            <h2 className="text-4xl font-bold text-white">{products.length}</h2>
                        </div>
                        <div className="bg-blue-500/20 p-4 rounded-xl">
                            <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                    </div>
                </div>

                {showForm && (
                    <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8 space-y-4">
                        <h3 className="text-2xl font-bold text-white">{editingId ? 'Edit Product' : 'New Product'}</h3>

                        <input
                            type="text"
                            placeholder="Product Name"
                            required
                            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-white transition"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />

                        <textarea
                            placeholder="Description"
                            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-white transition"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Actual Price (Original)"
                                required
                                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-white transition"
                                value={formData.actual_price}
                                onChange={(e) => setFormData({ ...formData, actual_price: e.target.value })}
                            />

                            <input
                                type="number"
                                step="0.01"
                                placeholder="Selling Price (Discounted)"
                                required
                                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-white transition"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="font-medium text-white">Product Images (up to 5)</label>
                            <input
                                type="text"
                                placeholder="Image URL 1 (Main)"
                                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-white transition"
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Image URL 2"
                                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-white transition"
                                value={formData.image_url_2}
                                onChange={(e) => setFormData({ ...formData, image_url_2: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Image URL 3"
                                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-white transition"
                                value={formData.image_url_3}
                                onChange={(e) => setFormData({ ...formData, image_url_3: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Image URL 4"
                                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-white transition"
                                value={formData.image_url_4}
                                onChange={(e) => setFormData({ ...formData, image_url_4: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Image URL 5"
                                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-white transition"
                                value={formData.image_url_5}
                                onChange={(e) => setFormData({ ...formData, image_url_5: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select
                                required
                                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-white transition"
                                value={formData.category_id}
                                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>

                            <input
                                type="number"
                                placeholder="Stock"
                                required
                                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-white transition"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            />
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block font-medium mb-2 text-white">Gender</label>
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="men"
                                            checked={formData.gender === 'men'}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-white">Men</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="women"
                                            checked={formData.gender === 'women'}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-white">Women</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="all"
                                            checked={formData.gender === 'all'}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-white">All</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_featured}
                                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                        className="w-5 h-5"
                                    />
                                    <span className="font-medium text-white">Featured Product</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_trending}
                                        onChange={(e) => setFormData({ ...formData, is_trending: e.target.checked })}
                                        className="w-5 h-5"
                                    />
                                    <span className="font-medium text-white">Trending Product</span>
                                </label>
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-white text-black py-3 rounded-lg hover:bg-gray-200 transition font-medium">
                            {editingId ? 'Update Product' : 'Add Product'}
                        </button>
                    </form>
                )}

                <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-800">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Name</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Category</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Actual Price</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Selling Price</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Discount</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Stock</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Gender</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Featured</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Trending</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id} className="border-b border-gray-800">
                                    <td className="p-4 text-white">{product.name}</td>
                                    <td className="p-4 text-white">{product.categories?.name}</td>
                                    <td className="p-4 text-white">₹{product.actual_price || product.price}</td>
                                    <td className="p-4 text-white">₹{product.price}</td>
                                    <td className="p-4 text-green-400 font-bold">
                                        {product.actual_price ? `₹${(product.actual_price - product.price).toFixed(2)}` : '-'}
                                    </td>
                                    <td className="p-4 text-white">{product.stock}</td>
                                    <td className="p-4 text-white capitalize">{product.gender || 'all'}</td>
                                    <td className="p-4 text-white">{product.is_featured ? '✓' : '-'}</td>
                                    <td className="p-4 text-white">{product.is_trending ? '✓' : '-'}</td>
                                    <td className="p-4 space-x-4">
                                        <button
                                            onClick={() => editProduct(product)}
                                            className="text-blue-400 hover:text-blue-300 hover:underline"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteProduct(product.id)}
                                            className="text-red-400 hover:text-red-300 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
