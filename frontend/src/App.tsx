import { useEffect } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { useActorWithStatus } from './hooks/useActorWithStatus';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Loader2, Info } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import ProfileSetupModal from './components/ProfileSetupModal';
import LoginPrompt from './components/LoginPrompt';
import { getEnvironmentInfo } from './utils/canisterEnv';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { 
    actor, 
    isFetching: actorFetching, 
    isError: actorError, 
    error: actorErrorMessage, 
    retry: retryActor,
    retryCount,
    isRetrying
  } = useActorWithStatus();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Log environment info on mount for debugging
  useEffect(() => {
    const envInfo = getEnvironmentInfo();
    console.log('ExamTracker App - Environment Info:', envInfo);
  }, []);

  if (isInitializing) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground">Initializing authentication...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
        <Header />
        
        {/* Backend Connection Status */}
        {isAuthenticated && actorError && actorErrorMessage && (
          <div className="container mx-auto px-4 pt-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Backend Connection Error</AlertTitle>
              <AlertDescription className="mt-2 flex flex-col gap-2">
                <span>{actorErrorMessage.message}</span>
                {retryCount > 0 && (
                  <span className="text-sm opacity-80">
                    Retry attempts: {retryCount}
                  </span>
                )}
                <div className="mt-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={retryActor}
                    disabled={isRetrying}
                  >
                    {isRetrying ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-3 w-3" />
                        Retry Connection
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const envInfo = getEnvironmentInfo();
                      console.log('Environment Debug Info:', envInfo);
                      alert(JSON.stringify(envInfo, null, 2));
                    }}
                  >
                    <Info className="mr-2 h-3 w-3" />
                    Debug Info
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {isAuthenticated && (actorFetching || isRetrying) && !actor && (
          <div className="container mx-auto px-4 pt-4">
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription className="flex items-center">
                <span className="ml-2">
                  {isRetrying 
                    ? `Reconnecting to backend (attempt ${retryCount + 1})...` 
                    : 'Connecting to backend...'}
                </span>
              </AlertDescription>
            </Alert>
          </div>
        )}

        <main className="flex-1">
          {!isAuthenticated ? (
            <LoginPrompt />
          ) : (
            <Dashboard />
          )}
        </main>

        <Footer />
        {showProfileSetup && <ProfileSetupModal />}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
