import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GrantSolveDialogProps {
  questionId: string;
  questionText: string;
  challengeId: string;
}

interface Team {
  id: string;
  username: string;
  hasSolved: boolean;
}

export function GrantSolveDialog({ questionId, questionText, challengeId }: GrantSolveDialogProps) {
  const [open, setOpen] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) fetchTeams();
  }, [open]);

  const fetchTeams = async () => {
    setIsLoading(true);
    
    // Get all non-admin profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username')
      .order('username');

    // Get admin user ids to exclude
    const { data: adminRoles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    const adminIds = new Set(adminRoles?.map(r => r.user_id) || []);

    // Get who already solved this question
    const { data: solvedSubs } = await supabase
      .from('submissions')
      .select('user_id')
      .eq('question_id', questionId)
      .eq('is_correct', true);

    const solvedSet = new Set(solvedSubs?.map(s => s.user_id) || []);

    const teamList = (profiles || [])
      .filter(p => !adminIds.has(p.id))
      .map(p => ({
        id: p.id,
        username: p.username,
        hasSolved: solvedSet.has(p.id),
      }));

    setTeams(teamList);
    // Pre-select already solved teams
    setSelectedTeams(new Set(teamList.filter(t => t.hasSolved).map(t => t.id)));
    setIsLoading(false);
  };

  const toggleTeam = (teamId: string) => {
    setSelectedTeams(prev => {
      const next = new Set(prev);
      if (next.has(teamId)) next.delete(teamId);
      else next.add(teamId);
      return next;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const alreadySolved = new Set(teams.filter(t => t.hasSolved).map(t => t.id));

      // Teams to grant solve (newly selected)
      const toGrant = [...selectedTeams].filter(id => !alreadySolved.has(id));
      // Teams to revoke solve (deselected)
      const toRevoke = [...alreadySolved].filter(id => !selectedTeams.has(id));

      // Grant solves
      if (toGrant.length > 0) {
        // Get the flag for this question to use as submitted_flag
        const { data: questionData } = await supabase
          .from('challenge_questions')
          .select('flag')
          .eq('id', questionId)
          .maybeSingle();

        const flag = questionData?.flag || 'GRANTED_BY_ADMIN';

        const { error } = await supabase
          .from('submissions')
          .insert(toGrant.map(userId => ({
            user_id: userId,
            challenge_id: challengeId,
            question_id: questionId,
            submitted_flag: flag,
            is_correct: true,
            is_admin_granted: true,
          })));

        if (error) throw error;
      }

      // Revoke solves
      if (toRevoke.length > 0) {
        for (const userId of toRevoke) {
          const { error } = await supabase
            .from('submissions')
            .delete()
            .eq('user_id', userId)
            .eq('question_id', questionId)
            .eq('is_correct', true);

          if (error) throw error;
        }
      }

      toast.success(`Updated ${toGrant.length + toRevoke.length} team(s)`);
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" title="Grant solve to teams">
          <UserCheck className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm">
            Grant Solve: {questionText}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground font-mono text-sm">Loading teams...</div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">Select teams to mark as solved:</p>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {teams.map(team => (
                <label
                  key={team.id}
                  className="flex items-center gap-3 p-2 rounded-lg border border-border hover:bg-muted/50 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedTeams.has(team.id)}
                    onCheckedChange={() => toggleTeam(team.id)}
                  />
                  <span className="font-mono text-sm flex-1">{team.username}</span>
                  {team.hasSolved && (
                    <Badge variant="outline" className="text-xs">Already solved</Badge>
                  )}
                </label>
              ))}
            </div>
            <Button onClick={handleSave} disabled={isSaving} className="w-full cyber-glow">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
