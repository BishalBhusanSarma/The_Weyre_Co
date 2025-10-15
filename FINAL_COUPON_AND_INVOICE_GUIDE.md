# Final Implementation: Coupon & Invoice System

## ✅ Clear Requirements

### 1. Coupon System
- ❌ **Remove from Cart Page** - No coupon display in cart
- ✅ **Keep in Checkout Page** - Apply coupons at cart checkout
- ✅ **Keep in Buy Now Page** - Apply coupons at quick checkout
- 🎯 **Strategy:** Customers apply coupons at checkout, not in cart

### 2. Invoice Download
- ✅ **Customer Orders** - Download button for paid orders
- ✅ **Admin Orders** - Download button for paid orders
- 📄 **Opens in new tab** - Easy to print/save

---

## 📋 Implementation Steps

### STEP 1: Remove Coupon from Cart Page

**File:** `wc/app/cart/page.tsx`

**What to do:** Just don't show any coupon input in the cart page. Customers will see:
- Product list
- Pricing (with product discounts)
- "Proceed to Checkout" button
- No coupon field

**No code changes needed if cart page doesn't have coupon already.**

---

### STEP 2: Ensure Checkout Has Coupon (Already Done ✅)

**File:** `wc/app/checkout/page.tsx`

**Current Status:** Coupon functionality already exists
- Coupon input field ✅
- Apply/Remove buttons ✅
- Validation ✅
- Discount calculation ✅
- Order creation with coupon ✅

**No changes needed - already working!**

---

### STEP 3: Ensure Buy Now Has Coupon (Already Done ✅)

**File:** `wc/app/buynow/[id]/page.tsx`

**Current Status:** Coupon functionality already exists
- Coupon input field ✅
- Apply/Remove buttons ✅
- Validation ✅
- Discount calculation ✅
- Order creation with coupon ✅

**No changes needed - already working!**

---

### STEP 4: Create Invoice Pages

**A. Customer Invoice Page**

**Create File:** `wc/app/invoice/[id]/page.tsx`

```typescript
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import Invoice from '@/components/Invoice'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const [order, setOrder] = useState<any>(null)
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        const userData = localStorage.getItem('user')
        if (!userData) {
            router.push('/login')
            return
        }

        const currentUser = JSON.parse(userData)
        setUser(currentUser)

        const { data } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    *,
                    products (name, price)
                )
            `)
            .eq('id', resolvedParams.id)
            .eq('user_id', currentUser.id)
            .single()

        if (data) {
            setOrder(data)
        } else {
            router.push('/orders')
        }
        setLoading(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black">
                <Navbar />
                <div className="flex items-center justify-center h-96">
                    <p className="text-white">Loading invoice...</p>
                </div>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-black">
                <Navbar />
                <div className="flex items-center justify-center h-96">
                    <p className="text-white">Invoice not found</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black">
            <Navbar />
            <div className="py-8">
                <Invoice order={order} user={user} />
            </div>
            <Footer />
        </div>
    )
}
```

**B. Admin Invoice Page**

**Create File:** `wc/app/admin/invoice/[id]/page.tsx`

```typescript
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { use } from 'react'
import Invoice from '@/components/Invoice'
import AdminNavbar from '@/components/AdminNavbar'

export default function AdminInvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadOrder()
    }, [])

    const loadOrder = async () => {
        const { data } = await supabase
            .from('orders')
            .select(`
                *,
                users (name, email, phone, address, city, state, zipcode),
                order_items (
                    *,
                    products (name, price)
                )
            `)
            .eq('id', resolvedParams.id)
            .single()

        if (data) {
            setOrder(data)
        }
        setLoading(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <AdminNavbar />
                <div className="flex items-center justify-center h-96">
                    <p>Loading invoice...</p>
                </div>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-white">
                <AdminNavbar />
                <div className="flex items-center justify-center h-96">
                    <p>Invoice not found</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            <AdminNavbar />
            <div className="py-8">
                <Invoice order={order} user={order.users} isAdmin={true} />
            </div>
        </div>
    )
}
```

---

### STEP 5: Add Download Button to Customer Orders

**File:** `wc/app/orders/page.tsx`

**Find the action section** (around line 280-320) and add the download button:

```typescript
<div className="space-y-3">
    {/* Main Action Button */}
    <div>
        {canCancelOrder(order) ? (
            // ... existing cancel button code ...
        ) : canReportIssue(order) ? (
            // ... existing issue button code ...
        ) : order.delivery_status === 'delivered' ? (
            // ... existing buy more button code ...
        ) : (
            // ... existing status message code ...
        )}
    </div>

    {/* Download Invoice Button - ADD THIS */}
    {order.payment_status === 'paid' && (
        <Link
            href={`/invoice/${order.id}`}
            target="_blank"
            className="block w-full bg-green-600 text-white py-2 md:py-3 rounded-full hover:bg-green-700 transition font-medium text-center text-sm md:text-base flex items-center justify-center gap-2"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Invoice
        </Link>
    )}

    {/* Tracking Number Section */}
    {order.tracking_number && (
        // ... existing tracking code ...
    )}
