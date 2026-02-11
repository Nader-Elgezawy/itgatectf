import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Flag, 
  Download, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  Send,
  Loader2,
  FileText,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { useCompetitionTimer } from '@/hooks/useCompetitionTimer';
import { SubQuestionsList } from '@/components/challenge/SubQuestionsList';

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  points: number;
  penalty_points: number;
  file_url: string | null;
  file_name: string | null;
}

export default function ChallengeDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { isExpired: timerExpired, settings: timerSettings } = useCompetitionTimer();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isSolved, setIsSolved] = useState(false);
  const [flag, setFlag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [recentAttempts, setRecentAttempts] = useState(0);

  // Competition is timed and has expired
  const isCompetitionOver = timerSettings?.is_active && timerExpired;

  useEffect(() => {
    if (id) {
      fetchChallenge();
      checkSolved();
      checkRateLimit();
    }
  }, [id, user]);

  const fetchChallenge = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('challenges_public')
      .select('id, title, description, category, points, penalty_points, file_url, file_name')
      .eq('id', id!)
      .single();

    if (data) {
      setChallenge(data as unknown as Challenge);
    }
    setIsLoading(false);
  };

  const checkSolved = async () => {
    if (!user || !id) return;

    const { data } = await supabase
      .from('submissions')
      .select('id')
      .eq('user_id', user.id)
      .eq('challenge_id', id)
      .eq('is_correct', true)
      .limit(1);

    setIsSolved(data && data.length > 0);
  };

  const checkRateLimit = async () => {
    if (!user || !id) return;

    // Count submissions in the last minute
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    const { count } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('challenge_id', id)
      .gte('submitted_at', oneMinuteAgo);

    setRecentAttempts(count || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !challenge || !flag.trim()) return;

    // Rate limiting: max 10 attempts per minute
    if (recentAttempts >= 10) {
      toast.error('Too many attempts. Please wait a minute before trying again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('validate-flag', {
        body: {
          challengeId: challenge.id,
          flag: flag.trim(),
        },
      });

      if (error) {
        toast.error('Failed to submit flag. Please try again.');
        return;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (data.correct) {
        setIsSolved(true);
        toast.success(`Correct! +${challenge.points} points`, {
          description: 'Flag accepted!',
          icon: <CheckCircle className="h-4 w-4 text-success" />,
        });
        setFlag('');
      } else {
        toast.error('Incorrect flag. Try again!', {
          icon: <XCircle className="h-4 w-4" />,
        });
        setRecentAttempts(prev => prev + 1);
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Web': 'bg-primary/15 text-primary border-primary/30',
      'Crypto': 'bg-warning/15 text-warning border-warning/30',
      'Forensics': 'bg-secondary/15 text-secondary-foreground border-secondary/30',
      'Pwn': 'bg-destructive/15 text-destructive border-destructive/30',
      'Reverse': 'bg-success/15 text-success border-success/30',
      'Misc': 'bg-muted/30 text-muted-foreground border-muted',
    };
    return colors[category] || 'bg-primary/15 text-primary border-primary/30';
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-12 text-muted-foreground font-mono">
          Loading challenge...
        </div>
      </Layout>
    );
  }

  if (!challenge) {
    return (
      <Layout>
        <Card className="cyber-card">
          <CardContent className="py-12 text-center">
            <Flag className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground font-mono mb-4">Challenge not found.</p>
            <Link to="/challenges">
              <Button variant="secondary" className="font-mono">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Challenges
              </Button>
            </Link>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* Back button */}
        <Link to="/challenges">
          <Button variant="ghost" className="font-mono">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Challenges
          </Button>
        </Link>

        {/* Challenge Card */}
        <Card className={`cyber-card ${isSolved ? 'border-success/30' : ''}`}>
          <CardHeader>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="space-y-2">
                <CardTitle className="font-mono text-2xl flex items-center gap-2">
                  {isSolved && <CheckCircle className="h-6 w-6 text-success" />}
                  {challenge.title}
                </CardTitle>
                <div className="flex items-center gap-3">
                  <Badge className={`${getCategoryColor(challenge.category)} border`}>
                    {challenge.category}
                  </Badge>
                  <span className={`font-mono font-bold text-lg ${isSolved ? 'text-success' : 'text-primary'}`}>
                    {challenge.points} pts
                  </span>
                  {challenge.penalty_points > 0 && (
                    <span className="font-mono text-sm text-destructive">
                      (-{challenge.penalty_points} per wrong attempt)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Description */}
            <div className="prose prose-invert max-w-none">
              <p className="text-foreground whitespace-pre-wrap">{challenge.description}</p>
            </div>

            {/* File download */}
            {challenge.file_url && (
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border">
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <p className="font-mono text-sm text-muted-foreground">Task File</p>
                  <p className="font-mono">{challenge.file_name || 'challenge-file'}</p>
                </div>
                <a href={challenge.file_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" className="font-mono">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </a>
              </div>
            )}

            {/* Sub-questions */}
            <SubQuestionsList challengeId={challenge.id} isCompetitionOver={!!isCompetitionOver} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
