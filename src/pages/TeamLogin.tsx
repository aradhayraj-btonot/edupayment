import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Shield, Lock, Eye, EyeOff, GraduationCap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const TEAM_ACCESS_PASSWORD = 'aradhayRAJ#46';

const TeamLogin = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [step, setStep] = useState<'access' | 'login'>('access');
  const [accessPassword, setAccessPassword] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showAccessPassword, setShowAccessPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccessVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessPassword === TEAM_ACCESS_PASSWORD) {
      setStep('login');
      toast.success('Access granted! Please login with your team credentials.');
    } else {
      toast.error('Invalid access password. Contact EduPay administration.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error(error.message || 'Login failed');
        setLoading(false);
        return;
      }

      // Verify user has team role
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'team')
          .maybeSingle();

        if (roleData) {
          toast.success('Welcome to EduPay Team Dashboard!');
          navigate('/team');
        } else {
          await supabase.auth.signOut();
          toast.error('You do not have team access. Contact EduPay administration.');
        }
      }
    } catch (err) {
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">EduPay Team</h1>
          <p className="text-muted-foreground mt-2">Administrative Control Panel</p>
        </div>

        <Card className="border-2 border-primary/20 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-xl">
              {step === 'access' ? 'Secure Access Verification' : 'Team Login'}
            </CardTitle>
            <CardDescription>
              {step === 'access' 
                ? 'Enter the special access password to proceed'
                : 'Login with your team credentials'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'access' ? (
              <form onSubmit={handleAccessVerification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="access-password">Access Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="access-password"
                      type={showAccessPassword ? 'text' : 'password'}
                      value={accessPassword}
                      onChange={(e) => setAccessPassword(e.target.value)}
                      placeholder="Enter access password"
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowAccessPassword(!showAccessPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showAccessPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Verify Access
                </Button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="team@edupay.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login to Dashboard'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setStep('access')}
                >
                  Back to Access Verification
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          This is a restricted area for EduPay team members only.
          <br />
          Unauthorized access attempts are logged.
        </p>
      </motion.div>
    </div>
  );
};

export default TeamLogin;
