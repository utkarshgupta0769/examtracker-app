import { useState } from 'react';
import { useAddExam } from '../hooks/useQueries';
import { useActorWithStatus } from '../hooks/useActorWithStatus';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AddExamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COMMON_SUBJECTS = [
  'Mathematics',
  'Science',
  'Physics',
  'Chemistry',
  'Biology',
  'History',
  'English',
  'Computer Science',
  'Geography',
  'Literature',
  'Other',
];

export default function AddExamDialog({ open, onOpenChange }: AddExamDialogProps) {
  const [subject, setSubject] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const addExam = useAddExam();
  const { actor, isFetching, isError, error, retry } = useActorWithStatus();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSubject = subject === 'Other' ? customSubject.trim() : subject;
    
    if (finalSubject && date && time && actor && !isFetching) {
      const examDate = new Date(date + 'T' + time);
      const nanoTime = BigInt(examDate.getTime()) * BigInt(1000000);
      
      addExam.mutate(
        { subject: finalSubject, date: nanoTime, time },
        {
          onSuccess: () => {
            setSubject('');
            setCustomSubject('');
            setDate('');
            setTime('');
            onOpenChange(false);
          },
        }
      );
    }
  };

  const isFormDisabled = !actor || isFetching || addExam.isPending;
  const finalSubject = subject === 'Other' ? customSubject.trim() : subject;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Exam</DialogTitle>
          <DialogDescription>
            Enter the details for your upcoming exam. Study topics will be automatically generated based on your subject.
          </DialogDescription>
        </DialogHeader>

        {isError && error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span className="flex-1">{error.message}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={retry}
                className="ml-2"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {isFetching && (
          <Alert>
            <AlertDescription className="flex items-center">
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              Connecting to backend...
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject / Class</Label>
            <Select
              value={subject}
              onValueChange={setSubject}
              disabled={isFormDisabled}
            >
              <SelectTrigger id="subject">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_SUBJECTS.map((subj) => (
                  <SelectItem key={subj} value={subj}>
                    {subj}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {subject === 'Other' && (
            <div className="space-y-2">
              <Label htmlFor="customSubject">Custom Subject</Label>
              <Input
                id="customSubject"
                placeholder="Enter subject name"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                disabled={isFormDisabled}
                autoFocus
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isFormDisabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={isFormDisabled}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={addExam.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!finalSubject || !date || !time || isFormDisabled}
            >
              {addExam.isPending ? 'Adding...' : isFetching ? 'Connecting...' : 'Add Exam'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
