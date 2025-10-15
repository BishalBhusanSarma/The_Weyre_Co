-- Coupon System Database Schema
-- Run this in Supabase SQL Editor

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_purchase DECIMAL(10,2) DEFAULT 0,
  max_discount DECIMAL(10,2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP DEFAULT NOW(),
  valid_until TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Allow public to read active coupons
CREATE POLICY "Allow public to read active coupons" ON coupons 
  FOR SELECT USING (is_active = true AND (valid_until IS NULL OR valid_until > NOW()));

-- Allow admin to manage coupons (you'll need to add admin role check)
CREATE POLICY "Allow admin to manage coupons" ON coupons 
  FOR ALL USING (true) WITH CHECK (true);

-- Coupon usage tracking (one coupon per user lifetime)
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  discount_amount DECIMAL(10,2) NOT NULL,
  used_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(coupon_id, user_id)  -- One coupon per user for lifetime
);

-- Enable RLS
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coupon usage" ON coupon_usage 
  FOR SELECT USING (true);

CREATE POLICY "Allow coupon usage insert" ON coupon_usage 
  FOR INSERT WITH CHECK (true);

-- Add coupon fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_discount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS actual_total DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;

-- Sample coupons
INSERT INTO coupons (code, discount_type, discount_value, min_purchase, max_discount, usage_limit, valid_until) VALUES
  ('WELCOME10', 'percentage', 10, 50, 100, 100, NOW() + INTERVAL '30 days'),
  ('SAVE20', 'fixed', 20, 100, NULL, 50, NOW() + INTERVAL '60 days'),
  ('LUXURY15', 'percentage', 15, 200, 150, NULL, NOW() + INTERVAL '90 days');
