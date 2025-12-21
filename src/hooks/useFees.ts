import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FeeStructure {
  id: string;
  school_id: string;
  name: string;
  fee_type: 'tuition' | 'transport' | 'activities' | 'library' | 'laboratory' | 'sports' | 'annually' | 'other';
  amount: number;
  due_date: string | null;
  academic_year: string;
  description: string | null;
  is_active: boolean;
  recurrence_type: 'monthly' | 'annually' | 'one_time';
  created_at: string;
  updated_at: string;
}

export interface StudentFee {
  id: string;
  student_id: string;
  fee_structure_id: string;
  amount: number;
  discount: number;
  due_date: string;
  created_at: string;
  fee_structures?: FeeStructure;
  students?: {
    first_name: string;
    last_name: string;
    class: string;
  };
}

export const useFeeStructures = (schoolId?: string) => {
  return useQuery({
    queryKey: ['fee-structures', schoolId],
    queryFn: async () => {
      let query = supabase.from('fee_structures').select('*').order('created_at', { ascending: false });
      
      if (schoolId) {
        query = query.eq('school_id', schoolId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as FeeStructure[];
    },
  });
};

export const useStudentFees = (studentId?: string) => {
  return useQuery({
    queryKey: ['student-fees', studentId],
    queryFn: async () => {
      let query = supabase
        .from('student_fees')
        .select(`
          *,
          fee_structures (*),
          students (
            first_name,
            last_name,
            class
          )
        `)
        .order('due_date', { ascending: true });
      
      if (studentId) {
        query = query.eq('student_id', studentId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as StudentFee[];
    },
  });
};

export interface CreateFeeStructureData {
  school_id: string;
  name: string;
  fee_type: 'tuition' | 'transport' | 'activities' | 'library' | 'laboratory' | 'sports' | 'annually' | 'other';
  amount: number;
  due_date?: string | null;
  academic_year: string;
  description?: string | null;
  recurrence_type: 'monthly' | 'annually' | 'one_time';
}

export const useCreateFeeStructure = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (fee: CreateFeeStructureData) => {
      const { data, error } = await supabase
        .from('fee_structures')
        .insert([fee])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-structures'] });
      toast.success('Fee structure created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export interface AssignFeeData {
  student_id: string;
  fee_structure_id: string;
  amount: number;
  discount?: number;
  due_date: string;
}

export const useAssignFee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: AssignFeeData) => {
      const { data: result, error } = await supabase
        .from('student_fees')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-fees'] });
      toast.success('Fee assigned to student');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
