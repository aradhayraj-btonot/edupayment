-- Create subscription plan enum
CREATE TYPE public.subscription_plan AS ENUM ('starter', 'professional', 'enterprise');

-- Create subscription status enum
CREATE TYPE public.subscription_status AS ENUM ('active', 'expired', 'cancelled', 'pending');

-- Create school_subscriptions table
CREATE TABLE public.school_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL,
  status subscription_status NOT NULL DEFAULT 'pending',
  amount NUMERIC NOT NULL,
  razorpay_subscription_id TEXT,
  razorpay_payment_id TEXT,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(school_id)
);

-- Create subscription_payments table to track all payments
CREATE TABLE public.subscription_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES public.school_subscriptions(id) ON DELETE CASCADE,
  razorpay_payment_id TEXT NOT NULL,
  razorpay_order_id TEXT,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.school_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for school_subscriptions
CREATE POLICY "Admins can manage their school subscriptions"
ON public.school_subscriptions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.schools s
    WHERE s.id = school_subscriptions.school_id
  ) AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Authenticated users can view subscriptions"
ON public.school_subscriptions
FOR SELECT
USING (true);

-- RLS Policies for subscription_payments
CREATE POLICY "Admins can manage subscription payments"
ON public.subscription_payments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.school_subscriptions ss
    JOIN public.schools s ON s.id = ss.school_id
    WHERE ss.id = subscription_payments.subscription_id
  ) AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can view subscription payments"
ON public.subscription_payments
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
);

-- Add subscription_active field to schools table
ALTER TABLE public.schools ADD COLUMN subscription_active BOOLEAN DEFAULT false;

-- Create trigger to update updated_at
CREATE TRIGGER update_school_subscriptions_updated_at
BEFORE UPDATE ON public.school_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Create function to check if school subscription is active
CREATE OR REPLACE FUNCTION public.is_school_subscription_active(_school_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.school_subscriptions
    WHERE school_id = _school_id
      AND status = 'active'
      AND expires_at > now()
  )
$$;