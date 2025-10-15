# 🔧 Setup Dual Pricing - Step by Step

## ⚠️ IMPORTANT: You MUST run these SQL commands in Supabase!

The dual pricing is not showing because the `actual_price` field doesn't exist in your database yet.

## Step 1: Add actual_price Column

**Go to Supabase → SQL Editor → New Query**

Copy and paste this SQL:

```sql
-- Add actual_price column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS actual_price DECIMAL(10,2);

-- Set actual_price to 20% more than current price for existing products
UPDATE products SET actual_price = ROUND(price * 1.2, 2) WHERE actual_price IS NULL;

-- Make actual_price required
ALTER TABLE products ALTER COLUMN actual_price SET NOT NULL;

-- Add constraint to ensure actual_price >= price
ALTER TABLE products ADD CONSTRAINT IF NOT EXISTS check_actual_price_greater 
  CHECK (actual_price >= price);
```

Click **RUN** button.

## Step 2: Verify the Migration

Run this query to check if it worked:

```sql
SELECT id, name, actual_price, price, (actual_price - price) as discount 
FROM products 
LIMIT 5;
```

You should see:
- `actual_price` column with values
- `price` column with values
- `discount` showing the difference

## Step 3: Update Products in Admin Panel

Now go to your Admin Panel:
1. Visit `/admin/products`
2. Edit each product
3. You'll see two fields:
   - **Actual Price (Original)** - e.g., $100
   - **Selling Price (Discounted)** - e.g., $80
4. Set appropriate values
5. Save

## Step 4: Test Dual Pricing Display

Visit any product page:
- Men's Collection: `/products/men`
- Women's Collection: `/products/women`
- All Products: `/products`

You should now see:
```
$80.00  ← Selling Price (large, bold)
$100.00 ← Actual Price (smaller, strikethrough)
Save $20! ← Discount Badge (green)
20% OFF ← Discount Percentage
```

## 🐛 Troubleshooting:

### Issue: Still not showing dual pricing

**Check 1**: Verify database has actual_price
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'actual_price';
```

**Check 2**: Verify products have actual_price values
```sql
SELECT COUNT(*) as total, 
       COUNT(actual_price) as with_actual_price 
FROM products;
```

Both counts should be the same.

**Check 3**: Check if actual_price > price
```sql
SELECT name, actual_price, price 
FROM products 
WHERE actual_price <= price;
```

If any products have actual_price <= price, the discount won't show.

### Issue: Error when running migration

If you get "column already exists" error:
```sql
-- Just update existing products
UPDATE products 
SET actual_price = ROUND(price * 1.2, 2) 
WHERE actual_price IS NULL OR actual_price = 0;
```

### Issue: Constraint error

If you get constraint error:
```sql
-- Drop old constraint if exists
ALTER TABLE products DROP CONSTRAINT IF EXISTS check_actual_price_greater;

-- Add new constraint
ALTER TABLE products ADD CONSTRAINT check_actual_price_greater 
  CHECK (actual_price >= price);
```

## 📊 Sample Data for Testing:

If you want to manually set some products for testing:

```sql
-- Update specific products with dual pricing
UPDATE products 
SET actual_price = 3499.99, price = 2999.99 
WHERE name = 'Diamond Ring';

UPDATE products 
SET actual_price = 1799.99, price = 1499.99 
WHERE name = 'Gold Necklace';

UPDATE products 
SET actual_price = 699.99, price = 599.99 
WHERE name = 'Silver Bracelet';
```

## ✅ Verification Checklist:

- [ ] SQL migration ran successfully
- [ ] All products have actual_price values
- [ ] actual_price > price for products with discounts
- [ ] Admin panel shows two price fields
- [ ] Product cards show both prices
- [ ] Discount badge appears (green)
- [ ] Discount percentage shows

## 🎯 Expected Result:

After running the migration, every product card will show:

```
┌─────────────────────────────┐
│                             │
│      Product Image          │
│                             │
├─────────────────────────────┤
│ Category Name               │
│ Product Name                │
│                             │
│ $2,999.99  $3,499.99       │
│ ↑ Selling  ↑ Actual        │
│                             │
│ Save $500!  15% OFF        │
│ ↑ Badge     ↑ Percentage   │
│                             │
│ [Buy Now] [Add to Cart]    │
│ [♥ Wishlist]               │
└─────────────────────────────┘
```

## 🚀 Quick Test:

After running the migration, visit:
```
http://localhost:3000/products/men
```

You should immediately see the dual pricing on all product cards!

## 📝 Notes:

- The ProductCard component is already configured to show dual pricing
- It automatically calculates the discount
- It only shows the discount badge if actual_price > price
- If actual_price equals price, only one price is shown (no discount)

**Run the SQL migration now and the dual pricing will appear!**
