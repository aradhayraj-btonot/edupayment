import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface School {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  upi_id: string | null;
  upi_qr_code_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSchoolData {
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  upi_id?: string | null;
  upi_qr_code_url?: string | null;
}

export const useSchools = () => {
  return useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as School[];
    },
  });
};

export const useCreateSchool = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (school: CreateSchoolData) => {
      const { data, error } = await supabase
        .from('schools')
        .insert(school)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      toast.success('School created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateSchool = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<School> & { id: string }) => {
      const { data, error } = await supabase
        .from('schools')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      toast.success('School updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUploadSchoolQRCode = () => {
  return useMutation({
    mutationFn: async ({ file, schoolId }: { file: File; schoolId: string }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${schoolId}/qr-code-${Date.now()}.${fileExt}`;
      
      // First check if bucket exists, if not this will fail gracefully
      const { error: uploadError } = await supabase.storage
        .from('school-assets')
        .upload(fileName, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('school-assets')
        .getPublicUrl(fileName);
      
      return publicUrl;
    },
    onSuccess: () => {
      toast.success('QR code uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to upload QR code: ' + error.message);
    },
  });
};
