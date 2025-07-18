/*
  # Initial B2B E-commerce Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text, nullable)
      - `created_at` (timestamp)
    
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text, nullable)
      - `price` (numeric)
      - `image_url` (text, nullable)
      - `category_id` (uuid, foreign key)
      - `stock_quantity` (integer)
      - `sku` (text, unique)
      - `created_at` (timestamp)
    
    - `cart_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `product_id` (uuid, foreign key)
      - `quantity` (integer)
      - `created_at` (timestamp)
    
    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `total_amount` (numeric)
      - `status` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access to products and categories
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price >= 0),
  image_url text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  stock_quantity integer DEFAULT 0 CHECK (stock_quantity >= 0),
  sku text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity integer DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total_amount numeric NOT NULL CHECK (total_amount >= 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read, authenticated users can manage their own)
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  TO public
  USING (true);

-- Products policies (public read, authenticated users can manage their own)
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  TO public
  USING (true);

-- Cart items policies (users can only manage their own cart)
CREATE POLICY "Users can view their own cart items"
  ON cart_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items"
  ON cart_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Orders policies (users can only manage their own orders)
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert sample categories
INSERT INTO categories (name, description) VALUES
  ('Electronics', 'Electronic devices and components for business use'),
  ('Office Supplies', 'Essential supplies for office and workplace'),
  ('Furniture', 'Office furniture and workspace solutions'),
  ('Software', 'Business software and digital solutions'),
  ('Hardware', 'Computer hardware and IT equipment'),
  ('Marketing', 'Marketing materials and promotional items')
ON CONFLICT (name) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, price, image_url, category_id, stock_quantity, sku) VALUES
  ('Wireless Mouse', 'Ergonomic wireless mouse for office use', 29.99, 'https://images.pexels.com/photos/163125/computer-mouse-wireless-mouse-mouse-163125.jpeg?auto=compress&cs=tinysrgb&w=400', 
   (SELECT id FROM categories WHERE name = 'Electronics'), 50, 'WM-001'),
  ('Office Chair', 'Comfortable ergonomic office chair', 199.99, 'https://images.pexels.com/photos/280230/pexels-photo-280230.jpeg?auto=compress&cs=tinysrgb&w=400', 
   (SELECT id FROM categories WHERE name = 'Furniture'), 25, 'OC-001'),
  ('Notebook Set', 'Professional notebook set for meetings', 15.99, 'https://images.pexels.com/photos/3751006/pexels-photo-3751006.jpeg?auto=compress&cs=tinysrgb&w=400', 
   (SELECT id FROM categories WHERE name = 'Office Supplies'), 100, 'NB-001'),
  ('Laptop Stand', 'Adjustable laptop stand for better ergonomics', 45.99, 'https://images.pexels.com/photos/4195325/pexels-photo-4195325.jpeg?auto=compress&cs=tinysrgb&w=400', 
   (SELECT id FROM categories WHERE name = 'Hardware'), 30, 'LS-001'),
  ('Business Cards', 'Professional business cards printing service', 24.99, 'https://images.pexels.com/photos/6801874/pexels-photo-6801874.jpeg?auto=compress&cs=tinysrgb&w=400', 
   (SELECT id FROM categories WHERE name = 'Marketing'), 200, 'BC-001'),
  ('Desk Lamp', 'LED desk lamp with adjustable brightness', 35.99, 'https://images.pexels.com/photos/1122868/pexels-photo-1122868.jpeg?auto=compress&cs=tinysrgb&w=400', 
   (SELECT id FROM categories WHERE name = 'Electronics'), 40, 'DL-001'),
  ('File Cabinet', 'Secure file cabinet for document storage', 89.99, 'https://images.pexels.com/photos/5699456/pexels-photo-5699456.jpeg?auto=compress&cs=tinysrgb&w=400', 
   (SELECT id FROM categories WHERE name = 'Furniture'), 15, 'FC-001'),
  ('Wireless Keyboard', 'Compact wireless keyboard for productivity', 49.99, 'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=400', 
   (SELECT id FROM categories WHERE name = 'Electronics'), 60, 'WK-001'),
  ('Printer Paper', 'High-quality printer paper for office use', 12.99, 'https://images.pexels.com/photos/6801873/pexels-photo-6801873.jpeg?auto=compress&cs=tinysrgb&w=400', 
   (SELECT id FROM categories WHERE name = 'Office Supplies'), 150, 'PP-001'),
  ('Monitor Stand', 'Adjustable monitor stand with storage', 39.99, 'https://images.pexels.com/photos/4195326/pexels-photo-4195326.jpeg?auto=compress&cs=tinysrgb&w=400', 
   (SELECT id FROM categories WHERE name = 'Hardware'), 35, 'MS-001'),
  ('Promotional Pens', 'Custom promotional pens with logo', 19.99, 'https://images.pexels.com/photos/1319854/pexels-photo-1319854.jpeg?auto=compress&cs=tinysrgb&w=400', 
   (SELECT id FROM categories WHERE name = 'Marketing'), 300, 'PP-002'),
  ('Conference Table', 'Modern conference table for meetings', 599.99, 'https://images.pexels.com/photos/1181435/pexels-photo-1181435.jpeg?auto=compress&cs=tinysrgb&w=400', 
   (SELECT id FROM categories WHERE name = 'Furniture'), 5, 'CT-001')
ON CONFLICT (sku) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);