import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flag, CheckCircle, Lock, Folder } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Link } from 'react-router-dom';

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

export default function Challenges() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [solvedChallenges, setSolvedChallenges] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, [user]);

  const fetchChallenges = async () => {
    setIsLoading(true);

    // Fetch challenges
    const { data: challengesData } = await supabase
      .from('challenges_public')
      .select('id, title, description, category, points, penalty_points, file_url, file_name')
      .order('category')
      .order('points');

    if (challengesData) {
      setChallenges(challengesData as unknown as Challenge[]);
    }

    // Fetch user's solved challenges
    if (user) {
      const { data: submissions } = await supabase
        .from('submissions')
        .select('challenge_id')
        .eq('user_id', user.id)
        .eq('is_correct', true);

      if (submissions) {
        setSolvedChallenges(new Set(submissions.map(s => s.challenge_id)));
      }
    }

    setIsLoading(false);
  };

  // Group challenges by category
  const challengesByCategory = challenges.reduce((acc, challenge) => {
    if (!acc[challenge.category]) {
      acc[challenge.category] = [];
    }
    acc[challenge.category].push(challenge);
    return acc;
  }, {} as Record<string, Challenge[]>);

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

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-mono flex items-center gap-3">
            <Flag className="h-8 w-8 text-primary" />
            Challenges
          </h1>
          <p className="text-muted-foreground mt-2 font-mono">
            <span className="text-primary">&gt;</span> Capture the flags to score points
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono">
          <span>
            <CheckCircle className="h-4 w-4 inline mr-1 text-success" />
            Solved: {solvedChallenges.size}/{challenges.length}
          </span>
          <span>
            Categories: {Object.keys(challengesByCategory).length}
          </span>
        </div>

        {/* Challenge Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground font-mono">
            Loading challenges...
          </div>
        ) : challenges.length === 0 ? (
          <Card className="cyber-card">
            <CardContent className="py-12 text-center">
              <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground font-mono">No challenges available yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(challengesByCategory).map(([category, categoryChalls]) => (
              <div key={category}>
                <h2 className="text-xl font-bold font-mono mb-4 flex items-center gap-2">
                  <Folder className="h-5 w-5 text-primary" />
                  {category}
                  <Badge variant="secondary" className="ml-2 font-mono">
                    {categoryChalls.length}
                  </Badge>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryChalls.map((challenge) => {
                    const isSolved = solvedChallenges.has(challenge.id);
                    return (
                      <Link key={challenge.id} to={`/challenges/${challenge.id}`}>
                        <Card
                          className={`cyber-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 cursor-pointer ${
                            isSolved ? 'border-success/30 bg-success/5' : ''
                          }`}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <CardTitle className="font-mono text-lg flex items-center gap-2">
                                {isSolved && <CheckCircle className="h-5 w-5 text-success" />}
                                {challenge.title}
                              </CardTitle>
                              <Badge className={`${getCategoryColor(challenge.category)} border`}>
                                {challenge.category}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                              {challenge.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className={`font-mono font-bold ${isSolved ? 'text-success' : 'text-primary'}`}>
                                {challenge.points} pts
                              </span>
                              <Button variant="ghost" size="sm" className="font-mono">
                                {isSolved ? 'View' : 'Solve'} →
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
