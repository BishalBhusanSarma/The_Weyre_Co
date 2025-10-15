# 🎯 Complete Feature Implementation Guide

## ✅ COMPLETED:

### 1. Dual Pricing System ✅
- Database schema updated with `actual_price` field
- Admin panel updated with two price inputs
- Migration SQL created (`add_actual_price.sql`)

### 2. Coupon System ✅
- Database schema created (`coupon_system.sql`)
- Admin coupons page created (`app/admin/coupons/page.tsx`)
- Features:
  - Create/Edit/Delete coupons
  - Percentage or Fixed discount
  - Min purchase requirement
  - Max discount cap
  - Usage limits
  - Expiry dates
  - Active/Inactive toggle

### 3. Reusable Product Card Component ✅
- Created `components/ProductCard.tsx`
- Features:
  - Shows actual price & selling price
  - Discount badge
  - Red wishlist button if wishlisted
  - Red "Go to Cart" button if in cart
  - Buy Now, Add to Cart buttons
  - Responsive design

## 📋 REQUIRED SQL MIGRATIONS:

### Step 1: Add actual_price to products
```bash
# Run in Supabase SQL Editor
# File: add_actual_price.sql
```

### Step 2: Create coupon system
```bash
# Run in Supabase SQL Editor
# File: coupon_system.sql
```

### Step 3: Update orders for status tracking
```sql
-- Add order status tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' 
  CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP;
```

## 🔧 FILES THAT NEED UPDATES:

### 1. Update All Product Pages to Use ProductCard Component:

#### `app/page.tsx` - Homepage
- Import ProductCard component
- Track cart items state
- Pass isInCart prop to ProductCard
- Use ProductCard for featured/trending sections

#### `app/products/page.tsx` - All Products
- Import ProductCard component
- Track cart items state
- Replace existing product cards with ProductCard component

#### `app/products/men/page.tsx` - Men's Collection
- Import ProductCard component
- Track cart items state
- Replace existing product cards with ProductCard component

#### `app/products/women/page.tsx` - Women's Collection
- Import ProductCard component
- Track cart items state
- Replace existing product cards with ProductCard component

#### `app/products/[id]/page.tsx` - Product Detail
- Show actual price & selling price
- Show discount badge
- Use ProductCard for related/trending products

### 2. Update Cart Page with Coupon System:

#### `app/cart/page.tsx`
Add:
```typescript
const [couponCode, setCouponCode] = useState('')
const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
const [couponDiscount, setCouponDiscount] = useState(0)

const applyCoupon = async () => {
    const { data } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single()
    
    if (data) {
        // Validate coupon
        if (data.min_purchase && subtotal < data.min_purchase) {
            alert(`Minimum purchase of $${data.min_purchase} required`)
            return
        }
        
        // Calculate discount
        let discount = 0
        if (data.discount_type === 'percentage') {
            discount = (subtotal * data.discount_value) / 100
            if (data.max_discount) {
                discount = Math.min(discount, data.max_discount)
            }
        } else {
            discount = data.discount_value
        }
        
        setAppliedCoupon(data)
        setCouponDiscount(discount)
        alert('Coupon applied successfully!')
    } else {
        alert('Invalid or expired coupon')
    }
}

// Calculate totals
const actualTotal = cartItems.reduce((sum, item) => 
    sum + ((item.products.actual_price || item.products.price) * item.quantity), 0
)
const sellingTotal = cartItems.reduce((sum, item) => 
    sum + (item.products.price * item.quantity), 0
)
const productDiscount = actualTotal - sellingTotal
const finalTotal = sellingTotal - couponDiscount
```

Display:
```jsx
<div className="space-y-3">
    <div className="flex justify-between">
        <span>Subtotal (Actual):</span>
        <span>${actualTotal.toFixed(2)}</span>
    </div>
    <div className="flex justify-between text-green-600">
        <span>Product Discount:</span>
        <span>-${productDiscount.toFixed(2)}</span>
    </div>
    {appliedCoupon && (
        <div className="flex justify-between text-green-600">
            <span>Coupon ({appliedCoupon.code}):</span>
            <span>-${couponDiscount.toFixed(2)}</span>
        </div>
    )}
    <div className="border-t pt-3 flex justify-between text-xl font-bold">
        <span>Total:</span>
        <span>${finalTotal.toFixed(2)}</span>
    </div>
</div>

{/* Coupon Input */}
<div className="flex gap-2 mt-4">
    <input
        type="text"
        placeholder="Enter coupon code"
        className="input flex-1"
        value={couponCode}
        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
    />
    <button
        onClick={applyCoupon}
        className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800"
    >
        Apply
    </button>
</div>
```

