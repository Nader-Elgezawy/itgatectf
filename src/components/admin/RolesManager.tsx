import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldCheck, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

interface UserWithRole {
  id: string;
  username: string;
  role: 'admin' | 'user';
}

export function RolesManager() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username')
      .order('username');

    if (error) {
      console.error('Error fetching profiles:', error);
      setIsLoading(false);
      return;
    }

    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');

    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
      setIsLoading(false);
      return;
    }

    const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);
    const merged: UserWithRole[] = (data || []).map(p => ({
      id: p.id,
      username: p.username,
      role: (roleMap.get(p.id) as 'admin' | 'user') || 'user',
    }));

    setUsers(merged);
    setIsLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
    if (userId === user?.id) {
      toast.error("You can't change your own role");
      return;
    }

    setUpdatingId(userId);
    try {
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });

      if (insertError) throw insertError;

      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground font-mono">
        Loading users...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold font-mono">User Roles</h2>

      {users.length === 0 ? (
        <Card className="cyber-card">
          <CardContent className="py-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground font-mono">No users found.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="cyber-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-mono">Username</TableHead>
                <TableHead className="font-mono">Current Role</TableHead>
                <TableHead className="font-mono text-right">Change Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-mono font-semibold">
                    <div className="flex items-center gap-2">
                      {u.role === 'admin' ? (
                        <ShieldCheck className="h-4 w-4 text-primary" />
                      ) : (
                        <Shield className="h-4 w-4 text-muted-foreground" />
                      )}
                      {u.username}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={u.role === 'admin' ? 'default' : 'outline'}
                      className="font-mono"
                    >
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {u.id === user?.id ? (
                      <span className="text-xs text-muted-foreground font-mono">You</span>
                    ) : updatingId === u.id ? (
                      <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                    ) : (
                      <Select
                        value={u.role}
                        onValueChange={(val) => handleRoleChange(u.id, val as 'admin' | 'user')}
                      >
                        <SelectTrigger className="w-28 ml-auto font-mono">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
