import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateNote, useUpdateNote } from '../hooks/useNotesMutations';
import { normalizeError } from '../lib/errors';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Note } from '../backend';

interface NoteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingNote?: Note | null;
  authorName: string;
  collegeName: string;
}

export default function NoteForm({ open, onOpenChange, existingNote, authorName, collegeName }: NoteFormProps) {
  const [questionNo, setQuestionNo] = useState('');
  const [year, setYear] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [answer, setAnswer] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createNote = useCreateNote();
  const updateNote = useUpdateNote();

  const isEditing = !!existingNote;

  useEffect(() => {
    if (existingNote) {
      setQuestionNo(existingNote.questionNo);
      setYear(existingNote.year);
      setQuestionText(existingNote.questionText);
      setAnswer(existingNote.answer);
    } else {
      setQuestionNo('');
      setYear('');
      setQuestionText('');
      setAnswer('');
    }
    setErrors({});
  }, [existingNote, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!questionNo.trim()) {
      newErrors.questionNo = 'Question number is required';
    }

    if (!answer.trim()) {
      newErrors.answer = 'Answer is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      if (isEditing && existingNote) {
        await updateNote.mutateAsync({
          noteId: existingNote.id,
          author: authorName,
          year: year.trim(),
          college: collegeName,
          questionNo: questionNo.trim(),
          questionText: questionText.trim(),
          answer: answer.trim(),
          isStarred: existingNote.isStarred,
          isPinned: existingNote.isPinned,
        });
        toast.success('Note updated successfully');
      } else {
        await createNote.mutateAsync({
          author: authorName,
          year: year.trim(),
          college: collegeName,
          questionNo: questionNo.trim(),
          questionText: questionText.trim(),
          answer: answer.trim(),
          isStarred: false,
          isPinned: false,
        });
        toast.success('Note created successfully');
      }
      onOpenChange(false);
    } catch (error) {
      const errorMessage = normalizeError(error);
      toast.error(errorMessage);
      setErrors({ submit: errorMessage });
    }
  };

  const isPending = createNote.isPending || updateNote.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Note' : 'Create New Note'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update your study note with new information.' 
              : 'Add a new study note to share with others.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="questionNo">Question Number *</Label>
              <Input
                id="questionNo"
                value={questionNo}
                onChange={(e) => setQuestionNo(e.target.value)}
                placeholder="e.g., Q1, Q2.5, 3a"
                className={errors.questionNo ? 'border-destructive' : ''}
              />
              {errors.questionNo && <p className="text-sm text-destructive">{errors.questionNo}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="year">Year (optional)</Label>
              <Input
                id="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g., 2024, Spring 2023"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="questionText">Question Text (optional)</Label>
              <Textarea
                id="questionText"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Enter the question text here..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="answer">Answer / Notes *</Label>
              <Textarea
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter your answer or study notes here..."
                rows={6}
                className={errors.answer ? 'border-destructive' : ''}
              />
              {errors.answer && <p className="text-sm text-destructive">{errors.answer}</p>}
            </div>

            {errors.submit && (
              <p className="text-sm text-destructive">{errors.submit}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create Note'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
