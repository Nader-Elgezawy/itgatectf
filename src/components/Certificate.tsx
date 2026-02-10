import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Download, Star, Sparkles, Trophy, Shield, Target, Medal } from 'lucide-react';
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
  dateIssued?: string;
}

export function Certificate({
  participantName,
  playerNames,
  rank,
  totalPoints,
  solvedCount,
  totalParticipants,
  certificateId,
  dateIssued = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }),
}: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const getOrdinalSuffix = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    if (rank <= 10) return '#4F46E5'; // Top 10 - Indigo
    if (rank <= 50) return '#10B981'; // Top 50 - Emerald
    return '#6B7280'; // Default gray
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { icon: Trophy, label: "Champion", color: "text-yellow-500" };
    if (rank <= 3) return { icon: Medal, label: "Top 3", color: "text-amber-500" };
    if (rank <= 10) return { icon: Star, label: "Top 10", color: "text-purple-500" };
    if (rank <= 50) return { icon: Shield, label: "Top 50", color: "text-emerald-500" };
    return { icon: Target, label: "Participant", color: "text-blue-500" };
  };

  const calculatePerformance = () => {
    const pointsPerChallenge = totalPoints / solvedCount || 0;
    const percentile = ((totalParticipants - rank) / totalParticipants) * 100;
    
    return {
      pointsPerChallenge,
      percentile: Math.round(percentile),
      efficiency: Math.min(100, Math.round((solvedCount / 20) * 100)) // Assuming 20 total challenges
    };
  };

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 3,
        backgroundColor: '#0f172a',
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 3, canvas.height / 3],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 3, canvas.height / 3, undefined, 'FAST');
      pdf.save(`ITGate_CTF_Certificate_${participantName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Failed to generate certificate:', error);
    }
  };

  const shareCertificate = () => {
    if (navigator.share) {
      navigator.share({
        title: `My IT Gate CTF Certificate - ${participantName}`,
        text: `I achieved ${getOrdinalSuffix(rank)} place in IT Gate CTF with ${totalPoints} points!`,
        url: window.location.href,
      });
    }
  };

  if (!participantName || solvedCount === 0 || !certificateId) {
    return null;
  }

  const validPlayerNames = playerNames.filter(Boolean);
  const performance = calculatePerformance();
  const rankBadge = getRankBadge(rank);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Sparkles className="h-8 w-8 text-primary animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent">
            Achievement Certificate
          </h1>
          <Sparkles className="h-8 w-8 text-primary animate-pulse" />
        </div>
        <p className="text-muted-foreground text-lg">
          Congratulations on your outstanding performance in IT Gate CTF
        </p>
      </div>

      {/* Main Certificate Container */}
      <Card className="border-none shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-700/[0.04] bg-[size:20px_20px]" />
        
        <CardHeader className="relative z-10 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">CTF Certificate of Excellence</CardTitle>
                <p className="text-sm text-slate-400">Capture The Flag Competition</p>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-slate-700">
                <rankBadge.icon className={`h-4 w-4 ${rankBadge.color}`} />
                <span className="text-sm font-medium">{rankBadge.label}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 p-0">
          {/* Certificate Design */}
          <div ref={certificateRef} className="p-8 md:p-12">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary/10 to-cyan-500/10 rounded-full blur-3xl" />
            </div>

            {/* Certificate Border Design */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-purple-500 to-cyan-500" />
            <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-500 via-purple-500 to-primary" />
            
            {/* Corner Accents */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-primary/50" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-cyan-500/50" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-purple-500/50" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-primary/50" />

            {/* Main Content */}
            <div className="relative z-20 space-y-10">
              {/* Logo and Title */}
              <div className="flex flex-col items-center space-y-6">
                <div className="flex items-center gap-4">
                  <img 
                    src="/IT-Gate(1).png" 
                    alt="IT Gate Logo" 
                    className="h-16 w-16 object-contain drop-shadow-lg"
                  />
                  <div className="text-center">
                    <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                      IT GATE CTF
                    </h2>
                    <p className="text-sm text-slate-400 font-mono tracking-wider">
                      CYBERSECURITY COMPETITION
                    </p>
                  </div>
                </div>
              </div>

              {/* Achievement Statement */}
              <div className="text-center space-y-8">
                <div className="space-y-2">
                  <p className="text-lg text-slate-400 font-light tracking-wider">
                    THIS CERTIFIES THAT
                  </p>
                  <div className="inline-block relative">
                    <h3 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      {participantName}
                    </h3>
                    <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
                  </div>
                </div>

                {validPlayerNames.length > 0 && (
                  <div className="space-y-2 pt-4">
                    <p className="text-sm text-slate-500 font-mono">TEAM MEMBERS</p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {validPlayerNames.map((name, i) => (
                        <span 
                          key={i} 
                          className="text-lg font-semibold text-slate-300 px-4 py-2 rounded-lg bg-slate-800/50 backdrop-blur-sm border border-slate-700"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <p className="text-base text-slate-400 font-light">
                    HAS DEMONSTRATED EXCEPTIONAL SKILL AND ACHIEVED THE RANK OF
                  </p>
                  <div className="inline-block relative">
                    <span 
                      className="text-5xl md:text-7xl font-black"
                      style={{ color: getRankColor(rank) }}
                    >
                      {rank > 0 ? getOrdinalSuffix(rank) : 'UNRANKED'}
                    </span>
                    <div className="absolute -inset-4 bg-gradient-to-r from-transparent via-current/10 to-transparent blur-xl" />
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-slate-700/50">
                <div className="text-center p-4 rounded-xl bg-slate-800/30 backdrop-blur-sm border border-slate-700/50">
                  <p className="text-3xl font-bold text-primary">{totalPoints}</p>
                  <p className="text-sm text-slate-400 mt-1">TOTAL POINTS</p>
                  <div className="h-1 w-8 mx-auto mt-2 bg-gradient-to-r from-primary/50 to-primary rounded-full" />
                </div>

                <div className="text-center p-4 rounded-xl bg-slate-800/30 backdrop-blur-sm border border-slate-700/50">
                  <p className="text-3xl font-bold text-emerald-400">{solvedCount}</p>
                  <p className="text-sm text-slate-400 mt-1">CHALLENGES SOLVED</p>
                  <div className="h-1 w-8 mx-auto mt-2 bg-gradient-to-r from-emerald-400/50 to-emerald-400 rounded-full" />
                </div>

                <div className="text-center p-4 rounded-xl bg-slate-800/30 backdrop-blur-sm border border-slate-700/50">
                  <p className="text-3xl font-bold text-amber-400">{performance.percentile}%</p>
                  <p className="text-sm text-slate-400 mt-1">TOP PERCENTILE</p>
                  <div className="h-1 w-8 mx-auto mt-2 bg-gradient-to-r from-amber-400/50 to-amber-400 rounded-full" />
                </div>

                <div className="text-center p-4 rounded-xl bg-slate-800/30 backdrop-blur-sm border border-slate-700/50">
                  <p className="text-3xl font-bold text-purple-400">{performance.efficiency}%</p>
                  <p className="text-sm text-slate-400 mt-1">EFFICIENCY RATE</p>
                  <div className="h-1 w-8 mx-auto mt-2 bg-gradient-to-r from-purple-400/50 to-purple-400 rounded-full" />
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-700/50 space-y-4 md:space-y-0">
                <div className="text-center md:text-left">
                  <p className="text-sm text-slate-500 font-mono">ISSUED BY</p>
                  <p className="text-lg font-semibold text-slate-300">IT Gate CTF Committee</p>
                  <p className="text-sm text-slate-500">Cybersecurity Division</p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-slate-500 font-mono">DATE OF ISSUANCE</p>
                  <p className="text-lg font-semibold text-slate-300">{dateIssued}</p>
                </div>

                <div className="text-center md:text-right">
                  <p className="text-sm text-slate-500 font-mono">CERTIFICATE ID</p>
                  <p className="text-lg font-semibold text-primary font-mono tracking-tight">
                    {certificateId}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-8 border-t border-slate-700/50">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={downloadCertificate} 
                className="flex-1 max-w-md bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/25 gap-3 py-6"
                size="lg"
              >
                <Download className="h-5 w-5" />
                <span className="font-semibold">Download High-Quality PDF</span>
              </Button>
              
              <Button 
                onClick={shareCertificate}
                variant="outline" 
                className="flex-1 max-w-md border-slate-700 bg-slate-800/50 hover:bg-slate-800 gap-3 py-6"
                size="lg"
              >
                <Sparkles className="h-5 w-5" />
                <span className="font-semibold">Share Achievement</span>
              </Button>
            </div>
            
            <p className="text-center text-sm text-slate-500 mt-4">
              This certificate is proof of your exceptional performance in the IT Gate CTF competition
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card className="border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="text-lg font-semibold text-slate-300 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Rank Summary
              </h4>
              <p className="text-slate-400 text-sm">
                You placed in the top {Math.round((rank / totalParticipants) * 100)}% of {totalParticipants} participants
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-lg font-semibold text-slate-300 flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-500" />
                Challenge Performance
              </h4>
              <p className="text-slate-400 text-sm">
                Average {performance.pointsPerChallenge.toFixed(1)} points per challenge solved
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-lg font-semibold text-slate-300 flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                Achievement Level
              </h4>
              <p className="text-slate-400 text-sm">
                {rankBadge.label} • Certificate ID: {certificateId}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
