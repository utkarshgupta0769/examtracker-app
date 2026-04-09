import { useGetAllExams } from '../hooks/useQueries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardOverview from '../components/DashboardOverview';
import ExamsList from '../components/ExamsList';
import ResultsView from '../components/ResultsView';
import AdSenseUnit from '../components/AdSenseUnit';
import { Calendar, BarChart3, LayoutDashboard } from 'lucide-react';

export default function Dashboard() {
  const { data: exams, isLoading } = useGetAllExams();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground">Loading your exams...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="exams" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Exams</span>
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Results</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <DashboardOverview exams={exams || []} />
          <AdSenseUnit className="py-4" />
        </TabsContent>

        <TabsContent value="exams" className="space-y-6">
          <ExamsList exams={exams || []} />
          <AdSenseUnit className="py-4" />
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <ResultsView exams={exams || []} />
          <AdSenseUnit className="py-4" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
