import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TeamStats {
  totalSchools: number;
  totalParents: number;
  totalAdmins: number;
  totalPayments: number;
  totalRevenue: number;
  activeSubscriptions: number;
}

export const useTeamStats = () => {
  return useQuery({
    queryKey: ['team-stats'],
    queryFn: async (): Promise<TeamStats> => {
      const [schools, parents, admins, payments, subscriptions] = await Promise.all([
        supabase.from('schools').select('id', { count: 'exact' }),
        supabase.from('user_roles').select('id', { count: 'exact' }).eq('role', 'parent'),
        supabase.from('user_roles').select('id', { count: 'exact' }).eq('role', 'admin'),
        supabase.from('payments').select('amount').eq('status', 'completed'),
        supabase.from('school_subscriptions').select('id', { count: 'exact' }).eq('status', 'active'),
      ]);

      const totalRevenue = payments.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      return {
        totalSchools: schools.count || 0,
        totalParents: parents.count || 0,
        totalAdmins: admins.count || 0,
        totalPayments: payments.data?.length || 0,
        totalRevenue,
        activeSubscriptions: subscriptions.count || 0,
      };
    },
  });
};

export const useAllSchools = () => {
  return useQuery({
    queryKey: ['team-schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select(`
          *,
          school_subscriptions (
            id,
            plan,
            status,
            expires_at,
            amount
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useAllParents = () => {
  return useQuery({
    queryKey: ['team-parents'],
    queryFn: async () => {
      const { data: parentRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'parent');

      if (rolesError) throw rolesError;

      const parentIds = parentRoles?.map(r => r.user_id) || [];
      
      if (parentIds.length === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', parentIds);

      if (profilesError) throw profilesError;

      // Get student counts for each parent
      const { data: students } = await supabase
        .from('students')
        .select('parent_id')
        .in('parent_id', parentIds);

      const studentCounts = students?.reduce((acc, s) => {
        acc[s.parent_id] = (acc[s.parent_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return profiles?.map(p => ({
        ...p,
        studentCount: studentCounts[p.id] || 0,
      })) || [];
    },
  });
};

export const useAllAdmins = () => {
  return useQuery({
    queryKey: ['team-admins'],
    queryFn: async () => {
      const { data: adminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, school_id')
        .eq('role', 'admin');

      if (rolesError) throw rolesError;

      const adminIds = adminRoles?.map(r => r.user_id) || [];
      
      if (adminIds.length === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', adminIds);

      if (profilesError) throw profilesError;

      // Get school names
      const schoolIds = adminRoles?.map(r => r.school_id).filter(Boolean) || [];
      const { data: schools } = await supabase
        .from('schools')
        .select('id, name')
        .in('id', schoolIds);

      const schoolMap = schools?.reduce((acc, s) => {
        acc[s.id] = s.name;
        return acc;
      }, {} as Record<string, string>) || {};

      const adminSchoolMap = adminRoles?.reduce((acc, r) => {
        if (r.school_id) acc[r.user_id] = r.school_id;
        return acc;
      }, {} as Record<string, string>) || {};

      return profiles?.map(p => ({
        ...p,
        schoolId: adminSchoolMap[p.id],
        schoolName: schoolMap[adminSchoolMap[p.id]] || 'No School',
      })) || [];
    },
  });
};

export const useAllPayments = () => {
  return useQuery({
    queryKey: ['team-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          students (
            first_name,
            last_name,
            school_id,
            schools (name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useAllSubscriptions = () => {
  return useQuery({
    queryKey: ['team-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('school_subscriptions')
        .select(`
          *,
          schools (name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useCreateCustomSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      schoolId,
      plan,
      amount,
      durationMonths,
    }: {
      schoolId: string;
      plan: 'starter' | 'professional' | 'enterprise';
      amount: number;
      durationMonths: number;
    }) => {
      const startsAt = new Date();
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

      const { data, error } = await supabase
        .from('school_subscriptions')
        .upsert({
          school_id: schoolId,
          plan,
          amount,
          status: 'active',
          starts_at: startsAt.toISOString(),
          expires_at: expiresAt.toISOString(),
          razorpay_payment_id: `TEAM_CUSTOM_${Date.now()}`,
        }, { onConflict: 'school_id' })
        .select()
        .single();

      if (error) throw error;

      // Update school subscription status
      await supabase
        .from('schools')
        .update({ subscription_active: true })
        .eq('id', schoolId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['team-schools'] });
      queryClient.invalidateQueries({ queryKey: ['team-stats'] });
      toast.success('Custom subscription created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create subscription: ' + error.message);
    },
  });
};

export const useCreateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      password,
      fullName,
      schoolId,
    }: {
      email: string;
      password: string;
      fullName: string;
      schoolId: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('create-admin', {
        body: { email, password, fullName, schoolId }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-admins'] });
      queryClient.invalidateQueries({ queryKey: ['team-stats'] });
      toast.success('Admin account created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create admin: ' + error.message);
    },
  });
};

export const useSupportTickets = () => {
  return useQuery({
    queryKey: ['support-tickets'],
    queryFn: async () => {
      // For now, return mock data - in production, this would be a real table
      return [
        { id: '1', subject: 'Payment Issue', status: 'open', from: 'parent@example.com', created_at: new Date().toISOString() },
        { id: '2', subject: 'Subscription Query', status: 'resolved', from: 'admin@school.com', created_at: new Date().toISOString() },
      ];
    },
  });
};
