import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  school_id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  created_by: string | null;
}

interface NotificationRead {
  id: string;
  notification_id: string;
  user_id: string;
  read_at: string;
}

// Fetch notifications for a school (admin)
export function useSchoolNotifications(schoolId: string | undefined) {
  return useQuery({
    queryKey: ["notifications", "school", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("school_id", schoolId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!schoolId,
  });
}

// Fetch notifications for parent's children's schools
export function useParentNotifications() {
  return useQuery({
    queryKey: ["notifications", "parent"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get schools of parent's children
      const { data: students } = await supabase
        .from("students")
        .select("school_id")
        .eq("parent_id", user.id);

      if (!students || students.length === 0) return [];

      const schoolIds = [...new Set(students.map(s => s.school_id))];

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .in("school_id", schoolIds)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Notification[];
    },
  });
}

// Fetch read status for notifications
export function useNotificationReads() {
  return useQuery({
    queryKey: ["notification-reads"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("notification_reads")
        .select("*")
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data as NotificationRead[];
    },
  });
}

// Mark notification as read
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("notification_reads")
        .upsert({
          notification_id: notificationId,
          user_id: user.id,
        }, {
          onConflict: "notification_id,user_id",
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-reads"] });
    },
  });
}

// Send notification (admin only)
export function useSendNotification() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: { school_id: string; title: string; message: string; type?: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("send-notification", {
        body: data,
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({
        title: "Notification sent!",
        description: `Sent to ${data.emails_sent} parents via email`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send notification",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Send receipt email (admin only)
export function useSendReceipt() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (paymentId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("send-receipt", {
        body: { payment_id: paymentId },
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      if (data.email_sent) {
        toast({
          title: "Receipt sent!",
          description: `Receipt emailed to ${data.parent_email}`,
        });
      } else {
        toast({
          title: "Receipt not sent",
          description: "Could not send email to parent",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send receipt",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
