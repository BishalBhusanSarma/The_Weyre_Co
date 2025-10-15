# URGENT FIXES - COPY & PASTE SOLUTION

## 🚨 FIX 1: Checkout Page Error (CRITICAL)

**File:** `wc/app/checkout/page.tsx`

**Problem:** Line 246 error - `appliedCoupon is not defined`

**Solution:** Find line ~16 where state variables are declared and make sure these lines exist:

```typescript
export default function Checkout() {
    const [cartItems, setCartItems] = useState<any[]>([])
    const [user, setUser] = useState<any>(null)
    const [total, setTotal] = useState(0)
    const [actualTotal, setActualTotal] = useState(0)
    const [productDiscount, setProductDiscount] = useState(0)
    const [couponCode, setCouponCode] = useState('')           // ADD THIS
    const [couponDiscount, setCouponDiscount] = useState(0)    // ADD THIS
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null)  // ADD THIS
    const [couponError, setCouponError] = useState('')         // ADD THIS
    const [loading, setLoading] = useState(true)
    const router = useRouter()
```

**If these 4 lines are missing, ADD THEM!**

---

## 🚨 FIX 2: Remove Coupon from Cart Page

**File:** `wc/app/cart/page.tsx`

**Search for:** Any coupon-related code in the cart page

**Action:** If you find coupon input fields or coupon application code in cart, DELETE IT.

**Cart should only have:**
- Product list
- Subtotal
- "Proceed to Checkout" button

---

## 🚨 FIX 3: Create Invoice Pages

### A. Customer Invoice Page

**Create New File:** `wc/app/invoice/[id]/page.tsx`

**Copy this ENTIRE code:**

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
            <div className="min-h-screen bg-black flex items-center justify-center">
                <p className="text-white">Loading invoice...</p>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <p className="text-white">Invoice not found</p>
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

### B. Admin Invoice Page

**Create New File:** `wc/app/admin/invoice/[id]/page.tsx`

**Copy this ENTIRE code:**

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
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p>Loading invoice...</p>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p>Invoice not found</p>
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

## 🚨 FIX 4: Add Download Button to Customer Orders

**File:** `wc/app/orders/page.tsx`

**Find:** The section with action buttons (around line 280-320)

**Look for:** `<div className="space-y-3">`

**Add this code INSIDE that div, AFTER the main action button, BEFORE tracking:**

```typescript
{/* Download Invoice Button */}
{order.payment_status === 'paid' && (
    <button
        onClick={() => window.open(`/invoice/${order.id}`, '_blank')}
        className="w-full bg-green-600 text-white py-2 md:py-3 rounded-full hover:bg-green-700 transition font-medium text-sm md:text-base flex items-center justify-center gap-2"
    >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Download Invoice
    </button>
)}
```

---

## 🚨 FIX 5: Add Download Button to Admin Orders

**File:** `wc/app/admin/orders/page.tsx`

**Find:** The section with status management (around line 350-400)

**Look for:** The tracking ID section

**Add this code AFTER the tracking ID div:**

```typescript
{/* Download Invoice Button */}
{order.payment_status === 'paid' && (
    <div className="mt-4">
        <button
            onClick={() => window.open(`/admin/invoice/${order.id}`, '_blank')}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-bold flex items-center justify-center gap-2"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Invoice (PDF)
        </button>
        <p className="text-xs text-gray-600 mt-1 text-center">
            Opens in new tab - Use Ctrl+P to print/save as PDF
        </p>
    </div>
)}
```

---

## ✅ VERIFICATION CHECKLIST

After making changes:

1. **Checkout Error Fixed?**
   - [ ] Go to cart
   - [ ] Click "Proceed to Checkout"
   - [ ] Page loads without error
   - [ ] Coupon section visible

2. **Cart Coupon Removed?**
   - [ ] Go to cart page
   - [ ] No coupon input visible
   - [ ] Only products and checkout button

3. **Invoice Pages Created?**
   - [ ] File exists: `wc/app/invoice/[id]/page.tsx`
   - [ ] File exists: `wc/app/admin/invoice/[id]/page.tsx`

4. **Download Buttons Added?**
   - [ ] Customer orders: Green "Download Invoice" button for paid orders
   - [ ] Admin orders: Green "Download Invoice (PDF)" button for paid orders

5. **PDF Download Works?**
   - [ ] Click download button
   - [ ] Invoice opens in new tab
   - [ ] Click "Print Invoice" button
   - [ ] Can save as PDF

---

## 📄 HOW TO SAVE AS PDF

1. Click "Download Invoice" button
2. Invoice opens in new tab
3. Click the "🖨️ Print Invoice" button (or press Ctrl+P / Cmd+P)
4. In print dialog, select "Save as PDF" as destination
5. Click "Save"
6. Choose location and filename
7. Done!

---

## 🎯 SUMMARY

**Files to Create (2):**
1. `wc/app/invoice/[id]/page.tsx`
2. `wc/app/admin/invoice/[id]/page.tsx`

**Files to Modify (3):**
1. `wc/app/checkout/page.tsx` - Add coupon state variables
2. `wc/app/orders/page.tsx` - Add download button
3. `wc/app/admin/orders/page.tsx` - Add download button

**Files to Check (1):**
1. `wc/app/cart/page.tsx` - Remove coupon if present

---

**COPY THE CODE EXACTLY AS SHOWN ABOVE!** 🎉

Everything will work after these changes!
