-- Simple Shopping Website Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zipcode TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts
CREATE POLICY "Allow public insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to read own data" ON users FOR SELECT USING (true);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products table with multiple images, featured/trending flags, and gender
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  actual_price DECIMAL(10,2) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  image_url_2 TEXT,
  image_url_3 TEXT,
  image_url_4 TEXT,
  image_url_5 TEXT,
  category_id UUID REFERENCES categories(id),
  stock INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  gender TEXT DEFAULT 'all' CHECK (gender IN ('men', 'women', 'all')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL
);

-- Cart table
CREATE TABLE cart (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Wishlist table
CREATE TABLE wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS for cart and wishlist
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own cart" ON cart FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Users can manage own wishlist" ON wishlist FOR ALL USING (true) WITH CHECK (true);

-- Insert sample categories
INSERT INTO categories (name) VALUES 
  ('Rings'),
  ('Necklaces'),
  ('Bracelets'),
  ('Earrings'),
  ('Watches');

-- Insert sample products with featured/trending flags and gender
INSERT INTO products (name, description, actual_price, price, image_url, category_id, stock, is_featured, is_trending, gender) VALUES
  ('Diamond Ring', 'Beautiful diamond engagement ring', 3499.99, 2999.99, 'https://via.placeholder.com/400x400/000/fff?text=Ring', (SELECT id FROM categories WHERE name = 'Rings'), 10, true, true, 'women'),
  ('Gold Necklace', 'Elegant 18k gold necklace', 1799.99, 1499.99, 'https://via.placeholder.com/400x400/000/fff?text=Necklace', (SELECT id FROM categories WHERE name = 'Necklaces'), 15, true, true, 'women'),
  ('Silver Bracelet', 'Sterling silver bracelet', 699.99, 599.99, 'https://via.placeholder.com/400x400/000/fff?text=Bracelet', (SELECT id FROM categories WHERE name = 'Bracelets'), 20, true, false, 'all'),
  ('Pearl Earrings', 'Classic pearl drop earrings', 1099.99, 899.99, 'https://via.placeholder.com/400x400/000/fff?text=Earrings', (SELECT id FROM categories WHERE name = 'Earrings'), 12, true, false, 'women'),
  ('Luxury Watch', 'Premium automatic watch', 3999.99, 3499.99, 'https://via.placeholder.com/400x400/000/fff?text=Watch', (SELECT id FROM categories WHERE name = 'Watches'), 8, true, true, 'men'),
  ('Mens Ring', 'Bold titanium ring', 999.99, 799.99, 'https://via.placeholder.com/400x400/000/fff?text=Mens+Ring', (SELECT id FROM categories WHERE name = 'Rings'), 15, true, true, 'men'),
  ('Chain Necklace', 'Heavy gold chain', 2199.99, 1899.99, 'https://via.placeholder.com/400x400/000/fff?text=Chain', (SELECT id FROM categories WHERE name = 'Necklaces'), 10, true, false, 'men'),
  ('Leather Bracelet', 'Genuine leather bracelet', 399.99, 299.99, 'https://via.placeholder.com/400x400/000/fff?text=Leather', (SELECT id FROM categories WHERE name = 'Bracelets'), 25, false, true, 'men');
