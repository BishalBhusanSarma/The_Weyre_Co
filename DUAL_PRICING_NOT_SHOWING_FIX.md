# 🔧 FIX: Dual Pricing Not Showing

## ⚠️ THE PROBLEM:

Dual pricing is not showing because the `actual_price` column doesn't exist in your database yet!

## ✅ THE SOLUTION:

You MUST run the SQL migration in Supabase to add the `actual_price` field.

## 📋 STEP-BY-STEP FIX:

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

### Step 2: Run This SQL

Copy and paste this ENTIRE script:

```sql
-- ============================================
-- ADD DUAL PRICING TO PRODUCTS TABLE
-- ============================================

-- Step 1: Add actual_price column
ALTER TABLE products ADD COLUMN IF NOT EXISTS actual_price DECIMAL(10,2);

-- Step 2: Set actual_price for existing products (20% higher than selling price)
UPDATE products 
SET actual_price = ROUND(price * 1.2, 2) 
WHERE actual_price IS NULL OR actual_price = 0;

-- Step 3: Make actual_price required
ALTER TABLE products ALTER COLUMN actual_price SET NOT NULL;

-- Step 4: Add constraint to ensure actual_price >= price
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_actual_price_greater'
    ) THEN
        ALTER TABLE products 
        ADD CONSTRAINT check_actual_price_greater 
        CHECK (actual_price >= price);
    END IF;
END $$;

-- Step 5: Verify the migration
SELECT 
    id,
    name,
    actual_price as "Actual Price",
    price as "Selling Price",
    (actual_price - price) as "Discount",
    ROUND(((actual_price - price) / actual_price * 100), 0) as "Discount %"
FROM products
LIMIT 5;
```

### Step 3: Click RUN

Click the "RUN" button in Supabase SQL Editor.

### Step 4: Verify Success

You should see output showing:
- Actual Price
- Selling Price  
- Discount
- Discount %

Example output:
```
name              | Actual Price | Selling Price | Discount | Discount %
------------------|--------------|---------------|----------|------------
Diamond Ring      | 3599.88      | 2999.99       | 599.89   | 17
Gold Necklace     | 1799.99      | 1499.99       | 300.00   | 17
Silver Bracelet   | 719.99       | 599.99        | 120.00   | 17
```

## 🎯 AFTER RUNNING THE MIGRATION:

### Immediately Test:

1. Visit: `http://localhost:3000/products/men`
2. You should NOW see dual pricing on every product card:

```
┌─────────────────────────┐
│                         │
│    Product Image        │
│                         │
├─────────────────────────┤
│ Rings                   │ ← Category
│ Diamond Ring            │ ← Name
│                         │
│ $2,999.99  $3,599.88   │ ← Selling | Actual
│ Save $599.89!           │ ← Discount Badge
│ 17% OFF                 │ ← Percentage
│                         │
│ [Buy Now] [Add to Cart] │
│ [♥ Wishlist]            │
└─────────────────────────┘
```

### What You'll See:

✅ **Selling Price** - Large, bold (e.g., $2,999.99)
✅ **Actual Price** - Smaller, strikethrough (e.g., $3,599.88)
✅ **Discount Badge** - Green badge showing savings (e.g., "Save $599.89!")
✅ **Discount Percentage** - Shows % off (e.g., "17% OFF")

## 🔍 TROUBLESHOOTING:

### Still Not Showing?

**Check 1**: Verify column exists
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'actual_price';
```

Expected result: Should show `actual_price | numeric | NO`

**Check 2**: Verify products have values
```sql
SELECT 
    COUNT(*) as total_products,
    COUNT(actual_price) as products_with_actual_price,
    COUNT(CASE WHEN actual_price > price THEN 1 END) as products_with_discount
FROM products;
```

All three numbers should be the same.

**Check 3**: Check specific product
```sql
SELECT id, name, actual_price, price, (actual_price - price) as discount
FROM products
WHERE name LIKE '%Ring%'
LIMIT 1;
```

Should show actual_price > price.

### If Migration Fails:

**Error: "column already exists"**
```sql
-- Just update the values
UPDATE products 
SET actual_price = ROUND(price * 1.2, 2) 
WHERE actual_price IS NULL OR actual_price = 0 OR actual_price <= price;
```

**Error: "constraint already exists"**
```sql
-- Drop and recreate
ALTER TABLE products DROP CONSTRAINT IF EXISTS check_actual_price_greater;
ALTER TABLE products ADD CONSTRAINT check_actual_price_greater CHECK (actual_price >= price);
```

## 📝 MANUAL PRODUCT UPDATE:

After migration, you can set custom prices in Admin Panel:

1. Go to `/admin/products`
2. Click "Edit" on any product
3. You'll see two fields:
   - **Actual Price (Original)** - Set to $100
   - **Selling Price (Discounted)** - Set to $80
4. Save

The discount ($20 and 20% OFF) will automatically calculate and display!

## ✅ VERIFICATION CHECKLIST:

- [ ] SQL migration ran without errors
- [ ] Verification query shows actual_price values
- [ ] Visit `/products/men` - see dual pricing
- [ ] Visit `/products/women` - see dual pricing  
- [ ] Visit `/products` - see dual pricing
- [ ] Discount badge shows (green)
- [ ] Discount percentage shows
- [ ] Actual price has strikethrough
- [ ] Selling price is bold and large

## 🎉 SUCCESS!

Once you run the SQL migration, dual pricing will immediately appear on:
- ✅ Men's Collection
- ✅ Women's Collection
- ✅ All Products Page
- ✅ Homepage (when you update it)
- ✅ Product Detail Pages (when you update them)

**The ProductCard component is already configured - you just need the database field!**

---

## 📞 NEED HELP?

If dual pricing still doesn't show after running the migration:

1. Check browser console for errors (F12)
2. Verify the SQL migration completed successfully
3. Check that products have actual_price > price
4. Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
5. Restart your dev server (`npm run dev`)

**Run the SQL migration now and dual pricing will work!** 🚀
