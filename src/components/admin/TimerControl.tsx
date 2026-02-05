import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Clock, Loader2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function TimerControl() {
  const [endTime, setEndTime] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('competition_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (data) {
      setSettingsId(data.id);
      setIsActive(data.is_active);
      if (data.end_time) {
        // Convert to local datetime-local format
        const dt = new Date(data.end_time);
        const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setEndTime(local);
      }
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!settingsId) return;
    setIsSaving(true);

    try {
      const endTimeUtc = endTime ? new Date(endTime).toISOString() : null;

      const { error } = await supabase
        .from('competition_settings')
        .update({
          end_time: endTimeUtc,
          is_active: isActive,
        })
        .eq('id', settingsId);

      if (error) throw error;
      toast.success('Timer settings saved');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground font-mono">
        Loading timer settings...
      </div>
    );
  }

  return (
    <Card className="cyber-card">
      <CardHeader>
        <CardTitle className="font-mono flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Competition Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-3">
          <Switch checked={isActive} onCheckedChange={setIsActive} />
          <Label className="font-mono">
            {isActive ? 'Timer Active' : 'Timer Inactive'}
          </Label>
        </div>

        <div className="space-y-2">
          <Label className="font-mono">End Time</Label>
          <Input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="cyber-input font-mono"
          />
          <p className="text-xs text-muted-foreground font-mono">
            Certificates will appear after this time expires.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="font-mono cyber-glow w-full"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Timer Settings
        </Button>
      </CardContent>
    </Card>
  );
}
