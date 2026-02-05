import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CompetitionSettings {
  id: string;
  end_time: string | null;
  is_active: boolean;
}

interface TimerState {
  settings: CompetitionSettings | null;
  isLoading: boolean;
  isExpired: boolean;
  timeLeft: { days: number; hours: number; minutes: number; seconds: number } | null;
}

export function useCompetitionTimer(): TimerState {
  const [settings, setSettings] = useState<CompetitionSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<TimerState['timeLeft']>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    fetchSettings();

    const channel = supabase
      .channel('competition-timer')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'competition_settings' }, () => {
        fetchSettings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!settings?.is_active || !settings?.end_time) {
      setTimeLeft(null);
      setIsExpired(false);
      return;
    }

    const calculateTimeLeft = () => {
      const endTime = new Date(settings.end_time!).getTime();
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
        return;
      }

      setIsExpired(false);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [settings]);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('competition_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (data) {
      setSettings(data);
    }
    setIsLoading(false);
  };

  return { settings, isLoading, isExpired, timeLeft };
}
