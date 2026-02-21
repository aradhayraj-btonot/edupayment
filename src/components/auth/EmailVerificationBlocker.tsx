import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Mail, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const EmailVerificationBlocker = () => {
  const { signOut, user } = useAuth();
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    if (!user?.email) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });
      if (error) throw error;
      toast.success('Verification email sent! Check your inbox.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="border-destructive/30">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-xl text-destructive">Account Suspended</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              Your email <strong className="text-foreground">{user?.email}</strong> has not been verified within 7 days. 
              Your account access is suspended until you verify your email.
            </p>
            <div className="space-y-3">
              <Button onClick={handleResend} disabled={resending} className="w-full gap-2">
                <Mail className="w-4 h-4" />
                {resending ? 'Sending...' : 'Verify Now - Resend Email'}
              </Button>
              <Button variant="outline" onClick={signOut} className="w-full gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Check your inbox and spam folder for the verification link.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
