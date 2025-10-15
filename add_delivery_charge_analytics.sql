-- Add delivery_charge column and indexes for Admin Analytics Dashboard
-- Run this in Supabase SQL Editor

-- STEP 1: Add delivery_charge column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivery_charge DECIMAL(10, 2) DEFAULT 0;

-- STEP 2: Update existing orders with default delivery charge (₹50)
UPDATE orders 
SET delivery_charge = 50.00 
WHERE delivery_charge = 0 OR delivery_charge IS NULL;

-- STEP 3: Add return_refund_status column for RTO tracking
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS return_refund_status TEXT DEFAULT 'none' 
CHECK (return_refund_status IN ('none', 'requested', 'approved', 'rejected', 'rto'));

-- STEP 4: Migrate existing return_refund orders to use return_refund_status
UPDATE orders 
SET return_refund_status = 'approved'
WHERE delivery_status = 'return_refund' AND return_refund_status = 'none';

-- STEP 5: Set RTO status for cancelled orders that were refunded
UPDATE orders 
SET return_refund_status = 'rto'
WHERE delivery_status = 'cancelled' 
  AND payment_status = 'refunded'
  AND return_refund_status = 'none';

-- STEP 6: Add order_id column for human-readable order IDs
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_id TEXT UNIQUE;

-- STEP 7: Create indexes for optimized analytics queries
CREATE INDEX IF NOT EXISTS idx_orders_created_at_analytics ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status_analytics ON orders(payment_status) WHERE payment_status = 'paid';
CREATE INDEX IF NOT EXISTS idx_orders_return_status_analytics ON orders(return_refund_status) WHERE return_refund_status != 'none';
CREATE INDEX IF NOT EXISTS idx_orders_delivery_charge ON orders(delivery_charge);

-- STEP 8: Create composite index for date-range queries
CREATE INDEX IF NOT EXISTS idx_orders_date_payment ON orders(created_at, payment_status);

-- STEP 9: Add comments for documentation
COMMENT ON COLUMN orders.delivery_charge IS 'Delivery/shipping charge for the order (default ₹50)';
COMMENT ON COLUMN orders.return_refund_status IS 'Return/Refund status: none, requested, approved, rejected, rto (Return to Origin)';
COMMENT ON COLUMN orders.order_id IS 'Human-readable order ID (e.g., ORD-20241214-001)';

-- STEP 10: Verify the changes
SELECT 
    COUNT(*) as total_orders,
    COUNT(CASE WHEN delivery_charge > 0 THEN 1 END) as orders_with_delivery_charge,
    AVG(delivery_charge) as avg_delivery_charge,
    COUNT(CASE WHEN return_refund_status = 'rto' THEN 1 END) as rto_orders,
    COUNT(CASE WHEN return_refund_status = 'approved' THEN 1 END) as approved_returns
FROM orders;

-- STEP 11: Show sample data
SELECT 
    id,
    order_id,
    created_at,
    total,
    delivery_charge,
    payment_status,
    delivery_status,
    return_refund_status
FROM orders
ORDER BY created_at DESC
LIMIT 10;
