# Admin Orders Page - Access Troubleshooting Guide

## Issue: Admin Orders Page Redirecting to Homepage

### Possible Causes:

1. **Not logged in as admin**
2. **Email doesn't match 'admin@weyreco.com'**
3. **User data not in localStorage**
4. **Browser console showing errors**

## How to Debug:

### Step 1: Check Browser Console
1. Open `/admin/orders` page
2. Open browser console (F12 or Right-click → Inspect → Console)
3. Look for these console logs:
   - "User data: ..." 
   - "Parsed user: ..."
   - "User email: ..."
   - "Is admin? true/false"

### Step 2: Check Your Login Email
The admin check looks for:
- Email: `admin@weyreco.com`
- OR Role: `admin`

**If you see an alert saying "Access denied"**, it will show your current email.

### Step 3: Solutions

#### Solution 1: Login with Admin Email
1. Logout from current account
2. Login with email: `admin@weyreco.com`
3. Try accessing `/admin/orders` again

#### Solution 2: Update Admin Check (Temporary)
If you want to use a different email, update line in `/app/admin/orders/page.tsx`:

```typescript
// Change this line:
const isAdmin = user.email === 'admin@weyreco.com' || user.role === 'admin'

// To use your email:
const isAdmin = user.email === 'your-email@example.com' || user.role === 'admin'
```

#### Solution 3: Add Admin Role to Database
Add an `is_admin` or `role` column to users table:

```sql
-- Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';

-- Make your user admin
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

Then the check `user.role === 'admin'` will work.

### Step 4: Verify Admin Access

Once logged in as admin, you should see:
- All orders from all customers
- Delivery status dropdown
- Payment status display
- Tracking number input
- Customer details

## Quick Test:

### Test 1: Check LocalStorage
Open browser console and run:
```javascript
console.log(localStorage.getItem('user'))
```

You should see something like:
```json
{"id":"xxx","email":"admin@weyreco.com","name":"Admin"}
```

### Test 2: Check Email Match
```javascript
const user = JSON.parse(localStorage.getItem('user'))
console.log('Email:', user.email)
console.log('Matches admin?', user.email === 'admin@weyreco.com')
```

### Test 3: Manual Override (Temporary)
If you need immediate access for testing, comment out the admin check:

```typescript
const checkAdmin = async () => {
    // TEMPORARY: Comment out admin check for testing
    // const userData = localStorage.getItem('user')
    // if (!userData) {
    //     router.push('/login')
    //     return
    // }
    // const user = JSON.parse(userData)
    // const isAdmin = user.email === 'admin@weyreco.com'
    // if (!isAdmin) {
    //     router.push('/')
    //     return
    // }
    
    await loadOrders()
}
```

**⚠️ Remember to uncomment this before production!**

## Common Issues:

### Issue 1: "Cannot read property 'email' of null"
**Cause:** Not logged in
**Solution:** Login first, then access admin page

### Issue 2: Alert shows wrong email
**Cause:** Logged in with different email
**Solution:** Logout and login with admin@weyreco.com

### Issue 3: Page loads but no orders
**Cause:** Database query issue
**Solution:** 
- Check browser console for errors
- Verify orders table exists
- Check Supabase connection

### Issue 4: Dropdowns not showing
**Cause:** Orders not loading
**Solution:**
- Check if `orders` array is empty
- Verify database has orders
- Check console for API errors

## Admin Panel Access Methods:

### Method 1: Hardcoded Email (Current)
```typescript
const isAdmin = user.email === 'admin@weyreco.com'
```
**Pros:** Simple, no database changes
**Cons:** Only one admin email

### Method 2: Role-Based (Recommended)
```typescript
const isAdmin = user.role === 'admin'
```
**Pros:** Multiple admins, flexible
**Cons:** Requires database column

### Method 3: Admin Table
Create separate `admins` table with user IDs
**Pros:** Most secure, scalable
**Cons:** More complex setup

## Next Steps:

1. **Check console logs** when accessing `/admin/orders`
2. **Verify your email** matches 'admin@weyreco.com'
3. **If different email**, update the check or add role column
4. **Test again** after changes
5. **Remove console.logs** once working

## Need Help?

If still not working:
1. Share the console log output
2. Share your user email
3. Check if you can access other admin pages (/admin/products, /admin/coupons)
4. Verify you're on the correct URL: `http://localhost:3000/admin/orders`
