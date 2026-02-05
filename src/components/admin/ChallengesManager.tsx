import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Flag, 
  Upload,
  Loader2,
  FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  points: number;
  flag: string;
  penalty_points: number;
  file_url: string | null;
  file_name: string | null;
  is_active: boolean;
  created_at: string;
}

export function ChallengesManager() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Web');
  const [points, setPoints] = useState('100');
  const [flag, setFlag] = useState('');
  const [penaltyPoints, setPenaltyPoints] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setChallenges(data);
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('Web');
    setPoints('100');
    setFlag('');
    setPenaltyPoints('0');
    setIsActive(true);
    setFile(null);
    setEditingChallenge(null);
  };

  const openEditDialog = (challenge: Challenge) => {
    setEditingChallenge(challenge);
    setTitle(challenge.title);
    setDescription(challenge.description);
    setCategory(challenge.category);
    setPoints(challenge.points.toString());
    setFlag(challenge.flag);
    setPenaltyPoints(challenge.penalty_points.toString());
    setIsActive(challenge.is_active);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let fileUrl = editingChallenge?.file_url || null;
      let fileName = editingChallenge?.file_name || null;

      // Upload file if provided
      if (file) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('challenge-files')
          .upload(filePath, file);

        if (uploadError) {
          throw new Error('Failed to upload file');
        }

        const { data: { publicUrl } } = supabase.storage
          .from('challenge-files')
          .getPublicUrl(filePath);

        fileUrl = publicUrl;
        fileName = file.name;
      }

      const challengeData = {
        title,
        description,
        category,
        points: parseInt(points),
        penalty_points: parseInt(penaltyPoints) || 0,
        flag,
        is_active: isActive,
        file_url: fileUrl,
        file_name: fileName,
      };

      if (editingChallenge) {
        const { error } = await supabase
          .from('challenges')
          .update(challengeData)
          .eq('id', editingChallenge.id);

        if (error) throw error;
        toast.success('Challenge updated successfully');
      } else {
        const { error } = await supabase
          .from('challenges')
          .insert(challengeData);

        if (error) throw error;
        toast.success('Challenge created successfully');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchChallenges();
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this challenge?')) return;

    const { error } = await supabase
      .from('challenges')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete challenge');
    } else {
      toast.success('Challenge deleted');
      fetchChallenges();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-mono">Challenges</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="font-mono cyber-glow">
              <Plus className="h-4 w-4 mr-2" />
              Add Challenge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-mono">
                {editingChallenge ? 'Edit Challenge' : 'Create Challenge'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-mono">Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Challenge title"
                    required
                    className="cyber-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono">Category</Label>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Web, Crypto, Forensics..."
                    required
                    className="cyber-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-mono">Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Challenge description and hints..."
                  rows={4}
                  required
                  className="cyber-input"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="font-mono">Points</Label>
                  <Input
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    min="1"
                    required
                    className="cyber-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono">Penalty (wrong answer)</Label>
                  <Input
                    type="number"
                    value={penaltyPoints}
                    onChange={(e) => setPenaltyPoints(e.target.value)}
                    min="0"
                    className="cyber-input"
                  />
                  <p className="text-xs text-muted-foreground">Points deducted per wrong attempt</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-mono">Flag</Label>
                  <Input
                    value={flag}
                    onChange={(e) => setFlag(e.target.value)}
                    placeholder="flag{...}"
                    required
                    className="cyber-input font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-mono">Task File (optional)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="cyber-input"
                  />
                  {editingChallenge?.file_name && !file && (
                    <span className="text-sm text-muted-foreground font-mono">
                      Current: {editingChallenge.file_name}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label className="font-mono">Active (visible to users)</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="cyber-glow">
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingChallenge ? (
                    'Update'
                  ) : (
                    'Create'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground font-mono">
          Loading challenges...
        </div>
      ) : challenges.length === 0 ? (
        <Card className="cyber-card">
          <CardContent className="py-8 text-center">
            <Flag className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground font-mono">No challenges yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {challenges.map((challenge) => (
            <Card key={challenge.id} className="cyber-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-mono font-semibold">{challenge.title}</h3>
                      <Badge variant={challenge.is_active ? "default" : "secondary"}>
                        {challenge.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline" className="font-mono">
                        {challenge.category}
                      </Badge>
                      <span className="text-sm font-mono text-primary">
                        {challenge.points} pts
                      </span>
                      {challenge.penalty_points > 0 && (
                        <span className="text-sm font-mono text-destructive">
                          -{challenge.penalty_points} penalty
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {challenge.description}
                    </p>
                    {challenge.file_name && (
                      <p className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {challenge.file_name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(challenge)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(challenge.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
