import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Download, Star } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface CertificateProps {
  participantName: string;
  playerNames: string[];
  rank: number;
  totalPoints: number;
  solvedCount: number;
  totalParticipants: number;
}

export function Certificate({
  participantName,
  playerNames,
  rank,
  totalPoints,
  solvedCount,
  totalParticipants,
}: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const getOrdinalSuffix = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;

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
  };

  if (!participantName || solvedCount === 0) return null;

  const validPlayerNames = playerNames.filter(Boolean);

  return (
    <Card className="overflow-hidden shadow-xl border border-border/60 bg-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-mono">
          <Award className="h-5 w-5 text-primary" />
          Digital Certificate
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div
          ref={certificateRef}
          className="relative rounded-xl border bg-gradient-to-br from-background via-card to-background p-10 md:p-14"
        >
          {/* Soft glow */}
          <div className="absolute inset-0 rounded-xl ring-1 ring-primary/20" />

          <img
            src="/IT-Gate(1).png"
            alt="IT Gate Logo"
            className="absolute top-6 left-6 h-14 w-14 object-contain"
          />

          <div className="relative z-10 text-center space-y-6">
            <div>
              <h2 className="text-xs uppercase tracking-[0.35em] text-muted-foreground font-mono">
                Certificate of Achievement
              </h2>
              <h1 className="text-3xl md:text-5xl font-bold font-mono mt-2">
                IT Gate CTF
              </h1>
              <p className="text-sm text-muted-foreground font-mono">
                Capture The Flag Competition
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-mono">
                This certifies that
              </p>
              <h3 className="text-3xl md:text-4xl font-bold font-mono border-b inline-block px-4 py-1">
                {participantName}
              </h3>

              {validPlayerNames.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
                    Team Members
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    {validPlayerNames.map((name, i) => (
                      <span key={i} className="font-mono font-semibold">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm text-muted-foreground font-mono">
                Achieved Rank
              </p>
              <div className="text-5xl md:text-6xl font-bold text-primary font-mono">
                {rank > 0 ? getOrdinalSuffix(rank) : 'Unranked'}
              </div>
            </div>

            <div className="flex justify-center gap-10 pt-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-success font-mono">
                  {totalPoints}
                </p>
                <p className="text-xs uppercase text-muted-foreground font-mono">
                  Points
                </p>
              </div>

              <div className="text-center">
                <p className="text-3xl font-bold font-mono">
                  {solvedCount}
                </p>
                <p className="text-xs uppercase text-muted-foreground font-mono">
                  Solved
                </p>
              </div>

              <div className="text-center">
                <p className="text-3xl font-bold text-warning font-mono">
                  #{rank}
                </p>
                <p className="text-xs uppercase text-muted-foreground font-mono">
                  of {totalParticipants}
                </p>
              </div>
            </div>

            <div className="pt-6 flex justify-between text-xs text-muted-foreground font-mono">
              <div>
                <p className="font-semibold text-primary">IT Gate CTF</p>
                <p>Cybersecurity Competition</p>
              </div>
              <div className="text-right">
                <p>
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button onClick={downloadCertificate} size="lg" className="gap-2 font-mono">
            <Download className="h-5 w-5" />
            Download PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
