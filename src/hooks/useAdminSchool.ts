import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export interface AdminSchool {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  upi_id: string | null;
  upi_qr_code_url: string | null;
  subscription_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export const useAdminSchool = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin-school', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // First get the school_id from user_roles for this admin
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('school_id')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleError) throw roleError;
      if (!roleData?.school_id) return null;

      // Then fetch the school details
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .select('*')
        .eq('id', roleData.school_id)
        .single();

      if (schoolError) throw schoolError;
      return school as AdminSchool;
    },
    enabled: !!user?.id,
  });
};

export const useUpdateAdminSchool = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: Partial<AdminSchool> & { id: string }) => {
      const { id, ...updateData } = updates;
      const { data, error } = await supabase
        .from('schools')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-school', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      toast.success('School details updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
