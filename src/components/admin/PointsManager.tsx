import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, Loader2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LeaderboardEntry {
  user_id: string;
  username: string;
  total_points: number;
  solved_count: number;
}

interface ProfileAdjustment {
  id: string;
  username: string;
  point_adjustment: number;
}

export function PointsManager() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [profiles, setProfiles] = useState<ProfileAdjustment[]>([]);
  const [adjustments, setAdjustments] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const [{ data: lb }, { data: profs }] = await Promise.all([
      supabase.rpc('get_leaderboard'),
      supabase.from('profiles').select('id, username, point_adjustment'),
    ]);

    if (lb) setLeaderboard(lb as LeaderboardEntry[]);
    if (profs) {
      setProfiles(profs as ProfileAdjustment[]);
      const adj: Record<string, string> = {};
      (profs as ProfileAdjustment[]).forEach(p => { adj[p.id] = String(p.point_adjustment); });
      setAdjustments(adj);
    }
    setIsLoading(false);
  };

  const handleSave = async (userId: string) => {
    setSavingId(userId);
    const newAdj = parseInt(adjustments[userId]) || 0;
    const { error } = await supabase
      .from('profiles')
      .update({ point_adjustment: newAdj } as any)
      .eq('id', userId);

    if (error) {
      toast.error('Failed to update points');
    } else {
      toast.success('Points updated');
      fetchData();
    }
    setSavingId(null);
  };

  const getProfile = (userId: string) => profiles.find(p => p.id === userId);

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground font-mono">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-mono">Points Manager</h2>
        <p className="text-sm text-muted-foreground font-mono mt-1">
          Adjust team points. Positive values add points, negative values deduct.
        </p>
      </div>

      {leaderboard.length === 0 ? (
        <Card className="cyber-card">
          <CardContent className="py-8 text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground font-mono">No teams on the leaderboard.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="cyber-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-mono">Rank</TableHead>
                <TableHead className="font-mono">Team</TableHead>
                <TableHead className="font-mono text-right">Current Points</TableHead>
                <TableHead className="font-mono text-right">Solved</TableHead>
                <TableHead className="font-mono text-center">Point Adjustment</TableHead>
                <TableHead className="font-mono text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((entry, index) => {
                const profile = getProfile(entry.user_id);
                const currentAdj = adjustments[entry.user_id] ?? '0';
                const savedAdj = String(profile?.point_adjustment ?? 0);
                const hasChanged = currentAdj !== savedAdj;

                return (
                  <TableRow key={entry.user_id}>
                    <TableCell className="font-mono font-bold">#{index + 1}</TableCell>
                    <TableCell className="font-mono font-semibold">{entry.username}</TableCell>
                    <TableCell className="font-mono text-right text-success font-bold">{entry.total_points}</TableCell>
                    <TableCell className="font-mono text-right">{entry.solved_count}</TableCell>
                    <TableCell className="text-center">
                      <Input
                        type="number"
                        value={currentAdj}
                        onChange={(e) => setAdjustments(prev => ({
                          ...prev,
                          [entry.user_id]: e.target.value,
                        }))}
                        className="w-24 mx-auto text-center cyber-input font-mono"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={hasChanged ? "default" : "ghost"}
                        disabled={!hasChanged || savingId === entry.user_id}
                        onClick={() => handleSave(entry.user_id)}
                        className="font-mono"
                      >
                        {savingId === entry.user_id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <><Save className="h-4 w-4 mr-1" /> Save</>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
