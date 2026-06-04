import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Plus,
  Trash2,
  Users,
  Loader2,
  Copy,
  Check,
  User,
  X,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Team {
  id: string;
  team_name: string;
  player1_name: string | null;
  player2_name: string | null;
  player3_name: string | null;
  players: string[] | null;
  team_email: string;
  auth_user_id: string | null;
  created_at: string;
}

interface CreatedCredentials {
  team_name: string;
  team_email: string;
  team_password: string;
}

type Role = 'user' | 'admin';

export function TeamsManager() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credentials, setCredentials] = useState<CreatedCredentials | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [teamName, setTeamName] = useState('');
  const [role, setRole] = useState<Role>('user');
  const [players, setPlayers] = useState<string[]>(['', '', '']);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setTeams(data as Team[]);
    if (error) console.error('Error fetching teams:', error);
    setIsLoading(false);
  };

  const resetForm = () => {
    setTeamName('');
    setRole('user');
    setPlayers(['', '', '']);
    setCredentials(null);
  };

  const updatePlayer = (i: number, v: string) =>
    setPlayers((p) => p.map((x, idx) => (idx === i ? v : x)));
  const addPlayer = () => setPlayers((p) => [...p, '']);
  const removePlayer = (i: number) =>
    setPlayers((p) => (p.length <= 1 ? p : p.filter((_, idx) => idx !== i)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanedPlayers = players.map((p) => p.trim()).filter((p) => p.length > 0);

    if (!teamName.trim()) {
      toast.error('Team name is required');
      return;
    }
    if (teamName.trim().length < 2) {
      toast.error('Team name must be at least 2 characters');
      return;
    }
    if (cleanedPlayers.length < 1) {
      toast.error('At least one player is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          username: teamName.trim(),
          players: cleanedPlayers,
          role,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setCredentials({
        team_name: teamName.trim(),
        team_email: data.team_email,
        team_password: data.team_password,
      });

      toast.success('Team created successfully');
      fetchTeams();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create team');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (team: Team) => {
    if (!confirm(`Are you sure you want to delete team "${team.team_name}"? This cannot be undone.`)) return;

    try {
      if (team.auth_user_id) {
        const { error } = await supabase.functions.invoke('delete-user', {
          body: { userId: team.auth_user_id },
        });
        if (error) throw error;
      }

      await supabase.from('teams').delete().eq('id', team.id);

      toast.success('Team deleted');
      fetchTeams();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete team');
    }
  };

  const copyCredentials = async (email: string, password?: string) => {
    const text = password
      ? `Email: ${email}\nPassword: ${password}`
      : `Email: ${email}`;
    await navigator.clipboard.writeText(text);
    setCopiedId(email);
    toast.success('Credentials copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getPlayers = (t: Team): string[] => {
    if (t.players && t.players.length > 0) return t.players;
    return [t.player1_name, t.player2_name, t.player3_name].filter(
      (n): n is string => !!n && n.trim().length > 0
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-mono">Teams</h2>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
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

            {credentials ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                  <h3 className="font-mono font-semibold text-primary mb-3">Team Created Successfully!</h3>
                  <div className="space-y-2 font-mono text-sm">
                    <div>
                      <span className="text-muted-foreground">Team:</span>{' '}
                      <span className="font-semibold">{credentials.team_name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>{' '}
                      <span className="font-semibold">{credentials.team_email}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Password:</span>{' '}
                      <span className="font-semibold">{credentials.team_password}</span>
                    </div>
                  </div>
                  <p className="text-xs text-destructive mt-3 font-mono">
                    ⚠ Save this password now! It won't be shown again.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 font-mono"
                    onClick={() => copyCredentials(credentials.team_email, credentials.team_password)}
                  >
                    {copiedId === credentials.team_email ? (
                      <><Check className="h-4 w-4 mr-2" /> Copied!</>
                    ) : (
                      <><Copy className="h-4 w-4 mr-2" /> Copy Credentials</>
                    )}
                  </Button>
                  <Button variant="outline" className="font-mono" onClick={() => resetForm()}>
                    Create Another
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-mono">Team Name</Label>
                  <Input
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Red Team"
                    required
                    className="cyber-input"
                  />
                  <p className="text-xs text-muted-foreground font-mono">
                    Email will be auto-generated:{' '}
                    <span className="text-primary">
                      {teamName
                        ? `${teamName.toLowerCase().replace(/[^a-z0-9]/g, '')}@itgate.ctf`
                        : 'teamname@itgate.ctf'}
                    </span>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="font-mono">Role</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                    <SelectTrigger className="cyber-input font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user" className="font-mono">User</SelectItem>
                      <SelectItem value="admin" className="font-mono">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center justify-between">
                    <Label className="font-mono text-sm text-muted-foreground uppercase tracking-wider">
                      Team Members
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="font-mono"
                      onClick={addPlayer}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Player
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {players.map((value, i) => (
                      <div key={i} className="space-y-1">
                        <Label className="font-mono text-xs">Player {i + 1}</Label>
                        <div className="flex gap-2">
                          <Input
                            value={value}
                            onChange={(e) => updatePlayer(i, e.target.value)}
                            placeholder={`Player ${i + 1} full name`}
                            className="cyber-input"
                          />
                          {players.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => removePlayer(i)}
                              title="Remove player"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="cyber-glow">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Team'}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground font-mono">Loading teams...</div>
      ) : teams.length === 0 ? (
        <Card className="cyber-card">
          <CardContent className="py-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground font-mono">No teams yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="cyber-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-mono">Team Name</TableHead>
                <TableHead className="font-mono">Players</TableHead>
                <TableHead className="font-mono">Email</TableHead>
                <TableHead className="font-mono">Created</TableHead>
                <TableHead className="font-mono text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-mono font-semibold">{team.team_name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {getPlayers(team).map((name, i) => (
                        <Badge key={i} variant="outline" className="text-xs font-mono">
                          <User className="h-3 w-3 mr-1" />
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">{team.team_email}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {new Date(team.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Copy email"
                        onClick={() => copyCredentials(team.team_email)}
                      >
                        {copiedId === team.team_email ? (
                          <Check className="h-4 w-4 text-primary" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(team)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
