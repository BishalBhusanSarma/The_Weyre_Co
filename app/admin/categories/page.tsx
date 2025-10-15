'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AdminNavbar from '@/components/AdminNavbar'

interface Category {
    id: string
    name: string
    created_at: string
}

export default function AdminCategories() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState('')
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [editCategoryName, setEditCategoryName] = useState('')

    useEffect(() => {
        loadCategories()
    }, [])

    const loadCategories = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name', { ascending: true })

            if (error) throw error
            setCategories(data || [])
        } catch (error) {
            console.error('Error loading categories:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            alert('Please enter a category name')
            return
        }

        try {
            const { error } = await supabase
                .from('categories')
                .insert([{ name: newCategoryName.trim() }])

            if (error) throw error

            setNewCategoryName('')
            setShowAddModal(false)
            loadCategories()
        } catch (error: any) {
            console.error('Error adding category:', error)
            if (error.code === '23505') {
                alert('Category already exists')
            } else {
                alert('Failed to add category')
            }
        }
    }

    const handleEditCategory = async () => {
        if (!editCategoryName.trim() || !editingCategory) {
            alert('Please enter a category name')
            return
        }

        try {
            const { error } = await supabase
                .from('categories')
                .update({ name: editCategoryName.trim() })
                .eq('id', editingCategory.id)

            if (error) throw error

            setEditingCategory(null)
            setEditCategoryName('')
            setShowEditModal(false)
            loadCategories()
        } catch (error: any) {
            console.error('Error updating category:', error)
            if (error.code === '23505') {
                alert('Category name already exists')
            } else {
                alert('Failed to update category')
            }
        }
    }

    const handleDeleteCategory = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This will affect all products in this category.`)) {
            return
        }

        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id)

            if (error) throw error
            loadCategories()
        } catch (error) {
            console.error('Error deleting category:', error)
            alert('Failed to delete category. It may be in use by products.')
        }
    }

    const openEditModal = (category: Category) => {
        setEditingCategory(category)
        setEditCategoryName(category.name)
        setShowEditModal(true)
    }

    const CategorySkeleton = () => (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 animate-pulse">
            <div className="h-6 bg-gray-800 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-800 rounded w-1/3"></div>
        </div>
    )

    return (
        <div className="min-h-screen bg-black">
            <AdminNavbar />

            <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Categories Management</h1>
                        <p className="text-gray-400">Manage product categories</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-200 transition font-medium flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Category
                    </button>
                </div>

                {/* Stats Card */}
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400 mb-1">Total Categories</p>
                            <h2 className="text-4xl font-bold text-white">{categories.length}</h2>
                        </div>
                        <div className="bg-purple-500/20 p-4 rounded-xl">
                            <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Categories Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => <CategorySkeleton key={i} />)}
                    </div>
                ) : categories.length === 0 ? (
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <h3 className="text-xl font-bold text-white mb-2">No Categories Yet</h3>
                        <p className="text-gray-400 mb-4">Create your first category to organize products</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-white text-black px-6 py-2 rounded-lg hover:bg-gray-200 transition font-medium"
                        >
                            Add Category
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category) => (
                            <div key={category.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
                                        <p className="text-sm text-gray-400">
                                            Created {new Date(category.created_at).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div className="bg-purple-500/20 p-2 rounded-lg">
                                        <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEditModal(category)}
                                        className="flex-1 bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-700 transition font-medium"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCategory(category.id, category.name)}
                                        className="flex-1 bg-red-500/10 text-red-500 border border-red-500/20 py-2 rounded-lg hover:bg-red-500/20 transition font-medium"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Category Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-white mb-4">Add New Category</h2>
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Category name"
                            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:border-white transition"
                            onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowAddModal(false)
                                    setNewCategoryName('')
                                }}
                                className="flex-1 bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-700 transition font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddCategory}
                                className="flex-1 bg-white text-black py-3 rounded-lg hover:bg-gray-200 transition font-medium"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Category Modal */}
            {showEditModal && editingCategory && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-white mb-4">Edit Category</h2>
                        <input
                            type="text"
                            value={editCategoryName}
                            onChange={(e) => setEditCategoryName(e.target.value)}
                            placeholder="Category name"
                            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:border-white transition"
                            onKeyPress={(e) => e.key === 'Enter' && handleEditCategory()}
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowEditModal(false)
                                    setEditingCategory(null)
                                    setEditCategoryName('')
                                }}
                                className="flex-1 bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-700 transition font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditCategory}
                                className="flex-1 bg-white text-black py-3 rounded-lg hover:bg-gray-200 transition font-medium"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
