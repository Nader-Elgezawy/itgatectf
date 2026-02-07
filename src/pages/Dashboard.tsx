import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Flag, Users, Clock, Medal, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Certificate } from '@/components/Certificate';
import { CompetitionTimer } from '@/components/CompetitionTimer';
import { useCompetitionTimer } from '@/hooks/useCompetitionTimer';

interface LeaderboardEntry {
  user_id: string;
  username: string;
  total_points: number;
  solved_count: number;
  last_solve: string | null;
  player1_name: string | null;
  player2_name: string | null;
  player3_name: string | null;
}

interface UserStats {
  totalPoints: number;
  solvedCount: number;
  rank: number;
  username: string;
  playerNames: string[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({ totalPoints: 0, solvedCount: 0, rank: 0, username: '', playerNames: [] });
  const [totalChallenges, setTotalChallenges] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { isExpired: timerExpired } = useCompetitionTimer();

  useEffect(() => {
    fetchData();
    
    const channel = supabase
      .channel('leaderboard-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    
    const { data: leaderboardData } = await supabase.rpc('get_leaderboard');
    if (leaderboardData) {
      setLeaderboard(leaderboardData as LeaderboardEntry[]);
      
      if (user) {
        const userIndex = leaderboardData.findIndex((entry: LeaderboardEntry) => entry.user_id === user.id);
        if (userIndex !== -1) {
          const entry = leaderboardData[userIndex] as LeaderboardEntry;
          setUserStats({
            totalPoints: Number(entry.total_points) || 0,
            solvedCount: Number(entry.solved_count) || 0,
            rank: userIndex + 1,
            username: entry.username,
            playerNames: [entry.player1_name, entry.player2_name, entry.player3_name].filter(Boolean) as string[],
          });
        } else {
          const [{ data: profileData }, { data: solvedData }] = await Promise.all([
            supabase
              .from('profiles')
              .select('username, player1_name, player2_name, player3_name')
              .eq('id', user.id)
              .single(),
            supabase
              .from('submissions')
              .select('challenge_id, challenges(points)')
              .eq('user_id', user.id)
              .eq('is_correct', true),
          ]);

          const uniqueSolved = new Set((solvedData ?? []).map((s: any) => s.challenge_id));
          const solvedCount = uniqueSolved.size;
          const totalPoints = (solvedData ?? []).reduce((sum: number, s: any) => {
            const pts = s?.challenges?.points;
            return sum + (typeof pts === 'number' ? pts : 0);
          }, 0);

          setUserStats(prev => ({
            ...prev,
            username: profileData?.username ?? prev.username,
            playerNames: [
              profileData?.player1_name, 
              profileData?.player2_name, 
              profileData?.player3_name
            ].filter(Boolean) as string[],
            solvedCount,
            totalPoints,
          }));
        }
      }
    }

    const { count } = await supabase
      .from('challenges')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    setTotalChallenges(count || 0);

    setIsLoading(false);
  };

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString();
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Medal className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-muted-foreground font-mono">#{rank}</span>;
    }
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-mono flex items-center gap-3">
            <Trophy className="h-8 w-8 text-primary" />
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 font-mono">
            <span className="text-primary">&gt;</span> Real-time competition overview
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="cyber-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-mono">Your Rank</p>
                  <p className="text-2xl font-bold font-mono">
                    {userStats.rank > 0 ? `#${userStats.rank}` : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-success/10 border border-success/30">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-mono">Your Points</p>
                  <p className="text-2xl font-bold font-mono text-success">{userStats.totalPoints}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
                  <Flag className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-mono">Solved</p>
                  <p className="text-2xl font-bold font-mono">
                    {userStats.solvedCount}<span className="text-muted-foreground">/{totalChallenges}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
                  <Users className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-mono">Teams</p>
                  <p className="text-2xl font-bold font-mono">{leaderboard.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Competition Timer */}
        <CompetitionTimer />

        {/* Certificate Preview - only visible after timer expires */}
        {timerExpired && (
          <Certificate
            participantName={userStats.username}
            playerNames={userStats.playerNames}
            rank={userStats.rank}
            totalPoints={userStats.totalPoints}
            solvedCount={userStats.solvedCount}
            totalParticipants={leaderboard.length}
          />
        )}

        {/* Leaderboard */}
        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="font-mono flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Live Leaderboard
              <span className="ml-2 px-2 py-0.5 text-xs bg-success/20 text-success rounded-full border border-success/30 animate-glow-pulse">
                LIVE
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground font-mono">
                Loading leaderboard...
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground font-mono">
                <Flag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No scores yet. Be the first to solve a challenge!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-mono text-sm text-muted-foreground">Rank</th>
                      <th className="text-left py-3 px-4 font-mono text-sm text-muted-foreground">Team</th>
                      <th className="text-right py-3 px-4 font-mono text-sm text-muted-foreground">Points</th>
                      <th className="text-right py-3 px-4 font-mono text-sm text-muted-foreground">Solved</th>
                      <th className="text-right py-3 px-4 font-mono text-sm text-muted-foreground hidden md:table-cell">
                        <Clock className="h-4 w-4 inline mr-1" />
                        Last Solve
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, index) => (
                      <tr
                        key={entry.user_id}
                        className={`border-b border-border/50 transition-colors hover:bg-muted/30 ${
                          entry.user_id === user?.id ? 'bg-primary/5 border-primary/30' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center w-8">
                            {getRankIcon(index + 1)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <span className={`font-mono ${entry.user_id === user?.id ? 'text-primary font-semibold' : ''}`}>
                              {entry.username}
                              {entry.user_id === user?.id && (
                                <span className="ml-2 text-xs text-primary">(you)</span>
                              )}
                            </span>
                            {(entry.player1_name || entry.player2_name || entry.player3_name) && (
                              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                                {[entry.player1_name, entry.player2_name, entry.player3_name].filter(Boolean).join(' • ')}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-mono font-bold text-success">{entry.total_points}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-mono">{entry.solved_count}</span>
                        </td>
                        <td className="py-3 px-4 text-right hidden md:table-cell">
                          <span className="font-mono text-sm text-muted-foreground">
                            {formatTime(entry.last_solve)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
