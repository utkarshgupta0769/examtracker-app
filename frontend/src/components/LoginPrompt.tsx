import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdSenseUnit from './AdSenseUnit';
import { GraduationCap, CheckCircle } from 'lucide-react';

export default function LoginPrompt() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            <img
              src="/assets/generated/study-hero.dim_800x600.png"
              alt="Study Hero"
              className="h-64 w-auto rounded-2xl shadow-2xl"
            />
          </div>
          <h1 className="mb-4 text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
            Track Your Academic Success
          </h1>
          <p className="mb-8 text-xl text-muted-foreground">
            Organize exams, monitor study progress, and achieve your academic goals with ExamTracker
          </p>
          <Button
            onClick={handleLogin}
            disabled={isLoggingIn}
            size="lg"
            className="rounded-full px-8 text-lg shadow-lg"
          >
            {isLoggingIn ? (
              <>
                <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Logging in...
              </>
            ) : (
              <>
                <GraduationCap className="mr-2 h-5 w-5" />
                Get Started
              </>
            )}
          </Button>
        </div>

        {/* Ad Unit */}
        <AdSenseUnit className="py-6" />

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-2 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <img
                  src="/assets/generated/exam-calendar-icon-transparent.dim_64x64.png"
                  alt="Calendar"
                  className="h-10 w-10"
                />
              </div>
              <CardTitle>Exam Scheduling</CardTitle>
              <CardDescription>
                Keep track of all your upcoming exams with dates, times, and subjects in one organized place
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg">
                <img
                  src="/assets/generated/progress-icon-transparent.dim_64x64.png"
                  alt="Progress"
                  className="h-10 w-10"
                />
              </div>
              <CardTitle>Study Progress</CardTitle>
              <CardDescription>
                Track your study topics and mark them as not started, in progress, or completed for each exam
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                <img
                  src="/assets/generated/achievement-icon-transparent.dim_64x64.png"
                  alt="Achievement"
                  className="h-10 w-10"
                />
              </div>
              <CardTitle>Performance Tracking</CardTitle>
              <CardDescription>
                Record exam scores and view your performance trends to identify areas for improvement
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Additional Features */}
        <div className="mt-12">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Why Choose ExamTracker?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                  <div>
                    <h3 className="font-semibold">Countdown Reminders</h3>
                    <p className="text-sm text-muted-foreground">
                      Never miss an exam with visual countdown timers
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                  <div>
                    <h3 className="font-semibold">Dashboard Overview</h3>
                    <p className="text-sm text-muted-foreground">
                      See all your stats at a glance with an intuitive dashboard
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                  <div>
                    <h3 className="font-semibold">Secure & Private</h3>
                    <p className="text-sm text-muted-foreground">
                      Your data is stored securely on the Internet Computer blockchain
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                  <div>
                    <h3 className="font-semibold">Easy to Use</h3>
                    <p className="text-sm text-muted-foreground">
                      Clean, intuitive interface designed for students
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Ad Unit */}
        <AdSenseUnit className="py-6" />
      </div>
    </div>
  );
}
