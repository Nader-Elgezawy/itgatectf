import { Card, CardContent } from '@/components/ui/card';
import { Clock, Trophy } from 'lucide-react';
import { useCompetitionTimer } from '@/hooks/useCompetitionTimer';

export function CompetitionTimer() {
  const { isLoading, isExpired, timeLeft, settings } = useCompetitionTimer();

  if (isLoading || !settings?.is_active || !settings?.end_time) {
    return null;
  }

  if (isExpired) {
    return (
      <Card className="cyber-card border-success/30 bg-success/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-3">
            <Trophy className="h-6 w-6 text-success" />
            <span className="font-mono text-lg font-bold text-success">
              Competition Ended — Certificates Available!
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="cyber-card border-primary/30">
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <span className="font-mono text-sm text-muted-foreground uppercase tracking-wider">
              Competition Ends In
            </span>
          </div>
          <div className="flex items-center gap-3">
            {timeLeft && (
              <>
                <TimeUnit value={timeLeft.days} label="Days" />
                <Separator />
                <TimeUnit value={timeLeft.hours} label="Hours" />
                <Separator />
                <TimeUnit value={timeLeft.minutes} label="Min" />
                <Separator />
                <TimeUnit value={timeLeft.seconds} label="Sec" />
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="bg-muted/50 border border-border rounded-lg px-4 py-3 min-w-[70px]">
        <span className="text-3xl font-bold font-mono text-primary">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs font-mono text-muted-foreground mt-1 block uppercase">
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return (
    <span className="text-2xl font-bold font-mono text-muted-foreground pb-5">:</span>
  );
}
