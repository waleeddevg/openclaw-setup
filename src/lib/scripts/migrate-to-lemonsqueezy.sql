-- ============================================================
-- Migration: Stripe → Lemon Squeezy (ClawSetup AI)
-- Run this in your Supabase SQL Editor if you already have
-- a subscriptions table from the Stripe era.
-- ============================================================

-- 1. Add Lemon Squeezy columns (safe — will skip if already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'ls_subscription_id'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN ls_subscription_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'ls_customer_id'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN ls_customer_id TEXT;
  END IF;
END $$;

-- 2. Verify structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;
