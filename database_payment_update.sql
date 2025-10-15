-- Database Updates for Payment and Order Management System
-- Run this in Supabase SQL Editor to update existing schema

-- Update orders table to include payment and delivery tracking
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS actual_total DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS coupon_discount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS payment_id TEXT,
ADD COLUMN IF NOT EXISTS cashfree_order_id TEXT,
ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'shipped', 'delivered', 'cancelled', 'return_refund')),
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS shipping_address TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(delivery_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Create issues/complaints table for post-delivery support
CREATE TABLE IF NOT EXISTS order_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  issue_type TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  admin_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_order_issues_order_id ON order_issues(order_id);
CREATE INDEX IF NOT EXISTS idx_order_issues_user_id ON order_issues(user_id);
CREATE INDEX IF NOT EXISTS idx_order_issues_status ON order_issues(status);

-- Enable RLS for order_issues
ALTER TABLE order_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own issues" ON order_issues FOR SELECT USING (true);
CREATE POLICY "Users can create own issues" ON order_issues FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own issues" ON order_issues FOR UPDATE USING (true);

-- Create payment transactions table for audit trail
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  payment_id TEXT,
  cashfree_order_id TEXT,
  cashfree_payment_id TEXT,
  transaction_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);

-- Enable RLS for payment_transactions
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON payment_transactions FOR SELECT USING (true);
CREATE POLICY "System can insert transactions" ON payment_transactions FOR INSERT WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for orders table
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for payment_transactions table
DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON payment_transactions;
CREATE TRIGGER update_payment_transactions_updated_at 
    BEFORE UPDATE ON payment_transactions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON COLUMN orders.payment_status IS 'Payment status: pending, paid, failed, refunded';
COMMENT ON COLUMN orders.delivery_status IS 'Delivery status: pending, shipped, delivered, cancelled, return_refund';
COMMENT ON COLUMN orders.delivered_at IS 'Timestamp when order was delivered (for 7-day issue window)';
COMMENT ON TABLE order_issues IS 'Customer issues/complaints for delivered orders (7-day window)';
COMMENT ON TABLE payment_transactions IS 'Audit trail for all payment transactions';
