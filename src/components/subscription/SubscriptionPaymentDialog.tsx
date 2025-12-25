import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Phone } from "lucide-react";
import { useCreateSubscriptionOrder, useVerifySubscriptionPayment, PLAN_DETAILS } from "@/hooks/useSubscription";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface SubscriptionPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string;
  currentPlan?: string;
}

export function SubscriptionPaymentDialog({
  open,
  onOpenChange,
  schoolId,
  currentPlan,
}: SubscriptionPaymentDialogProps) {
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "professional" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const createOrder = useCreateSubscriptionOrder();
  const verifyPayment = useVerifySubscriptionPayment();

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (plan: "starter" | "professional") => {
    setSelectedPlan(plan);
    setIsProcessing(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay. Please try again.");
      }

      // Create order
      const orderData = await createOrder.mutateAsync({ schoolId, plan });

      // Open Razorpay checkout
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "EduPay",
        description: `${PLAN_DETAILS[plan].name} Plan - Monthly Subscription`,
        order_id: orderData.order_id,
        handler: async (response: any) => {
          // Verify payment
          try {
            await verifyPayment.mutateAsync({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              school_id: schoolId,
              plan: plan,
            });
            onOpenChange(false);
          } catch (error) {
            console.error("Payment verification failed:", error);
          }
        },
        prefill: {
          email: "",
          contact: "",
        },
        theme: {
          color: "#3b82f6",
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setSelectedPlan(null);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (response: any) => {
        toast.error("Payment failed: " + response.error.description);
        setIsProcessing(false);
        setSelectedPlan(null);
      });
      razorpay.open();
    } catch (error: any) {
      console.error("Subscription error:", error);
      toast.error(error.message || "Failed to process subscription");
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  const plans = [
    { key: "starter" as const, ...PLAN_DETAILS.starter },
    { key: "professional" as const, ...PLAN_DETAILS.professional },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose Your Plan</DialogTitle>
          <DialogDescription>
            Select a plan to continue using EduPay. All plans include a 30-day subscription period.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {plans.map((plan) => (
            <Card
              key={plan.key}
            className={`relative cursor-pointer transition-all hover:shadow-md ${
              plan.key === "professional" ? "border-primary" : ""
            } ${currentPlan === plan.key ? "ring-2 ring-primary" : ""}`}
            onClick={() => !isProcessing && handleSubscribe(plan.key)}
          >
            {plan.key === "professional" && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
              </div>
            )}
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-bold">₹{plan.price?.toLocaleString("en-IN")}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.key === "professional" ? "default" : "outline"}
                  disabled={isProcessing}
                >
                  {isProcessing && selectedPlan === plan.key ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : currentPlan === plan.key ? (
                    "Renew Plan"
                  ) : (
                    "Subscribe"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enterprise Contact */}
        <Card className="mt-4 bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Enterprise Plan</h4>
                <p className="text-sm text-muted-foreground">
                  Need unlimited students and custom features? Contact us for a custom quote.
                </p>
              </div>
              <Button variant="outline" className="gap-2">
                <Phone className="w-4 h-4" />
                Contact Sales
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
