// Updated to support pending custom subscriptions
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, CreditCard, Clock, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useIsSubscriptionActive, PLAN_DETAILS, Subscription } from "@/hooks/useSubscription";
import { SubscriptionPaymentDialog } from "./SubscriptionPaymentDialog";
import { useState } from "react";

interface SubscriptionStatusProps {
  schoolId: string;
}

export function SubscriptionStatus({ schoolId }: SubscriptionStatusProps) {
  const { subscription, isActive, daysRemaining, isLoading } = useIsSubscriptionActive(schoolId);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const planDetails = subscription ? PLAN_DETAILS[subscription.plan] : null;
  const totalDays = 30;
  const progressPercent = subscription ? (daysRemaining / totalDays) * 100 : 0;

  const isPending = subscription?.status === 'pending';

  return (
    <>
      <Card className={`${!isActive && subscription ? "border-destructive" : ""} ${isPending ? "border-warning" : ""}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Subscription Status
            </span>
            {subscription && (
              <Badge variant={isActive ? "success" : isPending ? "warning" : "destructive"}>
                {isActive ? "Active" : isPending ? "Pending Payment" : "Expired"}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!subscription ? (
            // No subscription
            <div className="text-center py-6 space-y-4">
              <AlertTriangle className="w-12 h-12 text-warning mx-auto" />
              <div>
                <h3 className="font-semibold text-lg">No Active Subscription</h3>
                <p className="text-sm text-muted-foreground">
                  Subscribe to a plan to unlock all features and manage your school fees.
                </p>
              </div>
              <Button onClick={() => setPaymentDialogOpen(true)} className="gap-2">
                <CreditCard className="w-4 h-4" />
                Subscribe Now
              </Button>
            </div>
          ) : isPending ? (
            // Pending payment - custom plan created by team
            <div className="space-y-4">
              <div className="text-center py-4 space-y-4">
                <Clock className="w-12 h-12 text-warning mx-auto" />
                <div>
                  <h3 className="font-semibold text-lg">Payment Required</h3>
                  <p className="text-sm text-muted-foreground">
                    A custom subscription has been created for your school. Please complete the payment to activate.
                  </p>
                </div>
              </div>

              {/* Plan Info */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Custom Plan</p>
                  <p className="text-xl font-bold">{planDetails?.name || 'Enterprise'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Amount Due</p>
                  <p className="text-2xl font-bold text-primary">₹{subscription.amount.toLocaleString("en-IN")}</p>
                </div>
              </div>

              {/* Pay Now Button */}
              <Button 
                onClick={() => setPaymentDialogOpen(true)} 
                className="w-full gap-2"
                size="lg"
              >
                <CreditCard className="w-4 h-4" />
                Pay ₹{subscription.amount.toLocaleString("en-IN")} Now
              </Button>
            </div>
          ) : (
            // Has active/expired subscription
            <div className="space-y-4">
              {/* Plan Info */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  <p className="text-xl font-bold">{planDetails?.name || subscription.plan}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-xl font-bold">₹{subscription.amount.toLocaleString("en-IN")}/mo</p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Started</p>
                    <p className="text-sm font-medium">
                      {format(new Date(subscription.starts_at), "dd MMM yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Expires</p>
                    <p className="text-sm font-medium">
                      {format(new Date(subscription.expires_at), "dd MMM yyyy")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Days Remaining */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Days Remaining</span>
                  <span className={`font-medium ${daysRemaining <= 5 ? "text-destructive" : ""}`}>
                    {daysRemaining} days
                  </span>
                </div>
                <Progress 
                  value={progressPercent} 
                  className={`h-2 ${daysRemaining <= 5 ? "[&>div]:bg-destructive" : ""}`}
                />
              </div>

              {/* Warning for low days */}
              {isActive && daysRemaining <= 7 && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                  <p className="text-sm text-warning">
                    Your subscription expires soon. Renew now to avoid service interruption.
                  </p>
                </div>
              )}

              {/* Expired warning */}
              {!isActive && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                  <p className="text-sm text-destructive">
                    Your subscription has expired. Parents and students cannot access the system until you renew.
                  </p>
                </div>
              )}

              {/* Renew Button */}
              <Button 
                onClick={() => setPaymentDialogOpen(true)} 
                variant={isActive ? "outline" : "default"}
                className="w-full gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {isActive ? "Renew Subscription" : "Reactivate Now"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <SubscriptionPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        schoolId={schoolId}
        currentPlan={subscription?.plan}
        pendingSubscription={isPending ? subscription : undefined}
      />
    </>
  );
}
