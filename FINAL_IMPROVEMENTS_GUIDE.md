# Final Improvements Implementation Guide

## All Changes Required

### 1. Shop by Categories in Profile Menu

**File: `components/Navbar.tsx`**

Add after Profile link in desktop menu:
```typescript
<button 
    onClick={() => setShowCategories(!showCategories)}
    className="block px-4 py-2 hover:bg-gray-100 text-left w-full"
>
    Shop by Categories →
</button>

{showCategories && (
    <div className="pl-4 border-l-2 border-gray-200">
        {categories.map(cat => (
            <Link 
                key={cat.id}
                href={`/products?category=${cat.id}`}
                onClick={() => {
                    setShowProfile(false)
                    setShowCategories(false)
                }}
                className="block px-4 py-2 hover:bg-gray-100 text-sm"
            >
                {cat.name}
            </Link>
        ))}
    </div>
)}
```

### 2. Custom Order ID Format: TWC-DATE-RANDOM-TIME

**File: `lib/orderUtils.ts`** (Create new file)
```typescript
export function generateOrderId(): string {
    const now = new Date()
    const date = now.toISOString().split('T')[0].replace(/-/g, '')
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '')
    const random = Math.floor(10000 + Math.random() * 90000)
    return `TWC-${date}-${random}-${time}`
}
```

**Update checkout and buynow pages:**
```typescript
import { generateOrderId } from '@/lib/orderUtils'

// In placeOrder function:
const customOrderId = generateOrderId()

const { data: order } = await supabase
    .from('orders')
    .insert([{
        id: customOrderId, // Add this
        user_id: user.id,
        // ... rest
    }])
```

### 3. Cancel Order (3-hour window)

**File: `app/orders/page.tsx`**

Add function:
```typescript
const canCancelOrder = (order: any) => {
    if (order.delivery_status !== 'pending' || order.payment_status !== 'paid') 
        return false
    
    const orderTime = new Date(order.created_at)
    const now = new Date()
    const hoursSinceOrder = (now.getTime() - orderTime.getTime()) / (1000 * 60 * 60)
    
    return hoursSinceOrder <= 3
}

const cancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    
    try {
        await supabase
            .from('orders')
            .update({ 
                delivery_status: 'cancelled',
                payment_status: 'refunded' 
            })
            .eq('id', orderId)
        
        alert('Order cancelled successfully!')
        loadOrders(user.id)
    } catch (error) {
        alert('Failed to cancel order')
    }
}
```

Add button in order card:
```typescript
{canCancelOrder(order) && (
    <button
        onClick={() => cancelOrder(order.id)}
        className="flex-1 bg-red-600 text-white py-2 rounded-full hover:bg-red-700"
    >
        Cancel Order
    </button>
)}
```

### 4. Custom Toast for Copy (No Alert)

**File: `app/orders/page.tsx`**

Add state:
```typescript
const [showToast, setShowToast] = useState(false)
const [toastMessage, setToastMessage] = useState('')
```

Update copy function:
```typescript
onClick={() => {
    navigator.clipboard.writeText(order.tracking_number)
    setToastMessage('Delivery ID copied! Paste it in "Delhivery" app')
    setShowToast(true)
}}
```

Add Toast component:
```typescript
{showToast && (
    <Toast 
        message={toastMessage}
        onClose={() => setShowToast(false)}
    />
)}
```

### 5. Change "Jewelry" to "Jewellery"

**SQL Update:**
```sql
UPDATE categories SET name = 'Jewellery' WHERE name = 'Jewelry';
UPDATE products SET name = REPLACE(name, 'Jewelry', 'Jewellery');
UPDATE products SET description = REPLACE(description, 'Jewelry', 'Jewellery');
```

### 6. Fix Order Processing Tag Alignment

**File: `app/orders/page.tsx`**

Update the status display:
```typescript
<div className="flex-1 bg-gray-800 text-gray-400 py-2 rounded-full text-center text-sm">
    {order.delivery_status === 'pending' && 'Processing Order'}
    {order.delivery_status === 'shipped' && 'Order Shipped'}
    {order.delivery_status === 'cancelled' && 'Order Cancelled'}
</div>
```

### 7. Enable Cashfree Payment

**File: `app/checkout/page.tsx` and `app/buynow/[id]/page.tsx`**

**REMOVE these lines:**
```typescript
alert('Order placed successfully! Payment integration will be added soon.')
router.push('/orders')
```

**UNCOMMENT these lines:**
```typescript
const cashfreeResponse = await fetch('/api/cashfree/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        orderId: order.id,
        orderAmount: total, // or finalTotal for buynow
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: user.phone || '9999999999'
    })
})

if (!cashfreeResponse.ok) {
    throw new Error('Failed to create payment order')
}

const cashfreeData = await cashfreeResponse.json()
window.location.href = cashfreeData.payment_link || cashfreeData.payment_session_id
```

**Add to `.env.local`:**
```env
NEXT_PUBLIC_CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Complete Implementation Steps

### Step 1: Create orderUtils.ts
```bash
# Create the file
touch wc/lib/orderUtils.ts
```

### Step 2: Update Database
```sql
-- Run in Supabase SQL Editor
UPDATE categories SET name = 'Jewellery' WHERE name = 'Jewelry';
```

### Step 3: Update Navbar
- Add categories state
- Add Shop by Categories menu
- Load categories on mount

### Step 4: Update Orders Page
- Add cancel order function
- Add 3-hour timer check
- Add Toast component
- Fix status alignment
- Update copy function

### Step 5: Enable Payment
- Add Cashfree credentials to .env.local
- Uncomment payment code in checkout
- Uncomment payment code in buynow
- Test payment flow

### Step 6: Update Order ID Generation
- Create orderUtils.ts
- Import in checkout and buynow
- Use generateOrderId() when creating orders

## Testing Checklist

- [ ] Shop by Categories shows in profile menu
- [ ] Categories load and link correctly
- [ ] Order ID format: TWC-20241014-12345-143022
- [ ] Can cancel order within 3 hours
- [ ] Cannot cancel after 3 hours
- [ ] Toast shows on copy (no alert)
- [ ] "Jewellery" spelling throughout
- [ ] Order status alignment fixed
- [ ] Payment redirects to Cashfree
- [ ] Payment success updates status

## Quick Fixes Summary

1. **Toast Component** - Created ✓
2. **Order Utils** - Need to create
3. **Navbar Categories** - Need to update
4. **Orders Cancel** - Need to add
5. **Jewellery Spelling** - Need SQL update
6. **Payment Enable** - Need to uncomment code
7. **Status Alignment** - Need to fix CSS

## Priority Order

1. Enable Payment (Most Important)
2. Fix Status Alignment
3. Add Cancel Order
4. Custom Order ID
5. Shop by Categories
6. Toast for Copy
7. Jewellery Spelling

Would you like me to implement these one by one, or would you prefer a specific feature first?
