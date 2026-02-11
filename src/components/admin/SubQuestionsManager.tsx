import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, GripVertical, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubQuestion {
  id?: string;
  question_text: string;
  flag: string;
  points: number;
  penalty_points: number;
  sort_order: number;
}

interface SubQuestionsManagerProps {
  challengeId: string;
}

export function SubQuestionsManager({ challengeId }: SubQuestionsManagerProps) {
  const [questions, setQuestions] = useState<SubQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [challengeId]);

  const fetchQuestions = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('challenge_questions')
      .select('*')
      .eq('challenge_id', challengeId)
      .order('sort_order');

    if (data) {
      setQuestions(data.map(q => ({
        id: q.id,
        question_text: q.question_text,
        flag: q.flag,
        points: q.points,
        penalty_points: q.penalty_points,
        sort_order: q.sort_order,
      })));
    }
    setIsLoading(false);
  };

  const addQuestion = () => {
    setQuestions(prev => [...prev, {
      question_text: '',
      flag: '',
      points: 50,
      penalty_points: 0,
      sort_order: prev.length,
    }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof SubQuestion, value: string | number) => {
    setQuestions(prev => prev.map((q, i) => i === index ? { ...q, [field]: value } : q));
  };

  const saveQuestions = async () => {
    setIsSaving(true);
    try {
      // Delete existing questions for this challenge
      await supabase
        .from('challenge_questions')
        .delete()
        .eq('challenge_id', challengeId);

      // Insert new ones
      if (questions.length > 0) {
        const { error } = await supabase
          .from('challenge_questions')
          .insert(questions.map((q, i) => ({
            challenge_id: challengeId,
            question_text: q.question_text,
            flag: q.flag,
            points: q.points,
            penalty_points: q.penalty_points,
            sort_order: i,
          })));

        if (error) throw error;
      }

      toast.success('Sub-questions saved');
      fetchQuestions();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save sub-questions');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground font-mono">Loading sub-questions...</p>;
  }

  return (
    <div className="space-y-4 border-t border-border pt-4 mt-4">
      <div className="flex items-center justify-between">
        <Label className="font-mono text-base">Sub-Questions</Label>
        <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
          <Plus className="h-3 w-3 mr-1" /> Add Question
        </Button>
      </div>

      {questions.length === 0 && (
        <p className="text-xs text-muted-foreground font-mono">
          No sub-questions. The challenge will use its main flag only.
        </p>
      )}

      {questions.map((q, index) => (
        <div key={index} className="p-3 rounded-lg border border-border bg-muted/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono font-semibold">Question {index + 1}</span>
            <Button type="button" variant="ghost" size="icon" onClick={() => removeQuestion(index)} className="h-7 w-7 text-destructive">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-2">
            <Textarea
              value={q.question_text}
              onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
              placeholder="Question text..."
              rows={2}
              className="cyber-input text-sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="font-mono text-xs">Flag</Label>
              <Input
                value={q.flag}
                onChange={(e) => updateQuestion(index, 'flag', e.target.value)}
                placeholder="flag{...}"
                className="cyber-input font-mono text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="font-mono text-xs">Points</Label>
              <Input
                type="number"
                value={q.points}
                onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value) || 0)}
                min="0"
                className="cyber-input text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="font-mono text-xs">Penalty</Label>
              <Input
                type="number"
                value={q.penalty_points}
                onChange={(e) => updateQuestion(index, 'penalty_points', parseInt(e.target.value) || 0)}
                min="0"
                className="cyber-input text-sm"
              />
            </div>
          </div>
        </div>
      ))}

      {questions.length > 0 && (
        <Button type="button" onClick={saveQuestions} disabled={isSaving} className="w-full cyber-glow">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save Sub-Questions
        </Button>
      )}
    </div>
  );
}
