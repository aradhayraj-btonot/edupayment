import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bug, CheckCircle2, RefreshCw, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface BugReport {
  id: string;
  title: string;
  description: string;
  suggested_fix: string | null;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  status: 'open' | 'resolved' | 'ignored';
  metadata: any;
  occurred_at: string;
  created_at: string;
}

const sevColor: Record<string, string> = {
  critical: 'bg-destructive text-destructive-foreground',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-white',
  low: 'bg-muted text-muted-foreground',
};

const SevIcon = ({ s }: { s: string }) =>
  s === 'critical' ? <AlertCircle className="w-4 h-4" /> :
  s === 'high' ? <AlertTriangle className="w-4 h-4" /> :
  <Info className="w-4 h-4" />;

export const BugsManager = () => {
  const qc = useQueryClient();

  const { data: bugs = [], isLoading, refetch } = useQuery({
    queryKey: ['bug-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bug_reports' as any)
        .select('*')
        .order('occurred_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as unknown as BugReport[];
    },
    refetchInterval: 30000,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('bug_reports' as any).update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bug-reports'] });
      toast.success('Bug updated');
    },
  });

  const runScan = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('app-health-monitor', { body: {} });
      if (error) throw error;
      return data;
    },
    onSuccess: (d: any) => {
      toast.success(`Scan complete: ${d?.total ?? 0} probes, ${d?.failed ?? 0} failures, ${d?.inserted_bugs ?? 0} new bugs`);
      qc.invalidateQueries({ queryKey: ['bug-reports'] });
    },
    onError: (e: any) => toast.error('Scan failed: ' + e.message),
  });

  const open = bugs.filter(b => b.status === 'open');
  const resolved = bugs.filter(b => b.status !== 'open');
  const counts = {
    critical: open.filter(b => b.severity === 'critical').length,
    high: open.filter(b => b.severity === 'high').length,
    medium: open.filter(b => b.severity === 'medium').length,
    low: open.filter(b => b.severity === 'low').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bug className="w-6 h-6" /> AI Bug Monitor
          </h2>
          <p className="text-muted-foreground text-sm">Backend health-checks run every 1 minute. AI triages failures into bugs.</p>
        </div>
        <Button onClick={() => runScan.mutate()} disabled={runScan.isPending}>
          <RefreshCw className={`w-4 h-4 mr-2 ${runScan.isPending ? 'animate-spin' : ''}`} />
          Run scan now
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(['critical', 'high', 'medium', 'low'] as const).map(s => (
          <Card key={s}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm capitalize text-muted-foreground">{s}</span>
                <Badge className={sevColor[s]}>{counts[s]}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Open bugs ({open.length})</CardTitle>
          <CardDescription>Issues found by the AI health monitor</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <p className="text-muted-foreground text-sm">Loading…</p>}
          {!isLoading && open.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-green-500" />
              No open bugs. System healthy.
            </div>
          )}
          {open.map(bug => (
            <div key={bug.id} className="border border-border rounded-lg p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={sevColor[bug.severity]}>
                    <SevIcon s={bug.severity} />
                    <span className="ml-1 capitalize">{bug.severity}</span>
                  </Badge>
                  <Badge variant="outline">{bug.category}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(bug.occurred_at), 'MMM d, HH:mm')}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => updateStatus.mutate({ id: bug.id, status: 'resolved' })}>
                    Resolve
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => updateStatus.mutate({ id: bug.id, status: 'ignored' })}>
                    Ignore
                  </Button>
                </div>
              </div>
              <h4 className="font-semibold">{bug.title}</h4>
              <p className="text-sm text-muted-foreground">{bug.description}</p>
              {bug.suggested_fix && (
                <div className="text-sm bg-secondary rounded p-2">
                  <span className="font-medium">Fix: </span>{bug.suggested_fix}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {resolved.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resolved / Ignored ({resolved.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {resolved.slice(0, 20).map(bug => (
              <div key={bug.id} className="flex items-center justify-between text-sm border-b border-border pb-2">
                <span className="truncate">{bug.title}</span>
                <Badge variant="outline" className="capitalize">{bug.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
