import { useState } from 'react';
import type { Exam } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Edit, Trash2, BookOpen, Award } from 'lucide-react';
import { useDeleteExam } from '../hooks/useQueries';
import EditExamDialog from './EditExamDialog';
import StudyTopicsDialog from './StudyTopicsDialog';
import RecordScoreDialog from './RecordScoreDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ExamCardProps {
  exam: Exam;
}

export default function ExamCard({ exam }: ExamCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isTopicsOpen, setIsTopicsOpen] = useState(false);
  const [isScoreOpen, setIsScoreOpen] = useState(false);
  const deleteExam = useDeleteExam();

  const examDate = new Date(Number(exam.date) / 1000000);
  const formattedDate = examDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isPast = examDate.getTime() < Date.now();

  const studyProgress =
    exam.topics.length > 0
      ? (exam.topics.filter((t) => t.status === 'completed').length / exam.topics.length) * 100
      : 0;

  const handleDelete = () => {
    deleteExam.mutate(exam.id);
    setIsDeleteOpen(false);
  };

  return (
    <>
      <Card className="border-2 transition-all hover:shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl">{exam.subject}</CardTitle>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{exam.time}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditOpen(true)}
                className="h-8 w-8"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDeleteOpen(true)}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Study Progress */}
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">Study Progress</span>
              <span className="text-muted-foreground">{Math.round(studyProgress)}%</span>
            </div>
            <Progress value={studyProgress} />
            <p className="mt-1 text-xs text-muted-foreground">
              {exam.topics.filter((t) => t.status === 'completed').length} of {exam.topics.length} topics completed
            </p>
          </div>

          {/* Score Badge */}
          {exam.score !== undefined && exam.score !== null && (
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium">Score:</span>
              <Badge variant="secondary" className="text-base font-bold">
                {Number(exam.score)}%
              </Badge>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTopicsOpen(true)}
              className="flex-1"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Study Topics
            </Button>
            {isPast && (exam.score === undefined || exam.score === null) && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsScoreOpen(true)}
                className="flex-1"
              >
                <Award className="mr-2 h-4 w-4" />
                Record Score
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <EditExamDialog exam={exam} open={isEditOpen} onOpenChange={setIsEditOpen} />
      <StudyTopicsDialog exam={exam} open={isTopicsOpen} onOpenChange={setIsTopicsOpen} />
      <RecordScoreDialog exam={exam} open={isScoreOpen} onOpenChange={setIsScoreOpen} />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exam</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{exam.subject}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
