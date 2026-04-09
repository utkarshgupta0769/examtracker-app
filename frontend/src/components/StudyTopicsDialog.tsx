import { useState } from 'react';
import type { Exam, StudyStatus } from '../backend';
import { useAddStudyTopic, useUpdateTopicStatus } from '../hooks/useQueries';
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
import { Badge } from '@/components/ui/badge';
import { Plus, Circle, Clock, CheckCircle2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StudyTopicsDialogProps {
  exam: Exam;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StudyTopicsDialog({ exam, open, onOpenChange }: StudyTopicsDialogProps) {
  const [newTopic, setNewTopic] = useState('');
  const addTopic = useAddStudyTopic();
  const updateStatus = useUpdateTopicStatus();

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTopic.trim()) {
      addTopic.mutate(
        { examId: exam.id, name: newTopic.trim() },
        {
          onSuccess: () => {
            setNewTopic('');
          },
        }
      );
    }
  };

  const handleStatusChange = (topicId: bigint, status: string) => {
    updateStatus.mutate({
      examId: exam.id,
      topicId,
      status: status as StudyStatus,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'notStarted':
        return <Circle className="h-4 w-4 text-gray-400" />;
      case 'inProgress':
        return <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'notStarted':
        return 'Not Started';
      case 'inProgress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Study Topics - {exam.subject}</DialogTitle>
          <DialogDescription>
            Track your study progress for each topic
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add Topic Form */}
          <form onSubmit={handleAddTopic} className="flex gap-2">
            <Input
              placeholder="Add a new topic..."
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!newTopic.trim() || addTopic.isPending}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </form>

          {/* Topics List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {exam.topics.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p>No topics yet. Add your first study topic above.</p>
              </div>
            ) : (
              exam.topics.map((topic) => (
                <div
                  key={Number(topic.id)}
                  className="flex items-center gap-3 rounded-lg border bg-card p-3"
                >
                  {getStatusIcon(topic.status)}
                  <span className="flex-1 font-medium">{topic.name}</span>
                  <Select
                    value={topic.status}
                    onValueChange={(value) => handleStatusChange(topic.id, value)}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notStarted">Not Started</SelectItem>
                      <SelectItem value="inProgress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
