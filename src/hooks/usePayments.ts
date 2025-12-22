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
  screenshot_url: string | null;
  created_at: string;
  students?: {
    first_name: string;
    last_name: string;
    class: string;
    parent_email: string | null;
    school_id: string;
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
            class,
            parent_email,
            school_id
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
            class,
            parent_email,
            school_id
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
  screenshot_url?: string;
}

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payment: CreatePaymentData) => {
      const { data, error } = await supabase
        .from('payments')
        .insert(payment as any)
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

export const useUploadScreenshot = () => {
  return useMutation({
    mutationFn: async ({ file, paymentId, userId }: { file: File; paymentId: string; userId: string }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${paymentId}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('payment-screenshots')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('payment-screenshots')
        .getPublicUrl(fileName);
      
      // Update payment with screenshot URL
      const { error: updateError } = await supabase
        .from('payments')
        .update({ screenshot_url: publicUrl } as any)
        .eq('id', paymentId);
      
      if (updateError) throw updateError;
      
      return publicUrl;
    },
    onSuccess: () => {
      toast.success('Screenshot uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to upload screenshot: ' + error.message);
    },
  });
};

export const useVerifyPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ paymentId, action }: { paymentId: string; action: 'approve' | 'reject' }) => {
      const newStatus = action === 'approve' ? 'completed' : 'failed';
      
      const { data, error } = await supabase
        .from('payments')
        .update({ status: newStatus } as any)
        .eq('id', paymentId)
        .select(`
          *,
          students (
            first_name,
            last_name,
            parent_email,
            school_id
          )
        `)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('Payment not found');
      
      // If approved, mark the student_fee as paid
      if (action === 'approve' && data.student_fee_id) {
        const { error: feeError } = await supabase
          .from('student_fees')
          .update({ status: 'paid' } as any)
          .eq('id', data.student_fee_id);
        
        if (feeError) console.error('Failed to update fee status:', feeError);
      }
      
      return { payment: data, action };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['parent-payments'] });
      queryClient.invalidateQueries({ queryKey: ['student-fees'] });
      queryClient.invalidateQueries({ queryKey: ['pending-payments'] });
      toast.success(data.action === 'approve' ? 'Payment verified successfully' : 'Payment rejected');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const usePendingPayments = () => {
  return useQuery({
    queryKey: ['pending-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          students (
            first_name,
            last_name,
            class,
            parent_email,
            school_id
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Payment[];
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
