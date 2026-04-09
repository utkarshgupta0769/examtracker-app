import { useMemo } from 'react';
import type { Exam } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, TrendingUp, Calendar } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ResultsViewProps {
  exams: Exam[];
}

export default function ResultsView({ exams }: ResultsViewProps) {
  const completedExams = useMemo(() => {
    return exams
      .filter((exam) => exam.score !== undefined && exam.score !== null)
      .sort((a, b) => Number(b.date) - Number(a.date));
  }, [exams]);

  const subjectStats = useMemo(() => {
    const stats = new Map<string, { scores: number[]; average: number }>();

    completedExams.forEach((exam) => {
      const score = Number(exam.score || 0);
      if (!stats.has(exam.subject)) {
        stats.set(exam.subject, { scores: [], average: 0 });
      }
      const subjectData = stats.get(exam.subject)!;
      subjectData.scores.push(score);
    });

    stats.forEach((data, subject) => {
      data.average = data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length;
    });

    return Array.from(stats.entries())
      .map(([subject, data]) => ({ subject, ...data }))
      .sort((a, b) => b.average - a.average);
  }, [completedExams]);

  const overallAverage = useMemo(() => {
    if (completedExams.length === 0) return 0;
    const sum = completedExams.reduce((acc, exam) => acc + Number(exam.score || 0), 0);
    return Math.round(sum / completedExams.length);
  }, [completedExams]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 80) return 'text-blue-600 dark:text-blue-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 60) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (completedExams.length === 0) {
    return (
      <Card className="border-2">
        <CardContent className="py-12 text-center">
          <Award className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No results yet</h3>
          <p className="text-muted-foreground">
            Record your exam scores to see your performance trends
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-2 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
              {overallAverage}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {completedExams.length} exam{completedExams.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Score</CardTitle>
            <Award className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 dark:text-green-300">
              {Math.max(...completedExams.map((e) => Number(e.score || 0)))}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Your highest score</p>
          </CardContent>
        </Card>

        <Card className="border-2 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
              {subjectStats.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Subjects completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Subject Performance */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Performance by Subject</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {subjectStats.map(({ subject, average, scores }) => (
              <div key={subject} className="flex items-center justify-between rounded-lg border bg-card p-3">
                <div className="flex-1">
                  <h4 className="font-semibold">{subject}</h4>
                  <p className="text-sm text-muted-foreground">
                    {scores.length} exam{scores.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Badge variant="secondary" className={`text-lg font-bold ${getScoreColor(average)}`}>
                  {Math.round(average)}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Results */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Recent Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedExams.map((exam) => {
                const examDate = new Date(Number(exam.date) / 1000000);
                const formattedDate = examDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
                const score = Number(exam.score || 0);

                return (
                  <TableRow key={Number(exam.id)}>
                    <TableCell className="font-medium">{exam.subject}</TableCell>
                    <TableCell className="text-muted-foreground">{formattedDate}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary" className={`font-bold ${getScoreColor(score)}`}>
                        {score}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
