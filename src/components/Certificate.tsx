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
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: '#0f172a',
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          // Fix transparent / gradient text
          const transparentTexts = clonedDoc.querySelectorAll('.text-transparent');
          transparentTexts.forEach((el) => {
            const h = el as HTMLElement;
            h.classList.remove('text-transparent');
            h.style.color = '#ffffff';
            h.style.background = 'none';
          });

          // Remove blur / filters
          const blurred = clonedDoc.querySelectorAll('[class*="blur"]');
          blurred.forEach((el) => {
            const h = el as HTMLElement;
            h.style.filter = 'none';
            h.style.backdropFilter = 'none';
          });
        },
      });

      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`ITGate_CTF_Certificate_${participantName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    }
  };

  if (!participantName || solvedCount === 0 || !certificateId) {
    return null;
  }

  const validPlayerNames = playerNames.filter(Boolean);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Your Certificate
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Certificate */}
        <div
          ref={certificateRef}
          className="relative bg-slate-900 border-2 border-primary/40 rounded-lg p-12 text-white"
        >
          {/* Logo */}
          <img
            src="/IT-Gate(1).png"
            crossOrigin="anonymous"
            alt="IT Gate Logo"
            className="absolute top-6 left-6 h-14 w-14 object-contain"
          />

          <div className="text-center space-y-6">
            <div>
              <h2 className="text-sm uppercase tracking-widest text-slate-300">
                Certificate of Achievement
              </h2>
              <h1 className="text-4xl font-bold">
                IT Gate CTF
              </h1>
              <p className="text-sm text-slate-400">
                Capture The Flag Competition
              </p>
            </div>

            <div className="flex justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    rank > 0 && i < Math.min(5, 6 - Math.ceil(rank / 2))
                      ? 'text-primary fill-primary'
                      : 'text-slate-600'
                  }`}
                />
              ))}
            </div>

            <div>
              <p className="uppercase text-xs text-slate-400">This is to certify that</p>
              <h3 className="text-3xl font-bold">{participantName}</h3>

              {validPlayerNames.length > 0 && (
                <>
                  <p className="uppercase text-xs text-slate-400 mt-4">Team Members</p>
                  <div className="flex justify-center gap-4 flex-wrap">
                    {validPlayerNames.map((name, i) => (
                      <span key={i} className="text-lg font-semibold">
                        {name}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div>
              <p className="text-sm text-slate-400">
                has successfully participated and achieved the rank of
              </p>
              <div className="text-5xl font-bold text-primary">
                {rank > 0 ? getOrdinalSuffix(rank) : 'Unranked'}
              </div>
            </div>

            <div className="flex justify-center gap-12 pt-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-400">{totalPoints}</p>
                <p className="text-xs uppercase text-slate-400">Points</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-400">{solvedCount}</p>
                <p className="text-xs uppercase text-slate-400">Challenges</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-400">
                  {rank > 0 ? `#${rank}` : '—'}
                </p>
                <p className="text-xs uppercase text-slate-400">
                  {rank > 0 ? `of ${totalParticipants}` : 'Position'}
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-8 text-xs text-slate-400">
              <div>
                <p className="text-primary font-semibold">IT Gate CTF</p>
                <p>Cybersecurity Competition</p>
              </div>
              <div className="text-right">
                <p>{new Date().toLocaleDateString('en-US')}</p>
                <p className="text-primary/70">Certificate ID: {certificateId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center">
          <Button onClick={downloadCertificate} className="gap-2">
            <Download className="h-5 w-5" />
            Download Certificate (PDF)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
