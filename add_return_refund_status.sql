-- Add return_refund as a valid delivery status
-- Run this in Supabase SQL Editor

-- STEP 1: Drop the existing CHECK constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_delivery_status_check;

-- STEP 2: Add the new constraint with return_refund included
ALTER TABLE orders ADD CONSTRAINT orders_delivery_status_check 
CHECK (delivery_status IN ('pending', 'shipped', 'delivered', 'cancelled', 'return_refund'));

-- STEP 3: Update existing cancelled orders with refunded payment to return_refund status
UPDATE orders 
SET delivery_status = 'return_refund'
WHERE delivery_status = 'cancelled' 
  AND payment_status = 'refunded';

-- STEP 4: Verify the changes
SELECT 
    delivery_status,
    COUNT(*) as count
FROM orders
GROUP BY delivery_status
ORDER BY delivery_status;

-- STEP 5: Show return/refund orders
SELECT 
    id,
    created_at,
    delivery_status,
    payment_status,
    total
FROM orders
WHERE delivery_status = 'return_refund'
ORDER BY created_at DESC
LIMIT 10;

-- STEP 6: Update the comment for documentation
COMMENT ON COLUMN orders.delivery_status IS 'Delivery status: pending, shipped, delivered, cancelled, return_refund';
