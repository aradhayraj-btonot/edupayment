import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export const AssignTeamByUID = () => {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleAssign = async () => {
    if (!userId.trim()) {
      toast.error('Please enter a User ID');
      return;
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId.trim())) {
      toast.error('Invalid User ID format. Please enter a valid UUID.');
      return;
    }

    setLoading(true);
    try {
      // Check if user already has team role
      const { data: existing } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId.trim())
        .eq('role', 'team')
        .maybeSingle();

      if (existing) {
        toast.info('User already has the team role');
        setLoading(false);
        return;
      }

      // Check if the user exists in profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', userId.trim())
        .maybeSingle();

      if (!profile) {
        toast.error('No user found with this ID');
        setLoading(false);
        return;
      }

      // Remove existing non-team roles
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId.trim());

      // Assign team role (no school_id needed for team)
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId.trim(),
          role: 'team',
        });

      if (error) throw error;

      toast.success(`Team role assigned to ${profile.full_name} (${profile.email})`);
      setUserId('');
      queryClient.invalidateQueries({ queryKey: ['team-stats'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign team role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Create Team Member
        </CardTitle>
        <CardDescription>
          Paste a user's UUID to promote them to a team member. This grants full administrative access to the EduPay platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <p className="text-sm text-destructive font-medium">⚠️ Warning</p>
          <p className="text-xs text-muted-foreground mt-1">
            Team members have unrestricted access to all schools, subscriptions, payments, and user data. Only promote trusted individuals.
          </p>
        </div>
        <div className="space-y-2">
          <Label>User ID (UUID)</Label>
          <Input
            placeholder="e.g. a1b2c3d4-e5f6-7890-abcd-ef1234567890"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="font-mono text-sm"
          />
        </div>
        <Button onClick={handleAssign} disabled={loading} className="w-full gap-2">
          <UserPlus className="w-4 h-4" />
          {loading ? 'Assigning...' : 'Promote to Team Member'}
        </Button>
      </CardContent>
    </Card>
  );
};
