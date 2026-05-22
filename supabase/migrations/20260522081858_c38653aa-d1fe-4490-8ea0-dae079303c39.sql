
-- Bug reports table
CREATE TABLE IF NOT EXISTS public.bug_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  severity text NOT NULL DEFAULT 'medium',
  category text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  description text NOT NULL,
  suggested_fix text,
  status text NOT NULL DEFAULT 'open',
  metadata jsonb DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON public.bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_severity ON public.bug_reports(severity);
CREATE INDEX IF NOT EXISTS idx_bug_reports_occurred_at ON public.bug_reports(occurred_at DESC);

ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team can view bug reports"
  ON public.bug_reports FOR SELECT TO authenticated
  USING (public.has_team_role(auth.uid()));

CREATE POLICY "Team can update bug reports"
  ON public.bug_reports FOR UPDATE TO authenticated
  USING (public.has_team_role(auth.uid()))
  WITH CHECK (public.has_team_role(auth.uid()));

CREATE POLICY "Team can delete bug reports"
  ON public.bug_reports FOR DELETE TO authenticated
  USING (public.has_team_role(auth.uid()));

CREATE TRIGGER bug_reports_updated_at
  BEFORE UPDATE ON public.bug_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Enable cron extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
