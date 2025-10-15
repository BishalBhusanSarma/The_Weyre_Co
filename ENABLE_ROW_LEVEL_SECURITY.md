# Enable Row Level Security (RLS) Guide

## What is Row Level Security?

Row Level Security (RLS) is a PostgreSQL feature that allows you to control which rows users can access in your database tables. Without RLS, anyone with your Supabase URL and anon key can read/write ALL data.

## Current Security Risk ⚠️

**Without RLS enabled**:
- Anyone can read all users' data
- Anyone can modify orders, products, coupons
- Anyone can see all customer information
- No protection against malicious users

**With RLS enabled**:
- Users can only see their own data
- Admin operations require proper authentication
- Database enforces security at the row level
- Protection against unauthorized access

## Implementation Steps

### Step 1: Enable RLS on All Tables

Run these SQL commands in Supabase SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
```

### Step 2: Create RLS Policies

#### Users Table Policies

```sql
-- Users can read their own data
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (id = auth.uid());

-- Users can update their own data
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (id = auth.uid());

-- Allow user registration (insert)
CREATE POLICY "Anyone can create user"
ON users FOR INSERT
WITH CHECK (true);

-- Admin can view all users
CREATE POLICY "Admin can view all users"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Admin can update any user
CREATE POLICY "Admin can update any user"
ON users FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);
```

#### Products & Categories (Public Read, Admin Write)

```sql
-- Anyone can view products
CREATE POLICY "Anyone can view products"
ON products FOR SELECT
USING (true);

-- Admin can manage products
CREATE POLICY "Admin can insert products"
ON products FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "Admin can update products"
ON products FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "Admin can delete products"
ON products FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Anyone can view categories
CREATE POLICY "Anyone can view categories"
ON categories FOR SELECT
USING (true);

-- Admin can manage categories
CREATE POLICY "Admin can manage categories"
ON categories FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);
```

#### Cart Policies

```sql
-- Users can view their own cart
CREATE POLICY "Users can view own cart"
ON cart FOR SELECT
USING (user_id = auth.uid());

-- Users can add to their cart
CREATE POLICY "Users can add to cart"
ON cart FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their cart
CREATE POLICY "Users can update own cart"
ON cart FOR UPDATE
USING (user_id = auth.uid());

-- Users can delete from their cart
CREATE POLICY "Users can delete from cart"
ON cart FOR DELETE
USING (user_id = auth.uid());
```

#### Wishlist Policies

```sql
-- Users can view their own wishlist
CREATE POLICY "Users can view own wishlist"
ON wishlist FOR SELECT
USING (user_id = auth.uid());

-- Users can add to wishlist
CREATE POLICY "Users can add to wishlist"
ON wishlist FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can delete from wishlist
CREATE POLICY "Users can delete from wishlist"
ON wishlist FOR DELETE
USING (user_id = auth.uid());
```

#### Orders Policies

```sql
-- Users can view their own orders
CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
USING (user_id = auth.uid());

-- Users can create orders
CREATE POLICY "Users can create orders"
ON orders FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their own orders (for cancellation)
CREATE POLICY "Users can update own orders"
ON orders FOR UPDATE
USING (user_id = auth.uid());

-- Admin can view all orders
CREATE POLICY "Admin can view all orders"
ON orders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Admin can update any order
CREATE POLICY "Admin can update any order"
ON orders FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);
```

#### Order Items Policies

```sql
-- Users can view their own order items
CREATE POLICY "Users can view own order items"
ON order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

-- Users can create order items
CREATE POLICY "Users can create order items"
ON order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

-- Admin can view all order items
CREATE POLICY "Admin can view all order items"
ON order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);
```

#### Coupons Policies

```sql
-- Anyone can view active coupons (for validation)
CREATE POLICY "Anyone can view active coupons"
ON coupons FOR SELECT
USING (is_active = true);

-- Admin can manage coupons
CREATE POLICY "Admin can manage coupons"
ON coupons FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);
```

#### Coupon Usage Policies

```sql
-- Users can view their own coupon usage
CREATE POLICY "Users can view own coupon usage"
ON coupon_usage FOR SELECT
USING (user_id = auth.uid());

