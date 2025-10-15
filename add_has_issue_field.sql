-- Add has_issue field to orders table
-- Run this in Supabase SQL Editor

-- Add has_issue column to track when customer reports an issue
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS has_issue BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS issue_reported_at TIMESTAMP;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_orders_has_issue ON orders(has_issue);

-- Add comment for documentation
COMMENT ON COLUMN orders.has_issue IS 'True when customer clicks "Having an Issue?" button';
COMMENT ON COLUMN orders.issue_reported_at IS 'Timestamp when customer reported the issue';

-- Verify the changes
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name IN ('has_issue', 'issue_reported_at');
