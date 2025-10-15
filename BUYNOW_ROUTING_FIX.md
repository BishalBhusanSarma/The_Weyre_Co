# Buy Now Routing Fix

## Issue
The Buy Now button was redirecting to `/checkout` (cart checkout) instead of `/buynow/${productId}` (quick checkout).

## Root Cause
All `buyNow` functions across multiple pages were using the old implementation that:
1. Stored data in `localStorage` as `buynow_checkout`
2. Redirected to `/checkout` (cart checkout page)

This was incorrect because:
- `/checkout` is for cart items only
- `/buynow/${productId}` is for single product quick checkout

## Files Fixed

### 1. `wc/app/page.tsx`
**Before:**
```typescript
const buyNow = async (productId: string, e: React.MouseEvent) => {
    // ...
    localStorage.setItem('buynow_checkout', JSON.stringify({
        productId,
        quantity: 1
    }))
    router.push('/checkout')  // ❌ Wrong - goes to cart checkout
}
```

**After:**
```typescript
const buyNow = async (productId: string, e: React.MouseEvent) => {
    // ...
    localStorage.setItem(`buynow_quantity_${productId}`, '1')
    router.push(`/buynow/${productId}`)  // ✅ Correct - goes to buy now page
}
```

### 2. `wc/app/products/page.tsx`
- Fixed same issue as above

### 3. `wc/app/products/men/page.tsx`
- Fixed same issue as above

### 4. `wc/app/products/women/page.tsx`
- Fixed same issue as above

### 5. `wc/app/wishlist/page.tsx`
- Fixed same issue as above
- Added missing user check

## Correct Flow Now

### Buy Now Flow (Single Product)
1. User clicks "Buy Now" button
2. `buyNow()` function:
   - Saves quantity: `localStorage.setItem('buynow_quantity_${productId}', '1')`
   - Redirects to: `/buynow/${productId}`
3. `/buynow/${productId}` page:
   - Shows single product with quantity selector
   - Displays order summary
   - "Proceed to Checkout" button → `/buynow/${productId}/checkout`
4. `/buynow/${productId}/checkout` page:
   - Billing form
   - Payment processing
   - Order creation

### Cart Checkout Flow (Multiple Products)
1. User adds products to cart
2. User goes to `/cart`
3. User clicks "Proceed to Checkout"
4. Redirects to: `/checkout`
5. `/checkout` page:
   - Shows all cart items
   - Billing form
   - Payment processing
   - Order creation

## Key Differences

| Feature | Buy Now | Cart Checkout |
|---------|---------|---------------|
| Route | `/buynow/${productId}` | `/checkout` |
| Products | Single product only | Multiple cart items |
| Data Source | Product ID + quantity | Cart table in database |
| localStorage Key | `buynow_quantity_${productId}` | None (uses DB) |
| Intermediate Page | Yes (`/buynow/${productId}`) | No (direct from cart) |

## Testing Checklist

- [ ] Click "Buy Now" from home page → Goes to `/buynow/${productId}`
- [ ] Click "Buy Now" from products page → Goes to `/buynow/${productId}`
- [ ] Click "Buy Now" from men's page → Goes to `/buynow/${productId}`
- [ ] Click "Buy Now" from women's page → Goes to `/buynow/${productId}`
- [ ] Click "Buy Now" from wishlist → Goes to `/buynow/${productId}`
- [ ] Click "Buy Now" from product detail → Goes to `/buynow/${productId}`
- [ ] Cart "Proceed to Checkout" → Goes to `/checkout`
- [ ] Buy Now checkout completes successfully
- [ ] Cart checkout completes successfully

## Notes

- The old `buynow_checkout` localStorage key is automatically cleaned up in `/buynow/${productId}/page.tsx`
- Each page maintains its own `buyNow` function for flexibility
- User authentication is checked before redirecting
- Quantity is preserved through localStorage during navigation
