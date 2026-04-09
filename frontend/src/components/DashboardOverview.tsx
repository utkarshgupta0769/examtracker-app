import { useMemo } from 'react';
import type { Exam } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, BookOpen, TrendingUp, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import ExamCountdown from './ExamCountdown';

interface DashboardOverviewProps {
  exams: Exam[];
}

export default function DashboardOverview({ exams }: DashboardOverviewProps) {
  const stats = useMemo(() => {
    const now = Date.now();
    const upcomingExams = exams.filter((exam) => Number(exam.date) / 1000000 > now);
    const completedExams = exams.filter((exam) => exam.score !== undefined && exam.score !== null);

    const totalTopics = exams.reduce((sum, exam) => sum + exam.topics.length, 0);
    const completedTopics = exams.reduce(
      (sum, exam) => sum + exam.topics.filter((t) => t.status === 'completed').length,
      0
    );
    const studyProgress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

    const averageScore =
      completedExams.length > 0
        ? completedExams.reduce((sum, exam) => sum + Number(exam.score || 0), 0) / completedExams.length
        : 0;

    return {
      upcomingCount: upcomingExams.length,
      studyProgress: Math.round(studyProgress),
      averageScore: Math.round(averageScore),
      completedCount: completedExams.length,
      upcomingExams: upcomingExams.sort((a, b) => Number(a.date) - Number(b.date)).slice(0, 3),
    };
  }, [exams]);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.upcomingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Exams scheduled</p>
          </CardContent>
        </Card>

        <Card className="border-2 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Progress</CardTitle>
            <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">{stats.studyProgress}%</div>
            <Progress value={stats.studyProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-2 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
              {stats.averageScore}
              <span className="text-lg">%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completedCount} exam{stats.completedCount !== 1 ? 's' : ''} completed
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
            <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 dark:text-green-300">{exams.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Exams */}
      {stats.upcomingExams.length > 0 && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Next Exams
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.upcomingExams.map((exam) => (
              <ExamCountdown key={Number(exam.id)} exam={exam} />
            ))}
          </CardContent>
        </Card>
      )}

      {exams.length === 0 && (
        <Card className="border-2">
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No exams yet</h3>
            <p className="text-muted-foreground">
              Get started by adding your first exam in the Exams tab
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
