import { useState } from 'react';
import type { Exam } from '../backend';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Calendar } from 'lucide-react';
import ExamCard from './ExamCard';
import AddExamDialog from './AddExamDialog';

interface ExamsListProps {
  exams: Exam[];
}

export default function ExamsList({ exams }: ExamsListProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);

  const now = Date.now();
  const upcomingExams = exams
    .filter((exam) => Number(exam.date) / 1000000 > now)
    .sort((a, b) => Number(a.date) - Number(b.date));

  const pastExams = exams
    .filter((exam) => Number(exam.date) / 1000000 <= now)
    .sort((a, b) => Number(b.date) - Number(a.date));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Exams</h2>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Exam
        </Button>
      </div>

      {exams.length === 0 ? (
        <Card className="border-2">
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No exams yet</h3>
            <p className="text-muted-foreground mb-4">
              Start tracking your exams by adding your first one
            </p>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Exam
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {upcomingExams.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-primary">Upcoming Exams</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {upcomingExams.map((exam) => (
                  <ExamCard key={Number(exam.id)} exam={exam} />
                ))}
              </div>
            </div>
          )}

          {pastExams.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-muted-foreground">Past Exams</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {pastExams.map((exam) => (
                  <ExamCard key={Number(exam.id)} exam={exam} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <AddExamDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </div>
  );
}
