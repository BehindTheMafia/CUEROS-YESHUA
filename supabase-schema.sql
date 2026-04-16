-- =====================================================
-- CUEROS YESHUA - Database Schema
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- 1. Categories table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Product colors table
CREATE TABLE product_colors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  color_name TEXT NOT NULL,
  hex_value TEXT NOT NULL
);

-- 4. Product images table
CREATE TABLE product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT false
);

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Public can READ all data
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public can read product_colors" ON product_colors FOR SELECT USING (true);
CREATE POLICY "Public can read product_images" ON product_images FOR SELECT USING (true);

-- Only authenticated users can INSERT/UPDATE/DELETE
CREATE POLICY "Auth can insert categories" ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth can update categories" ON categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth can delete categories" ON categories FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth can insert products" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth can update products" ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth can delete products" ON products FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth can insert product_colors" ON product_colors FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth can update product_colors" ON product_colors FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth can delete product_colors" ON product_colors FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth can insert product_images" ON product_images FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth can update product_images" ON product_images FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth can delete product_images" ON product_images FOR DELETE USING (auth.role() = 'authenticated');

-- =====================================================
-- Storage bucket for product images
-- =====================================================
-- NOTE: Create a storage bucket called "product-images" in the Supabase dashboard
-- Set it to PUBLIC so images can be accessed via URL
-- The RLS policies below handle upload security

-- =====================================================
-- Seed default categories
-- =====================================================
INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Cuero Nacional', 'cuero-nacional', 'Cueros de producción nacional, resistentes y tradicionales', 1),
  ('Cuero Importado', 'cuero-importado', 'Cueros finos importados con acabados exclusivos', 2),
  ('Hilos', 'hilos', 'Hilos de alta resistencia para costura de cuero', 3),
  ('Hebillas Vaqueras', 'hebillas-vaqueras', 'Hebillas decorativas y funcionales estilo vaquero', 4),
  ('Accesorios', 'accesorios', 'Herramientas y accesorios para marroquinería', 5);
