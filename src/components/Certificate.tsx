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
  const downloadRef = useRef<HTMLDivElement>(null);

  const getOrdinalSuffix = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const downloadCertificate = async () => {
    if (!downloadRef.current) return;
    
    try {
      // Create a clone of the certificate content for PDF generation
      const pdfCertificate = document.createElement('div');
      pdfCertificate.style.position = 'fixed';
      pdfCertificate.style.left = '-9999px';
      pdfCertificate.style.top = '0';
      pdfCertificate.style.width = '1200px'; // Fixed width for consistent PDF
      pdfCertificate.style.height = '800px'; // Fixed height for consistent PDF
      pdfCertificate.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)';
      pdfCertificate.style.padding = '60px';
      pdfCertificate.style.boxSizing = 'border-box';
      pdfCertificate.style.border = '2px solid rgba(59, 130, 246, 0.4)';
      pdfCertificate.style.borderRadius = '12px';
      pdfCertificate.style.overflow = 'hidden';
      pdfCertificate.style.color = 'white';
      
      document.body.appendChild(pdfCertificate);
      
      // Copy all content from downloadRef
      pdfCertificate.innerHTML = downloadRef.current.innerHTML;
      
      // Add styles that might not be captured by html2canvas
      const style = document.createElement('style');
      style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        * {
          font-family: 'JetBrains Mono', monospace;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        .certificate-content {
          width: 100%;
          height: 100%;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 30px;
        }
        
        .gradient-text {
          background: linear-gradient(90deg, #ffffff 0%, #cbd5e1 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        
        .stat-number {
          font-size: 32px;
          font-weight: 700;
        }
        
        .stat-label {
          font-size: 12px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
      `;
      pdfCertificate.appendChild(style);
      
      // Wait for fonts and images to load
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(pdfCertificate, {
        scale: 3, // High quality
        backgroundColor: '#0f172a',
        useCORS: true,
        logging: false,
        allowTaint: true,
        removeContainer: true,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Calculate dimensions for PDF (A4 landscape ratio)
      const pdfWidth = 297; // A4 width in mm
      const pdfHeight = 210; // A4 height in mm (landscape)
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      // Calculate dimensions to fit the image in PDF
      const imgWidth = pdfWidth - 20; // 10mm margins on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Center the image in PDF
      const x = (pdfWidth - imgWidth) / 2;
      const y = (pdfHeight - imgHeight) / 2;
      
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      
      // Clean up
      document.body.removeChild(pdfCertificate);
      
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
        {/* Certificate Preview - This is what users see */}
        <div ref={certificateRef} className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-primary/40 rounded-lg p-8 md:p-12 overflow-hidden">
          {/* Hidden div for PDF generation with exact same content */}
          <div ref={downloadRef} className="certificate-content absolute left-[-9999px]">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
            <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-primary/30" />
            <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-primary/30" />
            <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-primary/30" />
            <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-primary/30" />

            {/* Logo */}
            <div className="absolute top-6 left-6 z-20">
              <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="font-bold text-white text-sm">IT GATE</span>
              </div>
            </div>

            {/* Certificate Content */}
            <div className="relative z-10 text-center space-y-8 w-full">
              <div className="space-y-4">
                <div className="flex justify-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-5 h-5 rounded-full bg-primary/30" />
                  ))}
                </div>
                <h2 className="text-base font-mono uppercase tracking-[0.3em] text-slate-300">
                  Certificate of Achievement
                </h2>
              </div>

              <div className="space-y-2">
                <h1 className="text-4xl font-bold font-mono gradient-text">
                  IT Gate CTF
                </h1>
                <p className="text-sm text-slate-400 font-mono">
                  Capture The Flag Competition
                </p>
              </div>

              <div className="flex items-center justify-center gap-8 py-4">
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary/50 to-primary" />
                <div className="w-8 h-8 rounded-full border-2 border-primary/50 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-primary" />
                </div>
                <div className="h-px w-24 bg-gradient-to-l from-transparent via-primary/50 to-primary" />
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-sm text-slate-400 font-mono uppercase tracking-wider mb-4">
                    This is to certify that
                  </p>
                  <h3 className="text-4xl font-bold font-mono text-white mb-2">
                    {participantName}
                  </h3>
                  <div className="w-64 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
                </div>
                
                {validPlayerNames.length > 0 && (
                  <div className="space-y-3 pt-6">
                    <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">
                      Team Members
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                      {validPlayerNames.map((name, i) => (
                        <div key={i} className="text-lg font-semibold font-mono text-white bg-slate-800/50 px-4 py-2 rounded-lg">
                          {name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 py-6">
                <p className="text-sm text-slate-400 font-mono">
                  has successfully participated and achieved the rank of
                </p>
                <span className="text-6xl font-bold font-mono text-primary block py-4">
                  {rank > 0 ? getOrdinalSuffix(rank) : 'Unranked'}
                </span>
              </div>

              <div className="flex justify-center gap-12 pt-8 border-t border-slate-700/50">
                <div className="text-center">
                  <p className="stat-number text-emerald-400">{totalPoints}</p>
                  <p className="stat-label">Points</p>
                </div>
                <div className="text-center">
                  <p className="stat-number text-amber-400">{solvedCount}</p>
                  <p className="stat-label">Challenges</p>
                </div>
                <div className="text-center">
                  <p className="stat-number text-purple-400">
                    {rank > 0 ? `#${rank}` : '—'}
                  </p>
                  <p className="stat-label">
                    {rank > 0 ? `of ${totalParticipants}` : 'Position'}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-12 border-t border-slate-700/50 text-sm">
                <div className="text-left">
                  <p className="text-primary font-semibold">IT Gate CTF</p>
                  <p className="text-slate-400">Cybersecurity Competition</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-300">
                    {new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-primary/70">ID: {certificateId}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visible Certificate (same content but with Tailwind classes) */}
          <div className="relative z-10 text-center space-y-6">
            <div className="space-y-2">
              <div className="flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${rank > 0 && i < Math.min(5, 6 - Math.ceil(rank / 2)) ? 'text-primary fill-primary' : 'text-muted-foreground/30'}`} />
                ))}
              </div>
              <h2 className="text-sm md:text-base font-mono uppercase tracking-[0.3em] text-slate-300">
                Certificate of Achievement
              </h2>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl md:text-4xl font-bold font-mono bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                IT Gate CTF
              </h1>
              <p className="text-xs md:text-sm text-slate-400 font-mono">
                Capture The Flag Competition
              </p>
            </div>

            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-primary/50 to-primary" />
              <Award className="h-6 w-6 text-primary" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent via-primary/50 to-primary" />
            </div>

            <div className="space-y-3">
              <p className="text-xs md:text-sm text-slate-400 font-mono uppercase tracking-wider">
                This is to certify that
              </p>
              <h3 className="text-2xl md:text-4xl font-bold font-mono text-white px-4 py-2 inline-block">
                {participantName}
              </h3>
              <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
              
              {validPlayerNames.length > 0 && (
                <div className="space-y-1 pt-4">
                  <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">
                    Team Members
                  </p>
                  <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                    {validPlayerNames.map((name, i) => (
                      <span key={i} className="text-base md:text-lg font-semibold font-mono text-white bg-slate-800/50 px-3 py-1 rounded-md">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs md:text-sm text-slate-400 font-mono">
                has successfully participated and achieved the rank of
              </p>
              <span className="text-4xl md:text-6xl font-bold font-mono text-primary">
                {rank > 0 ? getOrdinalSuffix(rank) : 'Unranked'}
              </span>
            </div>

            <div className="flex justify-center gap-8 pt-4">
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-bold font-mono text-emerald-400">
                  {totalPoints}
                </p>
                <p className="text-xs text-slate-400 font-mono uppercase">
                  Points
                </p>
              </div>
              <div className="w-px bg-slate-700" />
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-bold font-mono text-amber-400">
                  {solvedCount}
                </p>
                <p className="text-xs text-slate-400 font-mono uppercase">
                  Challenges
                </p>
              </div>
              <div className="w-px bg-slate-700" />
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-bold font-mono text-purple-400">
                  {rank > 0 ? `#${rank}` : '—'}
                </p>
                <p className="text-xs text-slate-400 font-mono uppercase">
                  {rank > 0 ? `of ${totalParticipants}` : 'Position'}
                </p>
              </div>
            </div>

            <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-mono">
              <div className="text-center md:text-left">
                <p className="text-primary font-semibold">IT Gate CTF</p>
                <p>Cybersecurity Competition</p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-slate-300">
                  {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
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
        </div>
      </CardContent>
    </Card>
  );
}
