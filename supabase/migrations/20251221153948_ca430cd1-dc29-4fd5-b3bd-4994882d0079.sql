-- Add 'annually' to fee_type enum
ALTER TYPE public.fee_type ADD VALUE IF NOT EXISTS 'annually';