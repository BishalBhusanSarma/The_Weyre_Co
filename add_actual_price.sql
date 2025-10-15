-- Migration to add actual_price column to products table
-- Run this in Supabase SQL Editor if you already have the database set up

-- Add actual_price column
ALTER TABLE products ADD COLUMN IF NOT EXISTS actual_price DECIMAL(10,2);

-- Update existing products to have actual_price = price * 1.2 (20% discount)
UPDATE products SET actual_price = price * 1.2 WHERE actual_price IS NULL;

-- Make actual_price NOT NULL after setting values
ALTER TABLE products ALTER COLUMN actual_price SET NOT NULL;

-- Add constraint to ensure actual_price >= price
ALTER TABLE products ADD CONSTRAINT check_actual_price_greater CHECK (actual_price >= price);
