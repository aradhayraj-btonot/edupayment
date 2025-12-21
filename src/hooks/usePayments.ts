import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Payment {
  id: string;
  student_fee_id: string;
  student_id: string;
  parent_id: string | null;
  amount: number;
  payment_method: string;
  transaction_id: string | null;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_date: string | null;
  receipt_url: string | null;
  notes: string | null;
  created_at: string;
  students?: {
    first_name: string;
    last_name: string;
    class: string;
  };
}

export const usePayments = () => {
  return useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          students (
            first_name,
            last_name,
            class
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Payment[];
    },
  });
};

export const useParentPayments = () => {
  return useQuery({
    queryKey: ['parent-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          students (
            first_name,
            last_name,
            class
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Payment[];
    },
  });
};

export interface CreatePaymentData {
  student_fee_id: string;
  student_id: string;
  parent_id: string;
  amount: number;
  payment_method: string;
  transaction_id?: string;
  status?: 'pending' | 'completed' | 'failed' | 'refunded';
  notes?: string;
}

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payment: CreatePaymentData) => {
      const { data, error } = await supabase
        .from('payments')
        .insert(payment)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['parent-payments'] });
      queryClient.invalidateQueries({ queryKey: ['student-fees'] });
      toast.success('Payment recorded successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const usePaymentStats = () => {
  return useQuery({
    queryKey: ['payment-stats'],
    queryFn: async () => {
      const { data: payments, error } = await supabase
        .from('payments')
        .select('amount, status');
      
      if (error) throw error;
      
      const completed = payments.filter(p => p.status === 'completed');
      const pending = payments.filter(p => p.status === 'pending');
      
      return {
        totalCollected: completed.reduce((sum, p) => sum + Number(p.amount), 0),
        pendingAmount: pending.reduce((sum, p) => sum + Number(p.amount), 0),
        completedCount: completed.length,
        pendingCount: pending.length,
      };
    },
  });
};
