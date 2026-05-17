-- ClawSetup AI Database Schema
-- Run this in your Supabase SQL Editor

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  vps_provider TEXT NOT NULL,
  vps_ip TEXT NOT NULL,
  vps_region TEXT,
  vps_username TEXT NOT NULL DEFAULT 'root',
  vps_password TEXT,
  ai_provider TEXT NOT NULL DEFAULT 'openai',
  openai_api_key TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'basic',
  additional_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'failed')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  stripe_session_id TEXT,
  amount_paid DECIMAL(10, 2),
  deployment_logs TEXT[] DEFAULT '{}',
  ai_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Create index on email for searching
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert orders
CREATE POLICY "Allow public insert" ON orders
  FOR INSERT TO public
  WITH CHECK (true);

-- Create policy to allow anyone to read their own orders by email
CREATE POLICY "Allow users to read own orders" ON orders
  FOR SELECT TO public
  USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Note: Admin access is handled through the service role key in server components
-- The service role key bypasses RLS policies

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
