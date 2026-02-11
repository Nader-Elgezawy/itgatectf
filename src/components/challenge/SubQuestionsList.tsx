import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Send, Loader2, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

interface SubQuestion {
  id: string;
  question_text: string;
  points: number;
  penalty_points: number;
  sort_order: number;
}

interface SubQuestionsListProps {
  challengeId: string;
  isCompetitionOver: boolean;
}

export function SubQuestionsList({ challengeId, isCompetitionOver }: SubQuestionsListProps) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<SubQuestion[]>([]);
  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set());
  const [flags, setFlags] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, [challengeId, user]);

  const fetchQuestions = async () => {
    setIsLoading(true);

    const { data } = await supabase
      .from('challenge_questions_public')
      .select('id, question_text, points, penalty_points, sort_order, challenge_id')
      .eq('challenge_id', challengeId)
      .order('sort_order');

    if (data) {
      setQuestions(data as SubQuestion[]);
    }

    // Check solved sub-questions
    if (user) {
      const { data: submissions } = await supabase
        .from('submissions')
        .select('question_id')
        .eq('user_id', user.id)
        .eq('challenge_id', challengeId)
        .eq('is_correct', true)
        .not('question_id', 'is', null);

      if (submissions) {
        setSolvedIds(new Set(submissions.map(s => s.question_id).filter(Boolean)));
      }
    }

    setIsLoading(false);
  };

  const handleSubmit = async (questionId: string) => {
    const flagValue = flags[questionId]?.trim();
    if (!user || !flagValue) return;

    setSubmittingId(questionId);
    try {
      const { data, error } = await supabase.functions.invoke('validate-flag', {
        body: { challengeId, questionId, flag: flagValue },
      });

      if (error) {
        toast.error('Failed to submit flag.');
        return;
      }
      if (data.error) {
        toast.error(data.error);
        return;
      }

      const question = questions.find(q => q.id === questionId);
      if (data.correct) {
        setSolvedIds(prev => new Set([...prev, questionId]));
        toast.success(`Correct! +${question?.points || 0} points`, {
          icon: <CheckCircle className="h-4 w-4 text-success" />,
        });
        setFlags(prev => ({ ...prev, [questionId]: '' }));
      } else {
        toast.error('Incorrect flag. Try again!', {
          icon: <XCircle className="h-4 w-4" />,
        });
      }
    } catch {
      toast.error('An error occurred.');
    } finally {
      setSubmittingId(null);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground font-mono">Loading questions...</p>;
  }

  if (questions.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-mono font-semibold text-lg">Questions ({solvedIds.size}/{questions.length} solved)</h3>
      {questions.map((q, idx) => {
        const solved = solvedIds.has(q.id);
        return (
          <div
            key={q.id}
            className={`p-4 rounded-lg border ${solved ? 'border-success/30 bg-success/5' : 'border-border bg-muted/20'}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {solved && <CheckCircle className="h-4 w-4 text-success" />}
                <span className="font-mono font-semibold">Q{idx + 1}</span>
                <span className="font-mono text-sm text-primary">{q.points} pts</span>
                {q.penalty_points > 0 && (
                  <span className="text-xs font-mono text-destructive">(-{q.penalty_points})</span>
                )}
              </div>
            </div>
            <p className="text-foreground whitespace-pre-wrap text-sm mb-3">{q.question_text}</p>

            {isCompetitionOver ? (
              <div className="text-xs text-destructive font-mono flex items-center gap-1">
                <Clock className="h-3 w-3" /> Competition ended
              </div>
            ) : solved ? (
              <p className="text-xs text-success font-mono">✓ Solved</p>
            ) : (
              <div className="flex gap-2">
                <Textarea
                  placeholder="flag{...}"
                  value={flags[q.id] || ''}
                  onChange={(e) => setFlags(prev => ({ ...prev, [q.id]: e.target.value }))}
                  className="cyber-input font-mono resize-none text-sm"
                  rows={1}
                  disabled={submittingId === q.id}
                />
                <Button
                  onClick={() => handleSubmit(q.id)}
                  disabled={submittingId === q.id || !flags[q.id]?.trim()}
                  size="sm"
                  className="cyber-glow self-end"
                >
                  {submittingId === q.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Send className="h-3 w-3" />
                  )}
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