-- Users can create coupon usage
CREATE POLICY "Users can create coupon usage"
ON coupon_usage FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Admin can view all coupon usage
CREATE POLICY "Admin can view all coupon usage"
ON coupon_usage FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);
```

### Step 3: Update Your Application Code

#### Current Issue with localStorage Authentication

Your app currently uses localStorage for authentication, which doesn't integrate with Supabase auth. You need to migrate to Supabase Auth.

#### Option 1: Keep Current System (Quick Fix)

If you want to keep localStorage auth temporarily, you'll need to use a service role key (which bypasses RLS) for server-side operations. **NOT RECOMMENDED for production**.

#### Option 2: Migrate to Supabase Auth (Recommended)

**Benefits**:
- Proper authentication
- RLS works automatically
- Secure by default
- Built-in session management
- Password reset, email verification

**Migration Steps**:

1. **Update Supabase Client** (`lib/supabase.ts`):
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})
```

2. **Update Login** (`app/login/page.tsx`):
```typescript
const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
        // Sign in with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })

        if (authError) throw authError

        // Get user profile
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single()

        if (userError) throw userError

        // Store in localStorage (for backward compatibility)
        localStorage.setItem('user', JSON.stringify(userData))

        // Redirect
        if (userData.role === 'admin') {
            router.push('/admin/products')
        } else {
            router.push('/')
        }
    } catch (error: any) {
        setError(error.message || 'Invalid credentials')
    } finally {
        setLoading(false)
    }
}
```

3. **Update Registration** (`app/register/page.tsx`):
```typescript
const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    // ... validation ...

    try {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
        })

        if (authError) throw authError

        // Create user profile
        const { data: userData, error: userError } = await supabase
            .from('users')
            .insert([{
                id: authData.user!.id,
                email: email,
                name: name,
                phone: phone,
                address: address,
                city: city,
                state: state,
                zipcode: zipcode,
                role: 'customer'
            }])
            .select()
            .single()

        if (userError) throw userError

        alert('Registration successful! Please login.')
        router.push('/login')
    } catch (error: any) {
        setError(error.message)
    }
}
```

4. **Add Auth State Listener** (in layout or main component):
```typescript
useEffect(() => {
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                // User signed in
                const { data } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single()
                
                if (data) {
                    localStorage.setItem('user', JSON.stringify(data))
                }
            } else if (event === 'SIGNED_OUT') {
                // User signed out
                localStorage.removeItem('user')
            }
        }
    )

    return () => {
        subscription.unsubscribe()
    }
}, [])
```

### Step 4: Test RLS Policies

After enabling RLS, test these scenarios:

1. **As Regular User**:
   - ✅ Can view own profile
   - ✅ Can view own orders
   - ✅ Can view own cart/wishlist
   - ❌ Cannot view other users' data
   - ❌ Cannot access admin functions

2. **As Admin**:
   - ✅ Can view all orders
   - ✅ Can manage products
   - ✅ Can manage coupons
   - ✅ Can update order statuses

3. **As Anonymous**:
   - ✅ Can view products
   - ✅ Can view categories
   - ❌ Cannot view orders
   - ❌ Cannot view user data

## Quick Enable Script

Run this complete script in Supabase SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Anyone can view active coupons" ON coupons;

-- Public read policies
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view active coupons" ON coupons FOR SELECT USING (is_active = true);

-- Note: Add user-specific policies after migrating to Supabase Auth
```

## Recommendation

For your e-commerce site, I **strongly recommend**:

1. ✅ Enable RLS immediately on all tables
2. ✅ Keep products/categories publicly readable
3. ✅ Migrate to Supabase Auth (within 1-2 weeks)
4. ✅ Test thoroughly before going to production
5. ✅ Use service role key only for server-side operations

## Temporary Solution (If Not Ready for Auth Migration)

If you need to keep localStorage auth temporarily:

1. Enable RLS on sensitive tables only (users, orders, cart, wishlist)
2. Keep products, categories, coupons without RLS temporarily
3. Plan migration to Supabase Auth ASAP
4. Monitor for suspicious activity

## Security Checklist

- [ ] RLS enabled on all tables
- [ ] Policies created for each table
- [ ] Tested as regular user
- [ ] Tested as admin
- [ ] Tested as anonymous
- [ ] Migrated to Supabase Auth
- [ ] Removed service role key from client
- [ ] Environment variables secured
- [ ] HTTPS enabled in production

## Need Help?

If you want me to help migrate to Supabase Auth, just let me know! I can update all the authentication code to use proper Supabase Auth instead of localStorage.
