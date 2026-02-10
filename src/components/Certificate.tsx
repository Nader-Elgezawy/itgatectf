import { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Download, ShieldCheck, Zap } from 'lucide-react';
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
        scale: 3, // Higher scale for print quality
        backgroundColor: '#09090b', // Force dark background for PDF
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 3, canvas.height / 3],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 3, canvas.height / 3);
      pdf.save(`Certificate_${participantName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Failed to generate certificate:', error);
    }
  };

  if (!participantName || solvedCount === 0 || !certificateId) return null;

  return (
    <div className="flex flex-col items-center gap-8 py-10">
      {/* Main Certificate Container */}
      <div 
        ref={certificateRef} 
        className="relative w-[842px] h-[595px] bg-[#09090b] text-white overflow-hidden flex flex-col items-center justify-between p-12 border-[12px] border-[#1e1e1e]"
      >
        {/* Ornate Inner Border */}
        <div className="absolute inset-4 border border-primary/30 pointer-events-none" />
        
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[60%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[60%] bg-blue-500/5 blur-[120px] rounded-full" />

        {/* Header Section */}
        <div className="z-10 flex flex-col items-center gap-2">
          <div className="bg-primary/10 p-3 rounded-full mb-2">
            <ShieldCheck className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-xs tracking-[0.5em] uppercase font-light text-primary/80">
            Official Certification of Excellence
          </h2>
          <h1 className="text-5xl font-bold tracking-tighter">IT GATE CTF 2026</h1>
        </div>

        {/* Recipient Section */}
        <div className="z-10 text-center space-y-4">
          <p className="italic font-serif text-zinc-400 text-lg">This elite distinction is proudly presented to</p>
          <div className="relative">
            <h3 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 px-10">
              {participantName}
            </h3>
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary to-transparent mt-2" />
          </div>
          <p className="text-zinc-400 max-w-lg mx-auto text-sm leading-relaxed uppercase tracking-widest pt-2">
            For outstanding technical proficiency and strategic problem-solving during the 
            Capture The Flag cybersecurity challenge.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="z-10 grid grid-cols-3 gap-12 border-y border-white/10 py-6 w-full max-w-2xl">
          <div className="text-center">
            <p className="text-primary text-2xl font-mono font-bold">{getOrdinalSuffix(rank)}</p>
            <p className="text-[10px] uppercase tracking-tighter text-zinc-500">Global Rank</p>
          </div>
          <div className="text-center border-x border-white/10">
            <p className="text-primary text-2xl font-mono font-bold">{totalPoints}</p>
            <p className="text-[10px] uppercase tracking-tighter text-zinc-500">Points Earned</p>
          </div>
          <div className="text-center">
            <p className="text-primary text-2xl font-mono font-bold">{solvedCount}</p>
            <p className="text-[10px] uppercase tracking-tighter text-zinc-500">Flags Captured</p>
          </div>
        </div>

        {/* Footer Section */}
        <div className="z-10 w-full flex justify-between items-end px-4">
          <div className="space-y-1">
            <p className="text-[10px] font-mono text-zinc-500 uppercase">Certificate ID</p>
            <p className="text-xs font-mono text-zinc-300">{certificateId.toUpperCase()}</p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <Zap className="h-8 w-8 text-primary/40" />
            <div className="h-px w-32 bg-zinc-700" />
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">Authorized Signature</p>
          </div>

          <div className="text-right space-y-1">
            <p className="text-[10px] font-mono text-zinc-500 uppercase">Issued Date</p>
            <p className="text-xs font-mono text-zinc-300">
              {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <Button 
        onClick={downloadCertificate} 
        size="lg"
        className="px-8 py-6 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all hover:scale-105"
      >
        <Download className="mr-2 h-5 w-5" />
        Export High-Resolution PDF
      </Button>
    </div>
  );
}