</div>
```

---

### STEP 6: Add Download Button to Admin Orders

**File:** `wc/app/admin/orders/page.tsx`

**Find the status management section** (around line 350-400) and add after tracking ID:

```typescript
{/* Status Management */}
<div className="space-y-4 mb-6">
    {/* Delivery Status dropdown */}
    {/* Payment Status dropdown */}
    {/* Tracking ID input */}
    
    {/* Download Invoice Button - ADD THIS */}
    {order.payment_status === 'paid' && (
        <div>
            <button
                onClick={() => window.open(`/admin/invoice/${order.id}`, '_blank')}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-bold flex items-center justify-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Invoice
            </button>
            <p className="text-xs text-gray-600 mt-1 text-center">
                Invoice includes shipping address for label printing
            </p>
        </div>
    )}
</div>
```

---

## 🎯 Final System Overview

### Coupon Flow
```
Customer adds items to cart
    ↓
Goes to Cart Page (no coupon shown)
    ↓
Clicks "Proceed to Checkout"
    ↓
Checkout Page (coupon available here)
    ↓
Applies coupon if desired
    ↓
Places order with discount
```

### Invoice Flow
```
Order placed and paid
    ↓
Customer/Admin sees "Download Invoice" button
    ↓
Clicks button
    ↓
Invoice opens in new tab
    ↓
Can print or save as PDF
```

---

## ✅ Implementation Checklist

### Coupon System
- [x] Cart page - No coupon display
- [x] Checkout page - Has coupon (already working)
- [x] Buy Now page - Has coupon (already working)

### Invoice System
- [ ] Create `wc/app/invoice/[id]/page.tsx`
- [ ] Create `wc/app/admin/invoice/[id]/page.tsx`
- [ ] Add download button to customer orders
- [ ] Add download button to admin orders
- [ ] Test customer invoice download
- [ ] Test admin invoice download
- [ ] Verify only shows for paid orders

---

## 📄 Files Summary

**Already Created:**
- ✅ `wc/components/Invoice.tsx` - Invoice component

**To Create:**
- 📄 `wc/app/invoice/[id]/page.tsx` - Customer invoice page
- 📄 `wc/app/admin/invoice/[id]/page.tsx` - Admin invoice page

**To Modify:**
- 📝 `wc/app/orders/page.tsx` - Add download button
- 📝 `wc/app/admin/orders/page.tsx` - Add download button

**No Changes Needed:**
- ✅ `wc/app/cart/page.tsx` - Already has no coupon
- ✅ `wc/app/checkout/page.tsx` - Already has coupon
- ✅ `wc/app/buynow/[id]/page.tsx` - Already has coupon

---

## 🎨 Visual Design

### Customer Orders - Download Button
```
┌─────────────────────────────────┐
│ Order #TWC-20241014-47823       │
│ Status: Delivered | Paid        │
├─────────────────────────────────┤
│ [Cancel Order] (if eligible)    │
│ [Download Invoice] ← GREEN      │
│ [Tracking ID Box]               │
└─────────────────────────────────┘
```

### Admin Orders - Download Button
```
┌─────────────────────────────────┐
│ Order Management                │
├─────────────────────────────────┤
│ Delivery Status: [Dropdown]     │
│ Payment Status: [Dropdown]      │
│ Tracking ID: [Input] [Save]    │
│ [Download Invoice] ← GREEN      │
│ (includes shipping address)     │
└─────────────────────────────────┘
```

---

## 🚀 Quick Start

1. **Create invoice pages** (copy code from Step 4)
2. **Add download buttons** (copy code from Steps 5 & 6)
3. **Test with paid order**
4. **Done!**

---

**Everything is ready to implement!** 🎉

**Key Points:**
- ✅ Coupons work in BOTH checkout pages
- ✅ No coupon in cart (apply at checkout)
- ✅ Invoice download for paid orders
- ✅ Works for both customer and admin
- ✅ Professional invoice with logo
- ✅ Print-optimized design
