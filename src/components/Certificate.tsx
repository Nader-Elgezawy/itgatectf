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
      // حفظ الأنماط الأصلية مؤقتاً
      const originalStyles = {
        position: certificateRef.current.style.position,
        left: certificateRef.current.style.left,
        top: certificateRef.current.style.top,
        width: certificateRef.current.style.width,
        height: certificateRef.current.style.height,
      };

      // ضبط أبعاد ثابتة للشهادة لتحسين الـ PDF
      certificateRef.current.style.position = 'fixed';
      certificateRef.current.style.left = '0';
      certificateRef.current.style.top = '0';
      certificateRef.current.style.width = '1200px';
      certificateRef.current.style.height = '800px';

      // إضافة فاصل زمني لتحميل كل العناصر
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(certificateRef.current, {
        scale: 3, // زيادة الجودة
        backgroundColor: '#0f172a',
        useCORS: true,
        logging: false,
        allowTaint: true,
        imageTimeout: 15000, // زيادة وقت التحميل للصور
        onclone: (clonedDoc) => {
          // تأكد من أن كل النصوص واضحة في النسخة المستنسخة
          const clonedElement = clonedDoc.querySelector('[data-certificate]');
          if (clonedElement) {
            // إضافة أنماط إضافية لتحسين المظهر في PDF
            clonedElement.style.color = '#ffffff';
            clonedElement.style.fontFamily = 'monospace';
            
            // تأكد من أن كل النصوص مرئية
            const textElements = clonedElement.querySelectorAll('*');
            textElements.forEach(el => {
              if (el instanceof HTMLElement) {
                el.style.color = window.getComputedStyle(el).color || '#ffffff';
                el.style.opacity = '1';
                el.style.visibility = 'visible';
              }
            });
          }
        }
      });

      // استعادة الأنماط الأصلية
      certificateRef.current.style.position = originalStyles.position;
      certificateRef.current.style.left = originalStyles.left;
      certificateRef.current.style.top = originalStyles.top;
      certificateRef.current.style.width = originalStyles.width;
      certificateRef.current.style.height = originalStyles.height;

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // استخدام أبعاد A4 أفقي
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      // حساب الأبعاد لتناسب الصفحة
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // حساب نسبة التناسب
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgHeight / imgWidth;
      
      let width = pdfWidth - 20; // هامش 10 ملم من كل جانب
      let height = width * ratio;
      
      // إذا كان الارتفاع أكبر من الصفحة، اضبط العرض
      if (height > pdfHeight - 20) {
        height = pdfHeight - 20;
        width = height / ratio;
      }
      
      // حساب الموضع المركزي
      const x = (pdfWidth - width) / 2;
      const y = (pdfHeight - height) / 2;
      
      pdf.addImage(imgData, 'PNG', x, y, width, height, undefined, 'FAST');
      pdf.save(`ITGate_CTF_Certificate_${participantName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Failed to generate certificate:', error);
      // إعادة تعيين الأنماط في حالة الخطأ
      if (certificateRef.current) {
        certificateRef.current.style.position = '';
        certificateRef.current.style.left = '';
        certificateRef.current.style.top = '';
        certificateRef.current.style.width = '';
        certificateRef.current.style.height = '';
      }
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
        {/* Certificate Preview - استخدام inline styles لتحسين الـ PDF */}
        <div 
          ref={certificateRef} 
          data-certificate="true"
          className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-primary/40 rounded-lg p-8 md:p-12 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
            color: '#ffffff'
          }}
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
          
          {/* Corner borders */}
          <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-primary/30" />
          <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-primary/30" />
          <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-primary/30" />
          <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-primary/30" />

          {/* Logo with fallback */}
          <div className="absolute top-6 left-6 z-20">
            <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center border-2 border-primary/30">
              <span className="font-bold text-white text-xs">IT GATE</span>
            </div>
          </div>

          {/* Certificate Content */}
          <div className="relative z-10 text-center space-y-8" style={{ fontFamily: 'monospace, Arial, sans-serif' }}>
            <div className="space-y-4">
              <div className="flex justify-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-5 h-5"
                    style={{
                      color: rank > 0 && i < Math.min(5, 6 - Math.ceil(rank / 2)) ? '#3b82f6' : '#6b7280',
                      fill: rank > 0 && i < Math.min(5, 6 - Math.ceil(rank / 2)) ? '#3b82f6' : 'transparent'
                    }}
                  >
                    <Star className="w-full h-full" />
                  </div>
                ))}
              </div>
              <h2 
                className="text-base uppercase tracking-[0.3em]"
                style={{ color: '#cbd5e1', letterSpacing: '0.3em' }}
              >
                Certificate of Achievement
              </h2>
            </div>

            <div className="space-y-2">
              <h1 
                className="text-4xl font-bold"
                style={{
                  background: 'linear-gradient(to right, #ffffff, #cbd5e1, #94a3b8)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                IT Gate CTF
              </h1>
              <p className="text-sm" style={{ color: '#94a3b8' }}>
                Capture The Flag Competition
              </p>
            </div>

            <div className="flex items-center justify-center gap-8 py-4">
              <div 
                className="h-px w-24"
                style={{ background: 'linear-gradient(to right, transparent, rgba(59, 130, 246, 0.5), #3b82f6)' }}
              />
              <Award className="h-8 w-8" style={{ color: '#3b82f6' }} />
              <div 
                className="h-px w-24"
                style={{ background: 'linear-gradient(to left, transparent, rgba(59, 130, 246, 0.5), #3b82f6)' }}
              />
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm uppercase tracking-wider mb-4" style={{ color: '#94a3b8' }}>
                  This is to certify that
                </p>
                <h3 className="text-4xl font-bold mb-2" style={{ color: '#ffffff' }}>
                  {participantName}
                </h3>
                <div 
                  className="w-64 h-1 mx-auto"
                  style={{ background: 'linear-gradient(to right, transparent, #3b82f6, transparent)' }}
                />
              </div>
              
              {validPlayerNames.length > 0 && (
                <div className="space-y-3 pt-6">
                  <p className="text-xs uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                    Team Members
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {validPlayerNames.map((name, i) => (
                      <div 
                        key={i} 
                        className="text-lg font-semibold px-4 py-2 rounded-lg"
                        style={{ 
                          color: '#ffffff',
                          background: 'rgba(30, 41, 59, 0.8)',
                          border: '1px solid rgba(100, 116, 139, 0.3)'
                        }}
                      >
                        {name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4 py-6">
              <p className="text-sm" style={{ color: '#94a3b8' }}>
                has successfully participated and achieved the rank of
              </p>
              <span 
                className="text-6xl font-bold block py-4"
                style={{ color: '#3b82f6' }}
              >
                {rank > 0 ? getOrdinalSuffix(rank) : 'Unranked'}
              </span>
            </div>

            <div className="flex justify-center gap-12 pt-8" style={{ borderTop: '1px solid rgba(100, 116, 139, 0.3)' }}>
              <div className="text-center">
                <p className="text-3xl font-bold" style={{ color: '#10b981' }}>
                  {totalPoints}
                </p>
                <p className="text-xs uppercase" style={{ color: '#94a3b8', letterSpacing: '1px' }}>
                  Points
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-3xl font-bold" style={{ color: '#f59e0b' }}>
                  {solvedCount}
                </p>
                <p className="text-xs uppercase" style={{ color: '#94a3b8', letterSpacing: '1px' }}>
                  Challenges
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-3xl font-bold" style={{ color: '#8b5cf6' }}>
                  {rank > 0 ? `#${rank}` : '—'}
                </p>
                <p className="text-xs uppercase" style={{ color: '#94a3b8', letterSpacing: '1px' }}>
                  {rank > 0 ? `of ${totalParticipants}` : 'Position'}
                </p>
              </div>
            </div>

            <div 
              className="flex flex-col md:flex-row justify-between items-center gap-4 pt-12 text-sm"
              style={{ borderTop: '1px solid rgba(100, 116, 139, 0.3)' }}
            >
              <div className="text-center md:text-left">
                <p style={{ color: '#3b82f6', fontWeight: '600' }}>IT Gate CTF</p>
                <p style={{ color: '#94a3b8' }}>Cybersecurity Competition</p>
              </div>
              
              <div className="text-center md:text-right">
                <p style={{ color: '#cbd5e1' }}>
                  {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p style={{ color: 'rgba(59, 130, 246, 0.7)' }}>
                  Certificate ID: {certificateId}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center">
          <Button 
            onClick={downloadCertificate} 
            className="font-mono gap-3 px-8 py-6 text-lg"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              color: 'white',
              border: 'none'
            }}
          >
            <Download className="h-6 w-6" />
            Download Certificate (PDF)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
