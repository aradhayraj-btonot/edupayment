import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Phone, Lock } from "lucide-react";
import { motion } from "framer-motion";

interface SubscriptionBlockerProps {
  type: "parent" | "admin";
  schoolName?: string;
}

export function SubscriptionBlocker({ type, schoolName }: SubscriptionBlockerProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <Card className="border-destructive/50">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-destructive" />
            </div>

            <h1 className="text-2xl font-bold text-foreground">Access Restricted</h1>

            {type === "parent" ? (
              <>
                <p className="text-muted-foreground">
                  {schoolName ? (
                    <>
                      <strong>{schoolName}'s</strong> subscription has expired.
                    </>
                  ) : (
                    "Your school's subscription has expired."
                  )}
                </p>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20 text-left">
                  <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">What does this mean?</p>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      <li>• You cannot view fee details</li>
                      <li>• You cannot make payments</li>
                      <li>• You cannot access student information</li>
                    </ul>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Please contact your school administration to resolve this issue.
                </p>
              </>
            ) : (
              <>
                <p className="text-muted-foreground">
                  Your school's subscription has expired. Please renew to continue using EduPay.
                </p>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20 text-left">
                  <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">Services affected:</p>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      <li>• Students and parents cannot access the system</li>
                      <li>• Payment processing is disabled</li>
                      <li>• Notifications are paused</li>
                    </ul>
                  </div>
                </div>
                <Button className="w-full gap-2" size="lg">
                  Renew Subscription
                </Button>
              </>
            )}

            <div className="pt-4 border-t border-border">
              <Button variant="ghost" className="gap-2">
                <Phone className="w-4 h-4" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
