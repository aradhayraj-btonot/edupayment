-- Allow clients to update their own push subscription rows (required for UPSERT on endpoint)
CREATE POLICY "Users can update their own push subscriptions"
ON public.push_subscriptions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Optional: allow team to update any push subscription (helps cleanup / reassignment)
CREATE POLICY "Team can manage all push subscriptions"
ON public.push_subscriptions
FOR UPDATE
USING (has_team_role(auth.uid()))
WITH CHECK (has_team_role(auth.uid()));
