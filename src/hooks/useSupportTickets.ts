import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketCategory = 'payment' | 'technical' | 'account' | 'fee_structure' | 'notification' | 'other';

export interface SupportTicket {
  id: string;
  user_id: string;
  school_id: string | null;
  category: TicketCategory;
  subject: string;
  message: string;
  status: TicketStatus;
  resolved_by: string | null;
  resolved_at: string | null;
  resolution_note: string | null;
  created_at: string;
  updated_at: string;
  school?: { name: string } | null;
  user_profile?: { full_name: string; email: string } | null;
}

// Hook for users to get their own tickets
export const useMyTickets = () => {
  return useQuery({
    queryKey: ['my-support-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          school:schools(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SupportTicket[];
    },
  });
};

// Hook for team to get all tickets
export const useAllTickets = () => {
  return useQuery({
    queryKey: ['all-support-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          school:schools(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch user profiles separately to avoid RLS issues
      const userIds = [...new Set(data?.map(t => t.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return data?.map(ticket => ({
        ...ticket,
        user_profile: profileMap.get(ticket.user_id) || null
      })) as SupportTicket[];
    },
  });
};

// Hook to create a ticket
export const useCreateTicket = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticket: {
      category: TicketCategory;
      subject: string;
      message: string;
      school_id?: string | null;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          category: ticket.category,
          subject: ticket.subject,
          message: ticket.message,
          school_id: ticket.school_id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Ticket created", description: "Your support ticket has been submitted." });
      queryClient.invalidateQueries({ queryKey: ['my-support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['all-support-tickets'] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

// Hook for team to update ticket status
export const useUpdateTicketStatus = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      ticketId, 
      status, 
      resolution_note 
    }: { 
      ticketId: string; 
      status: TicketStatus; 
      resolution_note?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updateData: Record<string, unknown> = { status };
      
      if (status === 'resolved' || status === 'closed') {
        updateData.resolved_by = user.id;
        updateData.resolved_at = new Date().toISOString();
        if (resolution_note) {
          updateData.resolution_note = resolution_note;
        }
      }

      const { data, error } = await supabase
        .from('support_tickets')
        .update(updateData)
        .eq('id', ticketId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Ticket updated", description: "The ticket status has been updated." });
      queryClient.invalidateQueries({ queryKey: ['all-support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['my-support-tickets'] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};
