# Disable RLS - Quick Fix

## Why Disable RLS?

Your app uses **localStorage authentication**, not Supabase Auth. This means:
- ❌ RLS policies can't identify users properly
- ❌ `auth.uid()` returns null (no Supabase session)
- ❌ Operations fail even with `USING (true)` policies
- ❌ Cart, wishlist, orders won't work

## Quick Fix

### Step 1: Run This SQL in Supabase

Go to Supabase Dashboard → SQL Editor → New Query → Paste this:

```sql
-- Disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE cart DISABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage DISABLE ROW LEVEL SECURITY;
```

Click **Run** → Done!

### Step 2: Test

1. Try adding item to cart
2. Should work immediately
3. Check cart page - items should appear

## Security Note

⚠️ **Without RLS, your data is accessible to anyone with your Supabase URL and anon key.**

### For Development:
- ✅ Disable RLS (current approach)
- ✅ Keep anon key secret
- ✅ Use environment variables

### For Production:
You have 2 options:

**Option 1: Keep localStorage Auth (Quick)**
- Disable RLS
- Add server-side API routes for sensitive operations
- Validate user sessions on backend
- Use service role key only on server

**Option 2: Migrate to Supabase Auth (Recommended)**
- Enable RLS
- Migrate from localStorage to Supabase Auth
- Proper security with session management
- I can help with this migration!

## Current Status

After disabling RLS:
- ✅ Cart will work
- ✅ Wishlist will work
- ✅ Orders will work
- ✅ All CRUD operations will work
- ⚠️ Data is accessible (but you control the anon key)

## Next Steps

1. **Immediate**: Disable RLS (run the SQL above)
2. **Short-term**: Test all features
3. **Long-term**: Plan migration to Supabase Auth

## Need Help?

If you want to migrate to Supabase Auth for proper security, let me know! I can update all the authentication code.
