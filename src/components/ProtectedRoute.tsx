import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { EmailVerificationBlocker } from '@/components/auth/EmailVerificationBlocker';

type AppRole = 'admin' | 'parent' | 'student' | 'team';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check email verification grace period (7 days)
  // Only for non-team roles (team accounts are created manually)
  if (role !== 'team') {
    const emailConfirmedAt = user.email_confirmed_at;
    const createdAt = user.created_at;
    
    if (!emailConfirmedAt && createdAt) {
      const created = new Date(createdAt);
      const now = new Date();
      const daysSinceCreation = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceCreation > 7) {
        // Account suspended - email not verified within 7 days
        return <EmailVerificationBlocker />;
      }
    }
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    if (role === 'team') return <Navigate to="/team" replace />;
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'parent') return <Navigate to="/parent" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
