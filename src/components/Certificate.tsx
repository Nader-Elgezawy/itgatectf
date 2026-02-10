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
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;

    try {
      // 1. إعدادات محسنة لـ html2canvas لمعالجة التدرجات والنصوص
      const canvas = await html2canvas(certificateRef.current, {
        scale: 3, // جودة عالية جداً
        useCORS: true, // للسماح بتحميل الصور
        backgroundColor: '#0f172a',
        logging: false,
        allowTaint: true,
        onclone: (clonedDoc) => {
          // نضمن أن العناصر التي تستخدم text-transparent تظهر بشكل صحيح
          // html2canvas أحياناً يفشل في رندرة text-clip، هنا نجبره على الظهور
          const gradientText = clonedDoc.querySelector('.force-visible-text');
          if (gradientText) {
            (gradientText as HTMLElement).style.color = 'white';
            (gradientText as HTMLElement).style.background = 'none';
            (gradientText as HTMLElement).style.webkitBackgroundClip = 'initial';
          }
        }
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // 2. حساب الأبعاد لتناسب حجم الـ PDF
      const imgWidth = canvas.width / 3;
      const imgHeight = canvas.height / 3;

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [imgWidth, imgHeight],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`ITGate_CTF_${participantName.replace(/\s+/g, '_')}.pdf`);
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
        <CardTitle className="font-mono flex items-center gap-2 text-white">
          <Award className="h-5 w-5 text-primary" />
          Your Certificate
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Certificate Area */}
        <div 
          ref={certificateRef} 
          className="relative bg-slate-950 border-2 border-primary/40 rounded-lg p-8 md:p-12 overflow-hidden"
          style={{ minWidth: '800px' }} // نضمن عرض كافي للرندرة
        >
          {/* Background Decorations */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0" />
          <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
          
          {/* Borders */}
          <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-primary/30 z-10" />
          <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-primary/30 z-10" />
          <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-primary/30 z-10" />
          <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-primary/30 z-10" />

          {/* Content Wrapper */}
          <div className="relative z-20 text-center space-y-6">
            
            {/* Header */}
            <div className="space-y-2">
              <div className="flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${rank > 0 && i < Math.min(5, 6 - Math.ceil(rank / 2)) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700'}`} />
                ))}
              </div>
              <h2 className="text-sm font-mono uppercase tracking-[0.4em] text-slate-400">
                Certificate of Achievement
              </h2>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <h1 className="text-4xl font-bold font-mono text-white force-visible-text">
                IT Gate CTF
              </h1>
              <p className="text-sm text-blue-400 font-mono tracking-widest uppercase">
                Capture The Flag Competition
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-24 bg-gradient-to-r from-transparent to-primary" />
              <Award className="h-8 w-8 text-primary" />
              <div className="h-px w-24 bg-gradient-to-l from-transparent to-primary" />
            </div>

            {/* Participant Name */}
            <div className="space-y-3">
              <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">
                This is to certify that
              </p>
              <h3 className="text-4xl md:text-5xl font-bold font-mono text-white">
                {participantName}
              </h3>
              <div className="w-64 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
              
              {validPlayerNames.length > 0 && (
                <div className="pt-4">
                  <p className="text-[10px] text-slate-500 font-mono uppercase mb-2">Team Members</p>
                  <div className="flex flex-wrap justify-center gap-4">
                    {validPlayerNames.map((name, i) => (
                      <span key={i} className="text-lg font-mono text-slate-200">{name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Rank & Stats */}
            <div className="space-y-4">
              <p className="text-sm text-slate-400 font-mono">
                has successfully participated and achieved the rank of
              </p>
              <div className="text-5xl font-bold font-mono text-primary py-2">
                {rank > 0 ? getOrdinalSuffix(rank) : 'Unranked'}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="flex justify-center gap-12 pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold font-mono text-emerald-400">{totalPoints}</p>
                <p className="text-[10px] text-slate-500 uppercase">Points</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold font-mono text-amber-400">{solvedCount}</p>
                <p className="text-[10px] text-slate-500 uppercase">Challenges</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold font-mono text-purple-400">{rank > 0 ? `#${rank}` : '—'}</p>
                <p className="text-[10px] text-slate-500 uppercase">Position</p>
              </div>
            </div>

            {/* Footer Information */}
            <div className="pt-10 flex justify-between items-end px-4 text-[10px] font-mono text-slate-500">
              <div className="text-left">
                <p className="text-primary font-bold">IT GATE COMMUNITY</p>
                <p>Verify at: itgate-ctf.com</p>
              </div>
              <div className="text-right">
                <p className="text-slate-300">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-primary/60 italic">ID: {certificateId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center pt-4">
          <Button 
            onClick={downloadCertificate} 
            className="font-mono bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg shadow-[0_0_20px_rgba(var(--primary),0.3)]"
          >
            <Download className="mr-2 h-5 w-5" />
            Download Certificate (PDF)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
