# Checkout Pages Quick Reference

## Two Separate Checkout Systems

### 1. Buy Now Quick Checkout
**Route**: `/buynow/[id]/checkout`
**Purpose**: Fast checkout for single product purchase

**Features**:
- Single product only
- Quantity from Buy Now page
- Coupon application
- Test mode
- Payment processing

**Navigation**:
```
Product Page → Buy Now → /buynow/[id] → Proceed to Checkout → /buynow/[id]/checkout → Payment
```

### 2. Cart Checkout
**Route**: `/checkout`
**Purpose**: Checkout for all cart items

**Features**:
- Multiple products
- Quantities from cart
- Coupon application
- Test mode
- Payment processing
- Cart clearing

**Navigation**:
```
Product Page → Add to Cart → /cart → Proceed to Checkout → /checkout → Payment
```

## Key Differences

| Feature | Buy Now Checkout | Cart Checkout |
|---------|------------------|---------------|
| Route | `/buynow/[id]/checkout` | `/checkout` |
| Products | Single product | Multiple products |
| Data Source | URL parameter + localStorage | Database cart table |
| Quantity | From Buy Now page | From cart |
| Back Button | Back to Buy Now page | Back to cart |
| After Order | Clears localStorage | Clears cart database |

## File Locations

```
wc/app/
├── buynow/
│   └── [id]/
│       ├── page.tsx                    # Buy Now product selection
│       └── checkout/
│           └── page.tsx                # Buy Now checkout ✨
└── checkout/
    └── page.tsx                        # Cart checkout
```

## Common Features (Both Pages)

✅ Same price calculation logic
✅ Same coupon validation
✅ Same delivery charge display (₹80 shown, discounted)
✅ Same order creation structure
✅ Same payment processing
✅ Same test mode functionality
✅ Same UI styling

## Troubleshooting

### If you see "Module not found" error:
1. Delete `.next` folder: `rm -rf .next`
2. Restart dev server: `npm run dev`

### If Buy Now shows cart items:
- Check you're on `/buynow/[id]/checkout` not `/checkout`
- Clear browser localStorage
- Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

### If checkout page is blank:
- Check user is logged in
- Check cart has items (for cart checkout)
- Check product exists (for buy now checkout)
- Check browser console for errors

## Testing Commands

```bash
# Clear Next.js cache
rm -rf .next

# Check for TypeScript errors
npm run build

# Run dev server
npm run dev
```

## Quick Test Checklist

### Buy Now Checkout:
- [ ] Navigate to `/buynow/[product-id]`
- [ ] Adjust quantity
- [ ] Click "Proceed to Checkout"
- [ ] Verify URL is `/buynow/[product-id]/checkout`
- [ ] Verify only one product shows
- [ ] Apply coupon
- [ ] Place order

### Cart Checkout:
- [ ] Add items to cart
- [ ] Navigate to `/cart`
- [ ] Click "Proceed to Checkout"
- [ ] Verify URL is `/checkout`
- [ ] Verify all cart items show
- [ ] Apply coupon
- [ ] Place order

## Summary

✅ Two completely separate checkout pages
✅ No code overlap or interference
✅ Same billing logic in both
✅ Clear navigation paths
✅ Easy to maintain and test
