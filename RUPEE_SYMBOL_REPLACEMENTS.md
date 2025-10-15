# Rupee Symbol Replacement Guide

Replace all `$` with `₹` in price displays across the website.

## Files to Update:
1. ✅ components/ProductCard.tsx - DONE
2. ✅ app/page.tsx - DONE (carousel)
3. app/cart/page.tsx
4. app/wishlist/page.tsx
5. app/checkout/page.tsx
6. app/buynow/[id]/page.tsx
7. app/products/[id]/page.tsx
8. components/AddToCartPopup.tsx

## Pattern to Replace:
- `${price}` → `₹{price}`
- `${amount.toFixed(2)}` → `₹{amount.toFixed(2)}`
- `$${variable}` → `₹${variable}`

## Note:
Keep `$` in template literals like `href={`/products/${id}`}` - these are NOT prices!
