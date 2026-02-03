import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  CheckCircle, 
  XCircle,
  Search
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Submission {
  id: string;
  submitted_flag: string;
  is_correct: boolean;
  submitted_at: string;
  user: {
    username: string;
  };
  challenge: {
    title: string;
    category: string;
  };
}

export function SubmissionsViewer() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSubmissions();

    // Real-time subscription
    const channel = supabase
      .channel('admin-submissions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, () => {
        fetchSubmissions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    
    const { data } = await supabase
      .from('submissions')
      .select(`
        id,
        submitted_flag,
        is_correct,
        submitted_at,
        user_id,
        challenge_id
      `)
      .order('submitted_at', { ascending: false })
      .limit(100);

    if (data) {
      // Fetch user and challenge details
      const enrichedSubmissions = await Promise.all(
        data.map(async (sub) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', sub.user_id)
            .single();

          const { data: challenge } = await supabase
            .from('challenges')
            .select('title, category')
            .eq('id', sub.challenge_id)
            .single();

          return {
            ...sub,
            user: { username: profile?.username || 'Unknown' },
            challenge: challenge || { title: 'Unknown', category: 'Unknown' },
          };
        })
      );
      setSubmissions(enrichedSubmissions);
    }
    
    setIsLoading(false);
  };

  const filteredSubmissions = submissions.filter(sub => 
    sub.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.submitted_flag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-bold font-mono">Submissions</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search submissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64 cyber-input"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground font-mono">
          Loading submissions...
        </div>
      ) : submissions.length === 0 ? (
        <Card className="cyber-card">
          <CardContent className="py-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground font-mono">No submissions yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredSubmissions.map((sub) => (
            <Card key={sub.id} className={`cyber-card ${sub.is_correct ? 'border-success/30' : 'border-destructive/30'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    {sub.is_correct ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-semibold">{sub.user.username}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-mono">{sub.challenge.title}</span>
                        <Badge variant="outline" className="font-mono text-xs">
                          {sub.challenge.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-mono mt-1">
                        Flag: <code className="bg-muted px-1 rounded">{sub.submitted_flag}</code>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={sub.is_correct ? 'default' : 'destructive'}>
                      {sub.is_correct ? 'Correct' : 'Wrong'}
                    </Badge>
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                      {formatTime(sub.submitted_at)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
