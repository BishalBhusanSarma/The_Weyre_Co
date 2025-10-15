-- Update Jewelry to Jewellery across the database
-- Run this in Supabase SQL Editor

-- Update category names
UPDATE categories 
SET name = 'Jewellery' 
WHERE name = 'Jewelry';

-- Update product names
UPDATE products 
SET name = REPLACE(name, 'Jewelry', 'Jewellery')
WHERE name LIKE '%Jewelry%';

-- Update product descriptions (lowercase)
UPDATE products 
SET description = REPLACE(description, 'jewelry', 'jewellery')
WHERE description LIKE '%jewelry%';

-- Update product descriptions (capitalized)
UPDATE products 
SET description = REPLACE(description, 'Jewelry', 'Jewellery')
WHERE description LIKE '%Jewelry%';

-- Verify changes
SELECT 'Categories' as table_name, COUNT(*) as updated_count
FROM categories 
WHERE name = 'Jewellery'
UNION ALL
SELECT 'Products (names)', COUNT(*)
FROM products 
WHERE name LIKE '%Jewellery%'
UNION ALL
SELECT 'Products (descriptions)', COUNT(*)
FROM products 
WHERE description LIKE '%jewellery%' OR description LIKE '%Jewellery%';
