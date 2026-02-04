import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Download, Star } from 'lucide-react';

interface CertificateProps {
  participantName: string;
  rank: number;
  totalPoints: number;
  solvedCount: number;
  totalParticipants: number;
}

export function Certificate({ 
  participantName, 
  rank, 
  totalPoints, 
  solvedCount,
  totalParticipants 
}: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const getOrdinalSuffix = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const getRankTitle = (rank: number) => {
    if (rank === 0) return 'Participant';
    if (rank === 1) return 'Champion';
    if (rank === 2) return '1st Runner-up';
    if (rank === 3) return '2nd Runner-up';
    if (rank <= 10) return 'Top 10 Finalist';
    return 'Participant';
  };

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;

    try {
      // Dynamic import for html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `ITGate_CTF_Certificate_${participantName.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to generate certificate:', error);
    }
  };

  // Show certificate only after the user has solved at least one challenge.
  // Rank can be 0 for accounts not included in the leaderboard (e.g. admin).
  if (!participantName || solvedCount === 0) {
    return null;
  }

  return (
    <Card className="cyber-card overflow-hidden">
      <CardHeader>
        <CardTitle className="font-mono flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Your Certificate
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Certificate Preview */}
        <div 
          ref={certificateRef}
          className="relative bg-gradient-to-br from-card via-background to-card border-2 border-primary/40 rounded-lg p-8 md:p-12 overflow-hidden"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-primary/30" />
          <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-primary/30" />
          <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-primary/30" />
          <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-primary/30" />

          {/* Certificate Content */}
          <div className="relative z-10 text-center space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-5 w-5 ${rank > 0 && i < Math.min(5, 6 - Math.ceil(rank / 2)) ? 'text-primary fill-primary' : 'text-muted-foreground/30'}`} 
                  />
                ))}
              </div>
              <h2 className="text-sm md:text-base font-mono uppercase tracking-[0.3em] text-muted-foreground">
                Certificate of Achievement
              </h2>
            </div>

            {/* Logo/Title */}
            <div className="space-y-1">
              <h1 className="text-2xl md:text-4xl font-bold font-mono text-gradient">
                IT Gate CTF
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground font-mono">
                Capture The Flag Competition
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-primary/50 to-primary" />
              <Award className="h-6 w-6 text-primary" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent via-primary/50 to-primary" />
            </div>

            {/* Awarded To */}
            <div className="space-y-3">
              <p className="text-xs md:text-sm text-muted-foreground font-mono uppercase tracking-wider">
                This is to certify that
              </p>
              <h3 className="text-2xl md:text-4xl font-bold font-mono text-foreground px-4 py-2 border-b-2 border-primary/50 inline-block">
                {participantName}
              </h3>
            </div>

            {/* Achievement */}
            <div className="space-y-2">
              <p className="text-xs md:text-sm text-muted-foreground font-mono">
                has successfully participated and achieved the rank of
              </p>
              <div className="flex flex-col items-center gap-2">
                <span className="text-4xl md:text-6xl font-bold font-mono text-primary">
                  {rank > 0 ? getOrdinalSuffix(rank) : 'Unranked'}
                </span>
                <span className="text-lg md:text-xl font-semibold font-mono text-accent">
                  {getRankTitle(rank)}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-8 pt-4">
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-bold font-mono text-success">{totalPoints}</p>
                <p className="text-xs text-muted-foreground font-mono uppercase">Points</p>
              </div>
              <div className="w-px bg-border" />
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-bold font-mono text-accent">{solvedCount}</p>
                <p className="text-xs text-muted-foreground font-mono uppercase">Challenges</p>
              </div>
              <div className="w-px bg-border" />
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-bold font-mono text-warning">{rank > 0 ? `#${rank}` : '—'}</p>
                <p className="text-xs text-muted-foreground font-mono uppercase">{rank > 0 ? `of ${totalParticipants}` : 'Position'}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-mono">
              <div className="text-center md:text-left">
                <p className="text-primary font-semibold">IT Gate CTF</p>
                <p>Cybersecurity Competition</p>
              </div>
              <div className="text-center md:text-right">
                <p>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-primary/70">Certificate ID: {crypto.randomUUID().slice(0, 8).toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <div className="flex justify-center">
          <Button 
            onClick={downloadCertificate}
            className="font-mono cyber-glow gap-2"
            size="lg"
          >
            <Download className="h-5 w-5" />
            Download Certificate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
