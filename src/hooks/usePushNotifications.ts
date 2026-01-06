import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// VAPID public key - this should match the one in your edge function
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
}

// Convert base64 string to Uint8Array for push subscription
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications(schoolId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [permission, setPermission] = useState<PermissionState>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Check if push notifications are supported
  const isSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

  // Initialize and check current state
  useEffect(() => {
    if (!isSupported) {
      setPermission('unsupported');
      return;
    }

    // Check notification permission
    setPermission(Notification.permission as PermissionState);

    // Register service worker and check subscription
    const initServiceWorker = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        setRegistration(reg);
        console.log('[Push] Service worker registered:', reg);

        // Check if already subscribed
        const subscription = await reg.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
        console.log('[Push] Current subscription:', subscription);
      } catch (error) {
        console.error('[Push] Service worker registration failed:', error);
      }
    };

    initServiceWorker();
  }, [isSupported]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast({
        title: 'Not Supported',
        description: 'Push notifications are not supported in this browser.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result as PermissionState);

      if (result === 'granted') {
        toast({
          title: 'Permission Granted',
          description: 'You can now receive push notifications.',
        });
        return true;
      } else if (result === 'denied') {
        toast({
          title: 'Permission Denied',
          description: 'Please enable notifications in your browser settings.',
          variant: 'destructive',
        });
        return false;
      }

      return false;
    } catch (error) {
      console.error('[Push] Permission request failed:', error);
      return false;
    }
  }, [isSupported, toast]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !registration || !user) {
      return false;
    }

    setIsLoading(true);

    try {
      // Request permission if not granted
      if (Notification.permission !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          setIsLoading(false);
          return false;
        }
      }

      // Check for VAPID key
      if (!VAPID_PUBLIC_KEY) {
        toast({
          title: 'Configuration Error',
          description: 'Push notification public key is not configured.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return false;
      }

      // Subscribe to push manager
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      });

      console.log('[Push] Subscribed:', subscription);

      // Extract keys from subscription
      const subscriptionJson = subscription.toJSON();
      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        p256dh: subscriptionJson.keys?.p256dh || '',
        auth: subscriptionJson.keys?.auth || '',
      };

      // Save subscription to database
      const { error } = await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        school_id: schoolId || null,
        endpoint: subscriptionData.endpoint,
        p256dh: subscriptionData.p256dh,
        auth: subscriptionData.auth,
        user_agent: navigator.userAgent,
      }, {
        onConflict: 'endpoint',
      });

      if (error) {
        console.error('[Push] Failed to save subscription:', error);
        toast({
          title: 'Subscription Failed',
          description: 'Failed to save your notification preferences.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return false;
      }

      setIsSubscribed(true);
      toast({
        title: 'Notifications Enabled',
        description: 'You will now receive push notifications.',
      });
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('[Push] Subscription failed:', error);
      toast({
        title: 'Subscription Failed',
        description: error instanceof Error ? error.message : 'Failed to subscribe to notifications.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return false;
    }
  }, [isSupported, registration, user, schoolId, requestPermission, toast]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!registration || !user) {
      return false;
    }

    setIsLoading(true);

    try {
      // Get current subscription
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        // Unsubscribe from push manager
        await subscription.unsubscribe();

        // Remove from database
        const { error } = await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', subscription.endpoint);

        if (error) {
          console.error('[Push] Failed to remove subscription from database:', error);
        }
      }

      setIsSubscribed(false);
      toast({
        title: 'Notifications Disabled',
        description: 'You will no longer receive push notifications.',
      });
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('[Push] Unsubscribe failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to disable notifications.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return false;
    }
  }, [registration, user, toast]);

  // Toggle subscription
  const toggleSubscription = useCallback(async () => {
    if (isSubscribed) {
      return unsubscribe();
    } else {
      return subscribe();
    }
  }, [isSubscribed, subscribe, unsubscribe]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe,
    toggleSubscription,
  };
}

// Hook for sending push notifications (admin/team use)
export function useSendPushNotification() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const sendNotification = useCallback(async (params: {
    schoolId?: string;
    userId?: string;
    title: string;
    body: string;
    url?: string;
  }) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: params,
      });

      console.log('[Push] Response:', { data, error });

      if (error) {
        // Check if it's a FunctionsHttpError with a response body
        const errorMessage = error.message || 'Failed to send notification';
        throw new Error(errorMessage);
      }

      // Check if response indicates no subscriptions
      if (data?.sent === 0) {
        toast({
          title: 'No Recipients',
          description: data?.message || 'No users have enabled push notifications yet.',
        });
      } else {
        toast({
          title: 'Notification Sent',
          description: `Successfully sent to ${data?.sent || 0} recipients.`,
        });
      }

      setIsLoading(false);
      return data;
    } catch (error) {
      console.error('[Push] Send notification failed:', error);
      
      // Parse error message for better user feedback
      let errorMessage = 'Failed to send notification.';
      if (error instanceof Error) {
        // Check for common error patterns
        if (error.message.includes('non-2xx')) {
          errorMessage = 'Server error. Please try again.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Check your connection.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: 'Failed to send notification',
        description: errorMessage,
        variant: 'destructive',
      });
      setIsLoading(false);
      throw error;
    }
  }, [toast]);

  return {
    sendNotification,
    isLoading,
  };
}
