import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Student {
  id: string;
  school_id: string;
  parent_id: string | null;
  first_name: string;
  last_name: string;
  class: string;
  section: string | null;
  roll_number: string | null;
  admission_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateStudentData {
  school_id: string;
  parent_id?: string | null;
  first_name: string;
  last_name: string;
  class: string;
  section?: string | null;
  roll_number?: string | null;
}

export const useStudents = (schoolId?: string) => {
  return useQuery({
    queryKey: ['students', schoolId],
    queryFn: async () => {
      let query = supabase.from('students').select('*').order('created_at', { ascending: false });
      
      if (schoolId) {
        query = query.eq('school_id', schoolId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Student[];
    },
    enabled: !!schoolId,
  });
};

export const useParentStudents = () => {
  return useQuery({
    queryKey: ['parent-students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Student[];
    },
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (student: CreateStudentData) => {
      const { data, error } = await supabase
        .from('students')
        .insert(student)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Student> & { id: string }) => {
      const { data, error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
