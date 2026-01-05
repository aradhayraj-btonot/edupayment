import { Bell, BellOff, BellRing, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface PushNotificationToggleProps {
  schoolId?: string;
  variant?: 'default' | 'compact' | 'card';
}

export function PushNotificationToggle({ schoolId, variant = 'default' }: PushNotificationToggleProps) {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    toggleSubscription,
  } = usePushNotifications(schoolId);

  // Permission status badge
  const getStatusBadge = () => {
    if (!isSupported) {
      return <Badge variant="destructive">Not Supported</Badge>;
    }
    if (permission === 'denied') {
      return <Badge variant="destructive">Blocked</Badge>;
    }
    if (isSubscribed) {
      return <Badge variant="default" className="bg-green-500">Enabled</Badge>;
    }
    return <Badge variant="secondary">Disabled</Badge>;
  };

  // Compact variant - just a toggle
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3">
        {isSubscribed ? (
          <BellRing className="h-4 w-4 text-green-500" />
        ) : (
          <BellOff className="h-4 w-4 text-muted-foreground" />
        )}
        <Switch
          checked={isSubscribed}
          onCheckedChange={toggleSubscription}
          disabled={isLoading || !isSupported || permission === 'denied'}
        />
        <Label className="text-sm">Push Notifications</Label>
      </div>
    );
  }

  // Card variant - full card with description
  if (variant === 'card') {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle className="text-lg">Push Notifications</CardTitle>
            </div>
            {getStatusBadge()}
          </div>
          <CardDescription>
            Receive instant notifications on your device, even when the browser is closed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSupported ? (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>Push notifications are not supported in this browser.</span>
            </div>
          ) : permission === 'denied' ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Notifications are blocked by your browser.</span>
              </div>
              <p className="text-xs text-muted-foreground">
                To enable notifications, click the lock icon in your browser's address bar and allow notifications.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isSubscribed ? (
                  <>
                    <BellRing className="h-4 w-4 text-green-500" />
                    <span className="text-sm">You're receiving notifications</span>
                  </>
                ) : (
                  <>
                    <BellOff className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Notifications are off</span>
                  </>
                )}
              </div>
              <Switch
                checked={isSubscribed}
                onCheckedChange={toggleSubscription}
                disabled={isLoading}
              />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default variant - button with status
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {getStatusBadge()}
      </div>
      
      {!isSupported ? (
        <p className="text-sm text-muted-foreground">
          Push notifications are not supported in this browser.
        </p>
      ) : permission === 'denied' ? (
        <div className="space-y-2">
          <p className="text-sm text-destructive">
            Notifications are blocked. Please enable them in your browser settings.
          </p>
        </div>
      ) : (
        <Button
          variant={isSubscribed ? "outline" : "default"}
          onClick={toggleSubscription}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Processing...
            </span>
          ) : isSubscribed ? (
            <span className="flex items-center gap-2">
              <BellOff className="h-4 w-4" />
              Disable Notifications
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Enable Notifications
            </span>
          )}
        </Button>
      )}
    </div>
  );
}
