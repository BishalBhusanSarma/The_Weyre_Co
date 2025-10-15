# Quick Start Guide - Delivery & Order System

## 🚀 Get Started in 3 Steps

### Step 1: Run Database Migration
Copy and paste this SQL in your Supabase SQL Editor:

```sql
-- Add delivery and RTO fields
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivery_charge DECIMAL(10, 2) DEFAULT 80.00,
ADD COLUMN IF NOT EXISTS rto_charge DECIMAL(10, 2) DEFAULT 0.00;

-- Update existing orders
UPDATE orders SET delivery_charge = 80.00 WHERE delivery_charge IS NULL;
UPDATE orders SET rto_charge = 80.00 WHERE delivery_status = 'return_refund';

-- Update order IDs to TWC format
UPDATE orders SET id = CONCAT('TWC-', id) WHERE id NOT LIKE 'TWC-%';
UPDATE order_items SET order_id = CONCAT('TWC-', order_id) WHERE order_id NOT LIKE 'TWC-%';
UPDATE coupon_usage SET order_id = CONCAT('TWC-', order_id) WHERE order_id NOT LIKE 'TWC-%';
```

### Step 2: Test Order Placement
1. Go to your website
2. Add items to cart
3. Go to checkout
4. Check "Test Mode (Skip Payment)"
5. Click "Place Test Order"
6. ✅ Order created with TWC-XXXXXXXXXXXX format

### Step 3: Verify Everything Works
- [ ] Order ID starts with "TWC-"
- [ ] Delivery charge shows as ₹80
- [ ] Order total includes delivery charge
- [ ] Test order appears in orders page
- [ ] Analytics dashboard shows correct numbers

## 📋 What Changed?

### Order IDs
- **Before**: `550e8400-e29b-41d4-a716-446655440000`
- **After**: `TWC-A7K9M2X4P1Q8`

### Pricing
- **Before**: Subtotal = Final Total
- **After**: Subtotal + ₹80 Delivery = Final Total

### Refunds
- **Before**: Full refund
- **After**: Refund - ₹80 RTO charge

## 🎯 Key Features

### 1. Delivery Charge (₹80)
```
Product: ₹1000
Discount: -₹200
Delivery: +₹80
--------------
Total: ₹880
```

### 2. RTO Charge (₹80)
```
Order Total: ₹880
RTO Charge: -₹80
--------------
Customer Refund: ₹800
```

### 3. Test Mode
- Skip payment gateway
- Create orders instantly
- Perfect for testing

### 4. Premium Order IDs
- TWC = The Weyre Co
- 12 random characters
- Professional look

## 🔍 Where to Find Changes

### Customer-Facing
- Checkout page: Delivery charge line item
- Buy now page: Delivery charge line item
- Orders page: TWC order IDs

### Admin-Facing
- Orders page: TWC order IDs
- Analytics: Delivery & RTO costs tracked
- Refunds: Automatic RTO deduction

## ⚠️ Important Notes

1. **Test Mode**: Only for testing, remove before production
2. **Delivery Charge**: Always ₹80, regardless of items
3. **RTO Charge**: Always ₹80, deducted from refunds
4. **Order IDs**: Cannot be changed once created

## 📞 Need Help?

Check these detailed guides:
- `IMPLEMENTATION_SUMMARY.md` - Quick overview
- `DELIVERY_RTO_ORDER_COMPLETE_GUIDE.md` - Full details
- `ORDER_FLOW_VISUAL_GUIDE.md` - Visual diagrams

## ✅ Checklist

Before going live:
- [ ] Database migration completed
- [ ] Test order placement works
- [ ] Order IDs have TWC prefix
- [ ] Delivery charge shows correctly
- [ ] Analytics dashboard updated
- [ ] Test mode disabled/restricted
- [ ] Refund flow tested
- [ ] Customer communication updated

## 🎉 You're All Set!

Your order system now has:
- ✅ Premium TWC order IDs
- ✅ ₹80 delivery charge per order
- ✅ ₹80 RTO charge on refunds
- ✅ Test mode for easy testing
- ✅ Accurate analytics tracking

Start testing and enjoy the new system! 🚀
