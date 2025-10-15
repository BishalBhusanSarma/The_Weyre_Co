# The Weyre Co. - Luxury Jewellery E-Commerce

A modern, minimal shopping website with admin panel. Black & white theme with elegant design.

## Features

### Client Website
- ✅ Modern black navbar with logo
- ✅ Search functionality
- ✅ Product browsing with category filters
- ✅ Product details page (Buy Now, Add to Cart, Wishlist)
- ✅ User registration with full address
- ✅ User login with bcrypt password hashing
- ✅ Shopping cart (saves to database)
- ✅ Wishlist (saves to database)
- ✅ Profile dropdown (Orders, Addresses, About, Privacy, Logout)
- ✅ Rounded product cards with hover animations
- ✅ Responsive design

### Admin Panel (No Login Required)
- ✅ Dashboard overview
- ✅ Products management (Add, Edit, Delete)
- ✅ Categories management (Add, Edit, Delete)
- ✅ View all orders
- ✅ View all users

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Add Logo
Place your `logo.png` file in the `public/` folder (40x40px recommended)

### 3. Setup Database
1. Go to Supabase Dashboard → SQL Editor
2. Run the SQL from `database.sql`
3. This creates all tables and adds sample products

### 4. Start Development
```bash
npm run dev
```

Visit: http://localhost:3000

## URLs

- **Homepage:** http://localhost:3000
- **Products:** http://localhost:3000/products
- **Register:** http://localhost:3000/register
- **Login:** http://localhost:3000/login
- **Wishlist:** http://localhost:3000/wishlist
- **Cart:** http://localhost:3000/cart
- **Admin:** http://localhost:3000/admin

## Key Features Explained

### Authentication
- Users register with email, password, name, phone, address, city, state, zipcode
- Passwords are hashed with bcrypt
- User data stored in Supabase
- Login required for cart and wishlist

### Shopping Experience
- Browse products by category
- Search products
- View product details
- Add to cart (requires login)
- Add to wishlist (requires login)
- Rounded cards with smooth hover animations

### Admin Panel
- No authentication required (add your own if needed)
- Full CRUD for products and categories
- View orders and users
- Simple and clean interface

## Tech Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL)
- bcryptjs

## Design

- **Theme:** Black & white with minimal design
- **Navbar:** Black background, white icons
- **Logo:** The Weyre Co. with logo.png
- **Cards:** Rounded corners with hover animations
- **Icons:** Cart, Wishlist, Profile dropdown

## Database Tables

- `users` - User accounts with full address
- `products` - Product catalog
- `categories` - Product categories
- `cart` - Shopping cart items
- `wishlist` - Wishlist items
- `orders` - Customer orders
- `order_items` - Order line items

## Notes

- Replace `public/logo.png` with your actual logo
- Users must be logged in to use cart and wishlist
- Admin panel has no authentication (add if needed)
- All product images use URLs (no file uploads)
