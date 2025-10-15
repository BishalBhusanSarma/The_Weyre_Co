-- Add delivery charge and RTO charge fields to orders table

-- Add delivery_charge field (default 80)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivery_charge DECIMAL(10, 2) DEFAULT 80.00;

-- Add rto_charge field (for return to origin costs)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS rto_charge DECIMAL(10, 2) DEFAULT 0.00;

-- Update existing orders to have delivery charge
UPDATE orders 
SET delivery_charge = 80.00 
WHERE delivery_charge IS NULL;

-- Update RTO charge for refunded orders
UPDATE orders 
SET rto_charge = 80.00 
WHERE delivery_status = 'return_refund' AND rto_charge = 0.00;

-- Update existing order IDs to TWC format
-- This will prefix all existing order IDs with TWC-
UPDATE orders 
SET id = CONCAT('TWC-', id)
WHERE id NOT LIKE 'TWC-%';

-- Update order_items to match new order IDs
UPDATE order_items 
SET order_id = CONCAT('TWC-', order_id)
WHERE order_id NOT LIKE 'TWC-%';

-- Update coupon_usage to match new order IDs
UPDATE coupon_usage 
SET order_id = CONCAT('TWC-', order_id)
WHERE order_id NOT LIKE 'TWC-%';

-- Add comment to delivery_charge column
COMMENT ON COLUMN orders.delivery_charge IS 'Delivery charge per order (₹80)';

-- Add comment to rto_charge column
COMMENT ON COLUMN orders.rto_charge IS 'RTO (Return to Origin) charge deducted from refunds (₹80)';
