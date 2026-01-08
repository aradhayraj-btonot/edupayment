import { useEffect, useState } from 'react';
import { Send, Bell, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useSendPushNotification } from '@/hooks/usePushNotifications';

interface SendPushNotificationDialogProps {
  schoolId?: string;
  trigger?: React.ReactNode;
}

export function SendPushNotificationDialog({ schoolId, trigger }: SendPushNotificationDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false);

  const { sendNotification, isLoading } = useSendPushNotification();

  useEffect(() => {
    if (!open) return;

    const loadRecipients = async () => {
      try {
        setIsLoadingRecipients(true);

        let query = supabase
          .from('push_subscriptions')
          .select('id', { count: 'exact', head: true });

        if (schoolId) {
          query = query.eq('school_id', schoolId);
        }

        const { count, error } = await query;
        if (error) throw error;

        setRecipientCount(count ?? 0);
      } catch (e) {
        // Avoid blocking sending; this is just a helper UI.
        console.error('[Push] Failed to load recipient count:', e);
        setRecipientCount(null);
      } finally {
        setIsLoadingRecipients(false);
      }
    };

    loadRecipients();
  }, [open, schoolId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !body.trim()) {
      return;
    }

    try {
      await sendNotification({
        schoolId,
        title: title.trim(),
        body: body.trim(),
        url: url.trim() || undefined,
      });

      // Reset form and close dialog
      setTitle('');
      setBody('');
      setUrl('');
      setOpen(false);
    } catch (error) {
      // Error is handled by the hook
      console.error('Failed to send notification:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="default">
            <Bell className="h-4 w-4 mr-2" />
            Send Push Notification
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Send Push Notification
          </DialogTitle>
          <DialogDescription className="space-y-1">
            <span>
              Send an instant notification to all subscribed users
              {schoolId ? ' in this school' : ''}.
            </span>
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              {isLoadingRecipients
                ? 'Checking recipients…'
                : recipientCount === null
                  ? 'Recipients: unknown'
                  : `Subscribed devices: ${recipientCount}`}
            </span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {recipientCount === 0 && (
              <Alert>
                <AlertTitle>No recipients yet</AlertTitle>
                <AlertDescription>
                  Nobody has enabled push notifications. Ask users to open their dashboard settings and tap
                  “Enable Notifications”. (Requires a supported browser and HTTPS.)
                </AlertDescription>
              </Alert>
            )}
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Notification title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="body">Message *</Label>
              <Textarea
                id="body"
                placeholder="Notification message..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={500}
                rows={3}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="url">Link (optional)</Label>
              <Input
                id="url"
                type="text"
                placeholder="/parent or /admin"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Where users go when they click the notification
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim() || !body.trim()}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Sending...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Send Notification
                </span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
