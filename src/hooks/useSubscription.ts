import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Subscription {
  id: string;
  school_id: string;
  plan: "starter" | "professional" | "enterprise";
  status: "active" | "expired" | "cancelled" | "pending";
  amount: number;
  razorpay_subscription_id: string | null;
  razorpay_payment_id: string | null;
  starts_at: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPayment {
  id: string;
  subscription_id: string;
  razorpay_payment_id: string;
  razorpay_order_id: string | null;
  amount: number;
  status: string;
  payment_date: string;
  created_at: string;
}

// Fetch subscription for a school
export function useSchoolSubscription(schoolId: string | undefined) {
  return useQuery({
    queryKey: ["subscription", schoolId],
    queryFn: async () => {
      if (!schoolId) return null;

      const { data, error } = await supabase
        .from("school_subscriptions")
        .select("*")
        .eq("school_id", schoolId)
        .maybeSingle();

      if (error) throw error;
      return data as Subscription | null;
    },
    enabled: !!schoolId,
  });
}

// Fetch subscription payments
export function useSubscriptionPayments(subscriptionId: string | undefined) {
  return useQuery({
    queryKey: ["subscription-payments", subscriptionId],
    queryFn: async () => {
      if (!subscriptionId) return [];

      const { data, error } = await supabase
        .from("subscription_payments")
        .select("*")
        .eq("subscription_id", subscriptionId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SubscriptionPayment[];
    },
    enabled: !!subscriptionId,
  });
}

// Check if subscription is active
export function useIsSubscriptionActive(schoolId: string | undefined) {
  const { data: subscription, isLoading } = useSchoolSubscription(schoolId);

  const isActive = subscription
    ? subscription.status === "active" && new Date(subscription.expires_at) > new Date()
    : false;

  const daysRemaining = subscription && subscription.expires_at
    ? Math.max(0, Math.ceil((new Date(subscription.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  return {
    isActive,
    daysRemaining,
    subscription,
    isLoading,
  };
}

// Create Razorpay order
export function useCreateSubscriptionOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ schoolId, plan }: { schoolId: string; plan: "starter" | "professional" }) => {
      const { data, error } = await supabase.functions.invoke("razorpay-subscription/create-order", {
        body: { school_id: schoolId, plan },
      });

      if (error) throw error;
      return data;
    },
    onError: (error: any) => {
      toast.error("Failed to create order: " + error.message);
    },
  });
}

// Verify Razorpay payment
export function useVerifySubscriptionPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
      school_id: string;
      plan: "starter" | "professional";
    }) => {
      const { data: response, error } = await supabase.functions.invoke("razorpay-subscription/verify-payment", {
        body: data,
      });

      if (error) throw error;
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      toast.success("Subscription activated successfully!");
    },
    onError: (error: any) => {
      toast.error("Payment verification failed: " + error.message);
    },
  });
}

// Plan details
export const PLAN_DETAILS = {
  starter: {
    name: "Starter",
    price: 999,
    description: "Perfect for small schools up to 500 students",
    features: [
      "Up to 500 students",
      "Basic fee management",
      "Email notifications",
      "Payment gateway (2% fee)",
      "Basic reports",
      "Email support",
    ],
  },
  professional: {
    name: "Professional",
    price: 6999,
    description: "Ideal for growing schools up to 2000 students",
    features: [
      "Up to 2000 students",
      "Advanced fee structures",
      "SMS + Email + WhatsApp",
      "Payment gateway (1.5% fee)",
      "Advanced analytics",
      "Priority support",
      "Custom branding",
      "API access",
    ],
  },
  enterprise: {
    name: "Enterprise",
    price: null,
    description: "For large institutions and school chains",
    features: [
      "Unlimited students",
      "Multi-branch support",
      "All notification channels",
      "Payment gateway (1% fee)",
      "Custom reports",
      "Dedicated account manager",
      "White-label solution",
      "SLA guarantee",
    ],
  },
};
