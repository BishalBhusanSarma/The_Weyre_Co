# Quick Setup Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Setup Database

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on "SQL Editor"
3. Copy and paste the entire content from `database.sql`
4. Click "Run"

This will create all tables and add sample products.

## 3. Start Development Server

```bash
npm run dev
```

## 4. Access the Site

- **Client:** http://localhost:3000
- **Admin:** http://localhost:3000/admin

## Done!

That's it. Simple and clean.

### Test User Registration

1. Go to http://localhost:3000/register
2. Fill in all fields (email, password, name, address, city, state, zipcode)
3. Click "Sign Up"
4. Login at http://localhost:3000/login

### Admin Panel

No login required. Just go to http://localhost:3000/admin

- Add/delete products
- Add/delete categories
- View orders
- View users
