import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAllSchools } from '@/hooks/useTeamData';
import { useQueryClient } from '@tanstack/react-query';

export const AssignAdminByUID = () => {
  const [userId, setUserId] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [loading, setLoading] = useState(false);
  const { data: schools } = useAllSchools();
  const queryClient = useQueryClient();

  const handleAssign = async () => {
    if (!userId.trim() || !schoolId) {
      toast.error('Please enter User ID and select a school');
      return;
    }

    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId.trim())) {
      toast.error('Invalid User ID format. Please enter a valid UUID.');
      return;
    }

    setLoading(true);
    try {
      // Check if user already has admin role for this school
      const { data: existing } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId.trim())
        .eq('role', 'admin')
        .eq('school_id', schoolId)
        .maybeSingle();

      if (existing) {
        toast.info('User already has admin role for this school');
        setLoading(false);
        return;
      }

      // Remove existing parent role if any
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId.trim())
        .eq('role', 'parent');

      // Assign admin role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId.trim(),
          role: 'admin',
          school_id: schoolId,
        });

      if (error) throw error;

      toast.success('Admin role assigned successfully!');
      setUserId('');
      setSchoolId('');
      queryClient.invalidateQueries({ queryKey: ['all-admins'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign admin role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Assign Admin by User ID
        </CardTitle>
        <CardDescription>
          Paste a user's UUID to promote them to admin for a specific school.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>User ID (UUID)</Label>
          <Input
            placeholder="e.g. a1b2c3d4-e5f6-7890-abcd-ef1234567890"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="font-mono text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label>Assign to School</Label>
          <Select value={schoolId} onValueChange={setSchoolId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a school" />
            </SelectTrigger>
            <SelectContent>
              {schools?.map((school) => (
                <SelectItem key={school.id} value={school.id}>
                  {school.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleAssign} disabled={loading} className="w-full gap-2">
          <UserPlus className="w-4 h-4" />
          {loading ? 'Assigning...' : 'Assign Admin Role'}
        </Button>
      </CardContent>
    </Card>
  );
};
