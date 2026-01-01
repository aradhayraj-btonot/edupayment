-- Create enum for ticket status
CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- Create enum for ticket category
CREATE TYPE public.ticket_category AS ENUM ('payment', 'technical', 'account', 'fee_structure', 'notification', 'other');

-- Create support tickets table
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  category ticket_category NOT NULL DEFAULT 'other',
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status ticket_status NOT NULL DEFAULT 'open',
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets"
ON public.support_tickets
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own tickets
CREATE POLICY "Users can create own tickets"
ON public.support_tickets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view tickets from their school
CREATE POLICY "Admins can view school tickets"
ON public.support_tickets
FOR SELECT
USING (admin_has_school_access(auth.uid(), school_id));

-- Admins can create tickets for their school
CREATE POLICY "Admins can create school tickets"
ON public.support_tickets
FOR INSERT
WITH CHECK (admin_has_school_access(auth.uid(), school_id));

-- Team can view all tickets
CREATE POLICY "Team can view all tickets"
ON public.support_tickets
FOR SELECT
USING (has_team_role(auth.uid()));

-- Team can manage all tickets
CREATE POLICY "Team can manage all tickets"
ON public.support_tickets
FOR ALL
USING (has_team_role(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();