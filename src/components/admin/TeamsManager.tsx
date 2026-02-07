import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  Users, 
  Loader2,
  Shield,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

interface TeamProfile {
  id: string;
  username: string;
  player1_name: string | null;
  player2_name: string | null;
  player3_name: string | null;
  created_at: string;
  role: 'admin' | 'user';
}

const createTeamSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().min(2, 'Team name must be at least 2 characters').max(50),
  player1_name: z.string().min(2, 'Player 1 name is required').max(100),
  player2_name: z.string().min(2, 'Player 2 name is required').max(100),
  player3_name: z.string().min(2, 'Player 3 name is required').max(100),
});

export function TeamsManager() {
  const [teams, setTeams] = useState<TeamProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [player3Name, setPlayer3Name] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setIsLoading(true);
    
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profiles) {
      const teamsWithRoles = await Promise.all(
        profiles.map(async (profile) => {
          const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id);

          const isAdmin = roles?.some(r => r.role === 'admin');
          return {
            ...profile,
            role: isAdmin ? 'admin' : 'user',
          } as TeamProfile;
        })
      );
      setTeams(teamsWithRoles);
    }
    
    setIsLoading(false);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setPlayer1Name('');
    setPlayer2Name('');
    setPlayer3Name('');
    setRole('user');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = createTeamSchema.safeParse({ 
      email, password, username, 
      player1_name: player1Name, 
      player2_name: player2Name, 
      player3_name: player3Name 
    });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: { 
          email, password, username, role,
          player1_name: player1Name,
          player2_name: player2Name,
          player3_name: player3Name,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success('Team created successfully');
      setIsDialogOpen(false);
      resetForm();
      fetchTeams();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create team');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (teamId: string, teamName: string) => {
    if (!confirm(`Are you sure you want to delete team "${teamName}"? This cannot be undone.`)) return;

    try {
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { userId: teamId },
      });

      if (error) throw error;

      toast.success('Team deleted');
      fetchTeams();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete team');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-mono">Teams</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="font-mono cyber-glow">
              <Plus className="h-4 w-4 mr-2" />
              Add Team
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-mono">Create Team</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="font-mono">Team Name</Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Team Alpha"
                  required
                  className="cyber-input"
                />
              </div>

              <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border">
                <Label className="font-mono text-sm text-muted-foreground uppercase tracking-wider">Team Members (3 Players)</Label>
                <div className="space-y-2">
                  <Label className="font-mono text-xs">Player 1</Label>
                  <Input
                    value={player1Name}
                    onChange={(e) => setPlayer1Name(e.target.value)}
                    placeholder="Player 1 full name"
                    required
                    className="cyber-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-xs">Player 2</Label>
                  <Input
                    value={player2Name}
                    onChange={(e) => setPlayer2Name(e.target.value)}
                    placeholder="Player 2 full name"
                    required
                    className="cyber-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-xs">Player 3</Label>
                  <Input
                    value={player3Name}
                    onChange={(e) => setPlayer3Name(e.target.value)}
                    placeholder="Player 3 full name"
                    required
                    className="cyber-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-mono">Login Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="team@example.com"
                  required
                  className="cyber-input"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-mono">Login Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="cyber-input"
                />
                <p className="text-xs text-muted-foreground">
                  Shared password for the team (at least 8 characters)
                </p>
              </div>

              <div className="space-y-2">
                <Label className="font-mono">Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as 'admin' | 'user')}>
                  <SelectTrigger className="cyber-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Team</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="cyber-glow">
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Create Team'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground font-mono">
          Loading teams...
        </div>
      ) : teams.length === 0 ? (
        <Card className="cyber-card">
          <CardContent className="py-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground font-mono">No teams yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {teams.map((team) => (
            <Card key={team.id} className="cyber-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      team.role === 'admin' 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {team.role === 'admin' ? (
                        <Shield className="h-5 w-5" />
                      ) : (
                        <Users className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-mono font-semibold">{team.username}</h3>
                        <Badge variant={team.role === 'admin' ? 'default' : 'secondary'}>
                          {team.role === 'admin' ? 'admin' : 'team'}
                        </Badge>
                      </div>
                      {team.role !== 'admin' && (team.player1_name || team.player2_name || team.player3_name) && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {[team.player1_name, team.player2_name, team.player3_name]
                            .filter(Boolean)
                            .map((name, i) => (
                              <Badge key={i} variant="outline" className="text-xs font-mono">
                                <User className="h-3 w-3 mr-1" />
                                {name}
                              </Badge>
                            ))}
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground font-mono mt-1">
                        Joined {new Date(team.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(team.id, team.username)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
