import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

export interface MonthlyStats {
  totalCollected: number;
  pendingAmount: number;
  completedCount: number;
  pendingCount: number;
  studentCount: number;
}

export interface AnalyticsData {
  currentMonth: MonthlyStats;
  lastMonth: MonthlyStats;
  changes: {
    collections: { value: number; percentage: string; trend: 'up' | 'down' | 'neutral' };
    pending: { value: number; percentage: string; trend: 'up' | 'down' | 'neutral' };
    students: { value: number; percentage: string; trend: 'up' | 'down' | 'neutral' };
    paymentRate: { value: number; percentage: string; trend: 'up' | 'down' | 'neutral' };
  };
}

const calculateChange = (current: number, previous: number): { percentage: string; trend: 'up' | 'down' | 'neutral' } => {
  if (previous === 0) {
    if (current > 0) return { percentage: '+100%', trend: 'up' };
    return { percentage: '+0', trend: 'neutral' };
  }
  
  const change = ((current - previous) / previous) * 100;
  const formatted = change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
  
  return { percentage: formatted, trend };
};

export const useMonthlyAnalytics = (schoolId?: string) => {
  return useQuery({
    queryKey: ['monthly-analytics', schoolId],
    queryFn: async () => {
      const now = new Date();
      const currentMonthStart = startOfMonth(now).toISOString();
      const currentMonthEnd = endOfMonth(now).toISOString();
      const lastMonthStart = startOfMonth(subMonths(now, 1)).toISOString();
      const lastMonthEnd = endOfMonth(subMonths(now, 1)).toISOString();

      // Get current month payments
      let currentPaymentsQuery = supabase
        .from('payments')
        .select('amount, status, student_id, students!inner(school_id)')
        .gte('created_at', currentMonthStart)
        .lte('created_at', currentMonthEnd);

      if (schoolId) {
        currentPaymentsQuery = currentPaymentsQuery.eq('students.school_id', schoolId);
      }

      const { data: currentPayments = [], error: currentPaymentsError } = await currentPaymentsQuery;
      if (currentPaymentsError) throw currentPaymentsError;

      // Get last month payments
      let lastPaymentsQuery = supabase
        .from('payments')
        .select('amount, status, student_id, students!inner(school_id)')
        .gte('created_at', lastMonthStart)
        .lte('created_at', lastMonthEnd);

      if (schoolId) {
        lastPaymentsQuery = lastPaymentsQuery.eq('students.school_id', schoolId);
      }

      const { data: lastPayments = [], error: lastPaymentsError } = await lastPaymentsQuery;
      if (lastPaymentsError) throw lastPaymentsError;

      // Get current students count
      let currentStudentsQuery = supabase
        .from('students')
        .select('id, created_at');

      if (schoolId) {
        currentStudentsQuery = currentStudentsQuery.eq('school_id', schoolId);
      }

      const { data: allStudents = [], error: studentsError } = await currentStudentsQuery;
      if (studentsError) throw studentsError;

      // Calculate current month stats
      const currentCompleted = currentPayments.filter(p => p.status === 'completed');
      const currentPending = currentPayments.filter(p => p.status === 'pending');
      const currentStudentCount = allStudents.length;
      const lastMonthStudentCount = allStudents.filter(s => new Date(s.created_at) < new Date(currentMonthStart)).length;

      const currentMonth: MonthlyStats = {
        totalCollected: currentCompleted.reduce((sum, p) => sum + Number(p.amount), 0),
        pendingAmount: currentPending.reduce((sum, p) => sum + Number(p.amount), 0),
        completedCount: currentCompleted.length,
        pendingCount: currentPending.length,
        studentCount: currentStudentCount,
      };

      // Calculate last month stats
      const lastCompleted = lastPayments.filter(p => p.status === 'completed');
      const lastPending = lastPayments.filter(p => p.status === 'pending');

      const lastMonth: MonthlyStats = {
        totalCollected: lastCompleted.reduce((sum, p) => sum + Number(p.amount), 0),
        pendingAmount: lastPending.reduce((sum, p) => sum + Number(p.amount), 0),
        completedCount: lastCompleted.length,
        pendingCount: lastPending.length,
        studentCount: lastMonthStudentCount,
      };

      // Calculate payment rates
      const currentPaymentRate = currentMonth.completedCount + currentMonth.pendingCount > 0
        ? (currentMonth.completedCount / (currentMonth.completedCount + currentMonth.pendingCount)) * 100
        : 0;
      const lastPaymentRate = lastMonth.completedCount + lastMonth.pendingCount > 0
        ? (lastMonth.completedCount / (lastMonth.completedCount + lastMonth.pendingCount)) * 100
        : 0;

      // Calculate changes
      const changes: AnalyticsData['changes'] = {
        collections: {
          value: currentMonth.totalCollected - lastMonth.totalCollected,
          ...calculateChange(currentMonth.totalCollected, lastMonth.totalCollected),
        },
        pending: {
          value: currentMonth.pendingAmount - lastMonth.pendingAmount,
          ...calculateChange(currentMonth.pendingAmount, lastMonth.pendingAmount),
        },
        students: {
          value: currentMonth.studentCount - lastMonth.studentCount,
          percentage: `+${currentMonth.studentCount - lastMonth.studentCount}`,
          trend: currentMonth.studentCount >= lastMonth.studentCount ? 'up' : 'down',
        },
        paymentRate: {
          value: currentPaymentRate - lastPaymentRate,
          ...calculateChange(currentPaymentRate, lastPaymentRate),
        },
      };

      return {
        currentMonth,
        lastMonth,
        changes,
      } as AnalyticsData;
    },
    enabled: true,
  });
};
