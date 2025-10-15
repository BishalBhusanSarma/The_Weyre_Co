# Quick Fix: Return/Refund Error

## 🚨 Error
```
Failed to update order
```

## ✅ Fix (2 minutes)

### Run this in Supabase SQL Editor:

```sql
-- Drop old constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_delivery_status_check;

-- Add new constraint with return_refund
ALTER TABLE orders ADD CONSTRAINT orders_delivery_status_check 
CHECK (delivery_status IN ('pending', 'shipped', 'delivered', 'cancelled', 'return_refund'));

-- Update existing orders
UPDATE orders 
SET delivery_status = 'return_refund'
WHERE delivery_status = 'cancelled' 
  AND payment_status = 'refunded';
```

### That's it! ✅

Now you can:
- Select "Return/Refund" in admin dropdown
- Customer cancellations save correctly
- No more errors

---

## 🧪 Test

1. Go to `/admin/orders`
2. Change any order to "Return/Refund"
3. Should save successfully ✅

---

## 📁 Full Script

File: `add_return_refund_status.sql`

Contains the complete migration with verification steps.

---

**Problem:** Database didn't allow `return_refund` status
**Solution:** Updated database constraint
**Result:** Everything works! 🎉
