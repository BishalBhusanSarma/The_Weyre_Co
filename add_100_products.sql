-- SQL to add 100 products for testing "Show More" button
-- Run this after your existing products are in the database

-- First, let's create a temporary table with category IDs
WITH category_ids AS (
    SELECT id FROM categories LIMIT 4
),
-- Generate 100 products with random data
product_data AS (
    SELECT 
        gs.num,
        'Product ' || gs.num AS name,
        'Beautiful jewelry piece with intricate design and premium quality materials' AS description,
        (299.99 + (random() * 200))::numeric(10,2) AS price,
        (399.99 + (random() * 300))::numeric(10,2) AS actual_price,
        floor(random() * 50 + 10)::int AS stock,
        CASE 
            WHEN random() < 0.33 THEN 'men'
            WHEN random() < 0.66 THEN 'women'
            ELSE 'all'
        END AS gender,
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500' AS image_url,
        random() < 0.3 AS is_featured,
        random() < 0.2 AS is_trending,
        (SELECT id FROM category_ids ORDER BY random() LIMIT 1) AS category_id
    FROM generate_series(1, 100) AS gs(num)
)
-- Insert the products
INSERT INTO products (name, description, price, actual_price, stock, category_id, gender, image_url, is_featured, is_trending)
SELECT name, description, price, actual_price, stock, category_id, gender, image_url, is_featured, is_trending
FROM product_data;
