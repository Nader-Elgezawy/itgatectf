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

// Inline color constants for html2canvas compatibility
const COLORS = {
  primary: '#d4920a',
  primaryLight: 'rgba(212, 146, 10, 0.5)',
  primaryFaint: 'rgba(212, 146, 10, 0.1)',
  success: '#3a9e5c',
  warning: '#d4920a',
  accent: '#5a7aad',
  text: '#1a1a1a',
  textMuted: '#6b7280',
  border: '#e5e7eb',
  bg: '#ffffff',
  bgFaint: '#fafafa',
};

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
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 3, canvas.height / 3],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 3, canvas.height / 3);
      pdf.save(`ITGate_CTF_Certificate_${participantName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Failed to generate certificate:', error);
    }
  };

  if (!participantName || solvedCount === 0 || !certificateId) {
    return null;
  }

  const validPlayerNames = playerNames.filter(Boolean);

  const starCount = rank > 0 ? Math.min(5, 6 - Math.ceil(rank / 2)) : 0;

  return (
    <Card className="cyber-card overflow-hidden">
      <CardHeader>
        <CardTitle className="font-mono flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Your Certificate
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Certificate Preview - uses INLINE STYLES for html2canvas compatibility */}
        <div
          ref={certificateRef}
          style={{
            position: 'relative',
            background: `linear-gradient(135deg, ${COLORS.bg}, ${COLORS.bgFaint}, ${COLORS.bg})`,
            border: `2px solid ${COLORS.primaryLight}`,
            borderRadius: '12px',
            padding: '48px',
            overflow: 'hidden',
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          }}
        >
          {/* Corner decorations */}
          <div style={{ position: 'absolute', top: '16px', left: '16px', width: '64px', height: '64px', borderLeft: `2px solid ${COLORS.primaryLight}`, borderTop: `2px solid ${COLORS.primaryLight}` }} />
          <div style={{ position: 'absolute', top: '16px', right: '16px', width: '64px', height: '64px', borderRight: `2px solid ${COLORS.primaryLight}`, borderTop: `2px solid ${COLORS.primaryLight}` }} />
          <div style={{ position: 'absolute', bottom: '16px', left: '16px', width: '64px', height: '64px', borderLeft: `2px solid ${COLORS.primaryLight}`, borderBottom: `2px solid ${COLORS.primaryLight}` }} />
          <div style={{ position: 'absolute', bottom: '16px', right: '16px', width: '64px', height: '64px', borderRight: `2px solid ${COLORS.primaryLight}`, borderBottom: `2px solid ${COLORS.primaryLight}` }} />

          {/* Logo */}
          <img
            src="/IT-Gate(1).png"
            alt="IT Gate Logo"
            crossOrigin="anonymous"
            style={{ position: 'absolute', top: '24px', left: '24px', height: '56px', width: '56px', objectFit: 'contain', zIndex: 20 }}
          />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
            {/* Stars */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '8px' }}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  style={{
                    width: '20px',
                    height: '20px',
                    color: i < starCount ? COLORS.primary : '#d1d5db',
                    fill: i < starCount ? COLORS.primary : 'none',
                  }}
                />
              ))}
            </div>

            {/* Subtitle */}
            <p style={{ fontSize: '12px', letterSpacing: '0.3em', textTransform: 'uppercase', color: COLORS.textMuted, marginBottom: '16px' }}>
              Certificate of Achievement
            </p>

            {/* Title */}
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: COLORS.primary, marginBottom: '4px' }}>
              IT Gate CTF
            </h1>
            <p style={{ fontSize: '13px', color: COLORS.textMuted, marginBottom: '20px' }}>
              Capture The Flag Competition
            </p>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ height: '1px', width: '64px', background: `linear-gradient(to right, transparent, ${COLORS.primaryLight}, ${COLORS.primary})` }} />
              <Award style={{ width: '24px', height: '24px', color: COLORS.primary }} />
              <div style={{ height: '1px', width: '64px', background: `linear-gradient(to left, transparent, ${COLORS.primaryLight}, ${COLORS.primary})` }} />
            </div>

            {/* Certify text */}
            <p style={{ fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', color: COLORS.textMuted, marginBottom: '12px' }}>
              This is to certify that
            </p>

            {/* Team name */}
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: COLORS.text, borderBottom: `2px solid ${COLORS.primaryLight}`, display: 'inline-block', padding: '8px 16px', marginBottom: '12px' }}>
              {participantName}
            </h2>

            {/* Team members */}
            {validPlayerNames.length > 0 && (
              <div style={{ marginTop: '12px', marginBottom: '16px' }}>
                <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: COLORS.textMuted, marginBottom: '4px' }}>
                  Team Members
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' as const }}>
                  {validPlayerNames.map((name, i) => (
                    <span key={i} style={{ fontSize: '16px', fontWeight: 600, color: COLORS.text }}>{name}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Rank */}
            <p style={{ fontSize: '13px', color: COLORS.textMuted, marginBottom: '8px' }}>
              has successfully participated and achieved the rank of
            </p>
            <p style={{ fontSize: '52px', fontWeight: 'bold', color: COLORS.primary, marginBottom: '16px' }}>
              {rank > 0 ? getOrdinalSuffix(rank) : 'Unranked'}
            </p>

            {/* Stats */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', paddingTop: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: COLORS.success }}>{totalPoints}</p>
                <p style={{ fontSize: '11px', textTransform: 'uppercase', color: COLORS.textMuted }}>Points</p>
              </div>
              <div style={{ width: '1px', background: COLORS.border }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: COLORS.text }}>{solvedCount}</p>
                <p style={{ fontSize: '11px', textTransform: 'uppercase', color: COLORS.textMuted }}>Challenges</p>
              </div>
              <div style={{ width: '1px', background: COLORS.border }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: COLORS.warning }}>{rank > 0 ? `#${rank}` : '—'}</p>
                <p style={{ fontSize: '11px', textTransform: 'uppercase', color: COLORS.textMuted }}>{rank > 0 ? `of ${totalParticipants}` : 'Position'}</p>
              </div>
            </div>

            {/* Footer */}
            <div style={{ paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: COLORS.textMuted }}>
              <div style={{ textAlign: 'left' }}>
                <p style={{ color: COLORS.primary, fontWeight: 600 }}>IT Gate CTF</p>
                <p>Cybersecurity Competition</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p style={{ color: COLORS.primaryLight }}>Certificate ID: {certificateId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center">
          <Button onClick={downloadCertificate} className="font-mono cyber-glow gap-2" size="lg">
            <Download className="h-5 w-5" />
            Download Certificate (PDF)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
