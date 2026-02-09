import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, CheckCircle, XCircle, Search, Loader2, Users, Trophy, Flag } from 'lucide-react';


interface CertificateData {
  id: string;
  teamName: string;
  players: string[];
  rank: number;
  totalPoints: number;
  solvedCount: number;
  totalParticipants: number;
}

export default function VerifyCertificate() {
  const [searchParams] = useSearchParams();
  const [inputId, setInputId] = useState(searchParams.get('id') || '');
  const [result, setResult] = useState<{ valid: boolean; certificate?: CertificateData; error?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // const id = searchParams.get('id');
    // if (id) {
    //   verify(id);
    // }
  }, []);

  const verify = async (id: string) => {
    const trimmed = id.trim().toUpperCase();
    if (!trimmed) return;

    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-certificate?id=${encodeURIComponent(trimmed)}`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ valid: false, error: 'Verification failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verify(inputId);
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <img src="/IT-Gate(1).png" alt="IT Gate Logo" className="h-16 w-16 object-contain" />
          </div>
          <h1 className="text-2xl font-bold font-mono">Certificate Verification</h1>
          <p className="text-muted-foreground font-mono text-sm">
            Enter a certificate ID to verify its authenticity
          </p>
        </div>

        {/* Search Form */}
        <Card className="cyber-card">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={inputId}
                onChange={(e) => setInputId(e.target.value)}
                placeholder="ITGCTF-XXXXXXXX"
                className="cyber-input font-mono uppercase"
                maxLength={20}
              />
              <Button type="submit" disabled={isLoading} className="cyber-glow font-mono">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Result */}
        {result && (
          <Card className={`cyber-card border-2 ${result.valid ? 'border-success/50' : 'border-destructive/50'}`}>
            <CardContent className="p-6 space-y-4">
              {result.valid && result.certificate ? (
                <>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-8 w-8 text-success" />
                    <div>
                      <h2 className="font-bold font-mono text-lg">Valid Certificate</h2>
                      <p className="text-xs text-muted-foreground font-mono">{result.certificate.id}</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="font-mono font-semibold">{result.certificate.teamName}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {result.certificate.players.map((name, i) => (
                        <Badge key={i} variant="outline" className="font-mono text-xs">
                          {name}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <div className="text-center p-2 rounded bg-muted/30">
                        <Trophy className="h-4 w-4 mx-auto text-primary mb-1" />
                        <p className="font-mono font-bold">#{result.certificate.rank}</p>
                        <p className="text-xs text-muted-foreground font-mono">Rank</p>
                      </div>
                      <div className="text-center p-2 rounded bg-muted/30">
                        <Flag className="h-4 w-4 mx-auto text-success mb-1" />
                        <p className="font-mono font-bold">{result.certificate.solvedCount}</p>
                        <p className="text-xs text-muted-foreground font-mono">Solved</p>
                      </div>
                      <div className="text-center p-2 rounded bg-muted/30">
                        <Award className="h-4 w-4 mx-auto text-warning mb-1" />
                        <p className="font-mono font-bold">{result.certificate.totalPoints}</p>
                        <p className="text-xs text-muted-foreground font-mono">Points</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <XCircle className="h-8 w-8 text-destructive" />
                  <div>
                    <h2 className="font-bold font-mono text-lg">Invalid Certificate</h2>
                    <p className="text-sm text-muted-foreground font-mono">{result.error || 'Certificate not found'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground font-mono">
          IT Gate CTF — Certificate Verification Portal
        </p>
      </div>
    </div>
  );
}
