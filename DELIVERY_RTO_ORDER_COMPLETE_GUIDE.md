# Delivery Charge, RTO & Order System - Complete Implementation Guide

## Overview
Implemented ₹80 delivery charge system, RTO handling for refunds, TWC order ID format, and test order placement.

## 1. Order ID Format Update

### New Format: `TWC-{12 random alphanumeric}`
- **Example**: `TWC-A7K9M2X4P1Q8`
- **TWC** = The Weyre Co (premium branding)
- Generates 12 random uppercase letters and numbers

### Implementation
```typescript
// lib/generateOrderId.ts
export function generateOrderId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let randomStr = ''
    for (let i = 0; i < 12; i++) {
        randomStr += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return `TWC-${randomStr}`
}
```

## 2. Delivery Charge System (₹80 per order)

### Implementation Details
- **Charge**: ₹80 per order (not per item)
- **Applied to**: Both cart checkout and buy now
- **Display**: Shown as separate line item
- **Calculation**: Added to final total after discounts

### Checkout Flow
```
Subtotal: ₹1000
Product Discount: -₹200
Coupon Discount: -₹100
Delivery Charge: +₹80
-------------------
Final Total: ₹780
```

### Code Changes
- Added `DELIVERY_CHARGE = 80` constant
- Updated total calculation: `finalTotal = total - couponDiscount + DELIVERY_CHARGE`
- Added delivery_charge field to order creation
- Display changed from "Shipping: Free" to "Delivery Charge: ₹80"

## 3. RTO (Return to Origin) System

### What is RTO?
- When customer returns/refunds an order
- Business incurs ₹80 cost for return shipping
- Deducted from customer's refund amount

### RTO Handling
1. **Customer Refund**: Order Total - ₹80 RTO charge
2. **Business Cost**: ₹80 per refunded order
3. **Revenue Impact**: Subtract full order amount from revenue
4. **Profit Impact**: Additional ₹80 cost per refund

### Example
```
Order Total: ₹1000
Customer Refund: ₹920 (₹1000 - ₹80 RTO)
Business Loss: ₹1000 (revenue) + ₹80 (RTO cost) = ₹1080
```

### Database Fields
```sql
-- orders table
delivery_charge DECIMAL(10, 2) DEFAULT 80.00
rto_charge DECIMAL(10, 2) DEFAULT 0.00

-- When order is refunded:
UPDATE orders 
SET rto_charge = 80.00 
WHERE delivery_status = 'return_refund'
```

## 4. Test Order Placement

### Purpose
- Test order flow without payment gateway
- Verify order creation and data
- Check analytics calculations

### How to Use
1. Go to checkout or buy now page
2. Check "Test Mode (Skip Payment)" checkbox
3. Click "Place Test Order"
4. Order created with `payment_status = 'paid'`
5. Redirects to orders page

### Implementation
```typescript
const [testMode, setTestMode] = useState(false)

// In placeOrder function:
payment_status: testMode ? 'paid' : 'pending'

// After order creation:
if (testMode) {
    alert('Test order placed successfully!')
    router.push('/orders')
    return
}
```

## 5. Database Migration

### Run this SQL to update your database:
```sql
-- File: add_delivery_and_rto_fields.sql

-- Add new fields
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivery_charge DECIMAL(10, 2) DEFAULT 80.00;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS rto_charge DECIMAL(10, 2) DEFAULT 0.00;

-- Update existing orders
UPDATE orders 
SET delivery_charge = 80.00 
WHERE delivery_charge IS NULL;

-- Update RTO for refunded orders
UPDATE orders 
SET rto_charge = 80.00 
WHERE delivery_status = 'return_refund' AND rto_charge = 0.00;

-- Update order IDs to TWC format
UPDATE orders 
SET id = CONCAT('TWC-', id)
WHERE id NOT LIKE 'TWC-%';

UPDATE order_items 
SET order_id = CONCAT('TWC-', order_id)
WHERE order_id NOT LIKE 'TWC-%';

UPDATE coupon_usage 
SET order_id = CONCAT('TWC-', order_id)
WHERE order_id NOT LIKE 'TWC-%';
```

## 6. Analytics Impact

### Revenue Calculation
```typescript
// Total Revenue: Sum of all paid orders
totalRevenue = orders
    .filter(order => order.payment_status === 'paid')
    .reduce((total, order) => total + order.total, 0)

// Total Returns: Sum of refunded orders
totalReturns = orders
    .filter(order => order.delivery_status === 'return_refund')
    .reduce((total, order) => total + order.total, 0)

// Net Sales: Revenue - Returns
netSales = totalRevenue - totalReturns

// Delivery Charges: ₹80 × number of paid orders
totalDeliveryCharges = orders
    .filter(order => order.payment_status === 'paid')
    .reduce((total, order) => total + 80, 0)

// RTO Costs: ₹80 × number of refunded orders
totalRTOCosts = orders
    .filter(order => order.delivery_status === 'return_refund')
    .reduce((total, order) => total + 80, 0)

// Net Profit: Net Sales - Delivery Charges - RTO Costs
netProfit = netSales - totalDeliveryCharges - totalRTOCosts
```

## 7. Files Modified

### Core Files
1. `lib/generateOrderId.ts` - New order ID format
2. `app/checkout/page.tsx` - Delivery charge + test mode
3. `app/buynow/[id]/page.tsx` - Delivery charge + test mode
4. `lib/analyticsService.ts` - RTO calculations

### SQL Files
1. `add_delivery_and_rto_fields.sql` - Database migration

### Documentation
1. `DELIVERY_CHARGE_AND_ORDER_SYSTEM.md` - Overview
2. `DELIVERY_RTO_ORDER_COMPLETE_GUIDE.md` - This file

## 8. Testing Checklist

- [ ] Test cart checkout with delivery charge
- [ ] Test buy now with delivery charge
- [ ] Test order placement in test mode
- [ ] Verify order ID format (TWC-XXXXXXXXXXXX)
- [ ] Test coupon application with delivery charge
- [ ] Check order total calculations
- [ ] Verify analytics dashboard shows correct revenue
- [ ] Test refund flow (manual admin update)
- [ ] Check RTO charge deduction
- [ ] Verify existing orders updated with TWC prefix

## 9. Admin Actions for Refunds

When processing a refund:
1. Change `delivery_status` to "return_refund"
2. Change `payment_status` to "refunded"
3. System automatically:
   - Deducts ₹80 from customer refund
   - Adds ₹80 to RTO costs
   - Subtracts order amount from revenue

## 10. Customer Communication

### Order Confirmation
"Your order TWC-A7K9M2X4P1Q8 has been placed successfully!
Total: ₹780 (includes ₹80 delivery charge)"

### Refund Notification
"Your refund has been processed.
Order Total: ₹1000
RTO Charge: -₹80
Refund Amount: ₹920"

## 11. Important Notes

1. **Delivery Charge**: Always ₹80 per order, regardless of items
2. **RTO Charge**: Always ₹80, deducted from customer refund
3. **Test Mode**: Only for testing, remove before production
4. **Order IDs**: Cannot be changed once created
5. **Analytics**: Automatically updated with new calculations

## 12. Future Enhancements

- Variable delivery charges based on location
- Free delivery above certain order value
- RTO charge waiver for certain cases
- Bulk order discounts on delivery
- Express delivery option with higher charge