### 3. Update Admin Orders Page:

#### `app/admin/orders/page.tsx`
Add status management:
```typescript
const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const updates: any = { status: newStatus }
    
    if (newStatus === 'shipped') {
        updates.shipped_at = new Date().toISOString()
    } else if (newStatus === 'delivered') {
        updates.delivered_at = new Date().toISOString()
    }
    
    await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
    
    loadOrders()
}
```

Display:
```jsx
<select
    value={order.status}
    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
    className="input"
>
    <option value="pending">Pending</option>
    <option value="processing">Processing</option>
    <option value="shipped">Shipped</option>
    <option value="delivered">Delivered</option>
    <option value="cancelled">Cancelled</option>
</select>
```

### 4. Create Customer Orders Page:

#### `app/orders/page.tsx`
```typescript
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

export default function MyOrders() {
    const [orders, setOrders] = useState<any[]>([])
    const [user, setUser] = useState<any>(null)
    
    useEffect(() => {
        const userData = localStorage.getItem('user')
        if (userData) {
            const u = JSON.parse(userData)
            setUser(u)
            loadOrders(u.id)
        }
    }, [])
    
    const loadOrders = async (userId: string) => {
        const { data } = await supabase
            .from('orders')
            .select('*, order_items(*, products(*))')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
        
        if (data) setOrders(data)
    }
    
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700'
            case 'processing': return 'bg-blue-100 text-blue-700'
            case 'shipped': return 'bg-purple-100 text-purple-700'
            case 'delivered': return 'bg-green-100 text-green-700'
            case 'cancelled': return 'bg-red-100 text-red-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }
    
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-16">
                <h1 className="text-4xl font-bold mb-12">My Orders</h1>
                
                {orders.map((order) => (
                    <div key={order.id} className="card mb-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Order #{order.id.slice(0, 8)}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {new Date(order.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(order.status)}`}>
                                {order.status.toUpperCase()}
                            </span>
                        </div>
                        
                        <div className="space-y-4">
                            {order.order_items.map((item: any) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg" />
                                    <div className="flex-1">
                                        <h3 className="font-bold">{item.products.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            Qty: {item.quantity} × ${item.price}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="border-t mt-4 pt-4">
                            <div className="flex justify-between font-bold">
                                <span>Total:</span>
                                <span>${order.total}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
```

## 🎨 Implementation Pattern for ProductCard:

```typescript
// In any product listing page
import ProductCard from '@/components/ProductCard'

// Add state for cart items
const [cartIds, setCartIds] = useState<Set<string>>(new Set())

// Load cart items
const loadCart = async (userId: string) => {
    const { data } = await supabase
        .from('cart')
        .select('product_id')
        .eq('user_id', userId)
    
    if (data) {
        setCartIds(new Set(data.map(item => item.product_id)))
    }
}

// Use ProductCard component
<ProductCard
    product={product}
    user={user}
    isInWishlist={wishlistIds.has(product.id)}
    isInCart={cartIds.has(product.id)}
    onAddToWishlist={addToWishlist}
    onAddToCart={addToCart}
    onBuyNow={buyNow}
/>
```

## 🚀 Implementation Priority:

1. ✅ Run SQL migrations (actual_price, coupons, order status)
2. ⏳ Update all product pages to use ProductCard component
3. ⏳ Add cart tracking to show "Go to Cart" button
4. ⏳ Implement coupon system in cart page
5. ⏳ Add order status management in admin
6. ⏳ Create customer orders page
7. ⏳ Fix men's and women's pages (use ProductCard)

## 📝 Quick Fixes Needed:

### Men's & Women's Pages:
Both pages just need to:
1. Import ProductCard component
2. Add cartIds state and loadCart function
3. Replace existing product card JSX with ProductCard component

### Featured Sections:
Replace simple product links with ProductCard component in:
- Homepage featured/trending sections
- Product detail page related/trending sections

## ✅ Summary:

**Created:**
- ✅ ProductCard component (reusable)
- ✅ Admin coupons page
- ✅ Coupon system SQL schema
- ✅ Dual pricing SQL migration

**Need to Update:**
- ⏳ All product listing pages (use ProductCard)
- ⏳ Cart page (add coupon system)
- ⏳ Admin orders (add status management)
- ⏳ Create customer orders page
- ⏳ Product detail page (show dual pricing)

**Total Estimated Time:** 2-3 hours for complete implementation

Would you like me to continue with updating specific pages?
