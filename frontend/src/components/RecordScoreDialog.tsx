import { useState } from 'react';
import type { Exam } from '../backend';
import { useRecordExamScore } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface RecordScoreDialogProps {
  exam: Exam;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RecordScoreDialog({ exam, open, onOpenChange }: RecordScoreDialogProps) {
  const [score, setScore] = useState('');
  const recordScore = useRecordExamScore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const scoreNum = parseInt(score);
    if (!isNaN(scoreNum) && scoreNum >= 0 && scoreNum <= 100) {
      recordScore.mutate(
        { examId: exam.id, score: BigInt(scoreNum) },
        {
          onSuccess: () => {
            setScore('');
            onOpenChange(false);
          },
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Exam Score</DialogTitle>
          <DialogDescription>
            Enter your score for {exam.subject}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="score">Score (%)</Label>
            <Input
              id="score"
              type="number"
              min="0"
              max="100"
              placeholder="Enter score (0-100)"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!score || recordScore.isPending}
            >
              {recordScore.isPending ? 'Recording...' : 'Record Score'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
