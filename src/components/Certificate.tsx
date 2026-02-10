import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Download, Star, ExternalLink } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface CertificateProps {
  participantName: string;
  playerNames: string[];
  rank: number;
  totalPoints: number;
  solvedCount: number;
  totalParticipants: number;
  certificateId: string;
}

export function Certificate({
  participantName,
  playerNames,
  rank,
  totalPoints,
  solvedCount,
  totalParticipants,
  certificateId,
}: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const getOrdinalSuffix = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`ITGate_CTF_Certificate_${participantName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Failed to generate certificate:', error);
    }
  };

  if (!participantName || solvedCount === 0 || !certificateId) {
    return null;
  }

  const validPlayerNames = playerNames.filter(Boolean);

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
        <div ref={certificateRef} className="relative bg-gradient-to-br from-card via-background to-card border-2 border-primary/40 rounded-lg p-8 md:p-12 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-primary/30" />
          <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-primary/30" />
          <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-primary/30" />
          <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-primary/30" />

          {/* Logo */}
          <img src="/IT-Gate(1).png" alt="IT Gate Logo" className="absolute top-6 left-6 h-14 w-14 object-contain z-20" />

          {/* Certificate Content */}
          <div className="relative z-10 text-center space-y-6">
            <div className="space-y-2">
              <div className="flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${rank > 0 && i < Math.min(5, 6 - Math.ceil(rank / 2)) ? 'text-primary fill-primary' : 'text-muted-foreground/30'}`} />
                ))}
              </div>
              <h2 className="text-sm md:text-base font-mono uppercase tracking-[0.3em] text-muted-foreground">
                Certificate of Achievement
              </h2>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl md:text-4xl font-bold font-mono text-gradient">IT Gate CTF</h1>
              <p className="text-xs md:text-sm text-muted-foreground font-mono">Capture The Flag Competition</p>
            </div>

            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-primary/50 to-primary" />
              <Award className="h-6 w-6 text-primary" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent via-primary/50 to-primary" />
            </div>

            <div className="space-y-3">
              <p className="text-xs md:text-sm text-muted-foreground font-mono uppercase tracking-wider">This is to certify that</p>
              <h3 className="text-2xl md:text-4xl font-bold font-mono text-foreground px-4 py-2 border-b-2 border-primary/50 inline-block">
                {participantName}
              </h3>
              {validPlayerNames.length > 0 && (
                <div className="space-y-1 pt-2">
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Team Members</p>
                  <div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
                    {validPlayerNames.map((name, i) => (
                      <span key={i} className="text-base md:text-lg font-semibold font-mono text-foreground">{name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs md:text-sm text-muted-foreground font-mono">has successfully participated and achieved the rank of</p>
              <span className="text-4xl md:text-6xl font-bold font-mono text-primary">
                {rank > 0 ? getOrdinalSuffix(rank) : 'Unranked'}
              </span>
            </div>

            <div className="flex justify-center gap-8 pt-4">
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-bold font-mono text-success">{totalPoints}</p>
                <p className="text-xs text-muted-foreground font-mono uppercase">Points</p>
              </div>
              <div className="w-px bg-border" />
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-bold font-mono text-accent-foreground">{solvedCount}</p>
                <p className="text-xs text-muted-foreground font-mono uppercase">Challenges</p>
              </div>
              <div className="w-px bg-border" />
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-bold font-mono text-warning">{rank > 0 ? `#${rank}` : '—'}</p>
                <p className="text-xs text-muted-foreground font-mono uppercase">{rank > 0 ? `of ${totalParticipants}` : 'Position'}</p>
              </div>
            </div>

            <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-mono">
              <div className="text-center md:text-left">
                <p className="text-primary font-semibold">IT Gate CTF</p>
                <p>Cybersecurity Competition</p>
              </div>
              <div className="text-center md:text-right">
                <p>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-primary/70">Certificate ID: {certificateId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-3 flex-wrap">
          <Button onClick={downloadCertificate} className="font-mono cyber-glow gap-2" size="lg">
            <Download className="h-5 w-5" />
            Download Certificate (PDF)
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="font-mono gap-2"
            onClick={() => window.open(`/verify?id=${encodeURIComponent(certificateId)}`, '_blank')}
          >
            <ExternalLink className="h-5 w-5" />
            Verify Certificate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
