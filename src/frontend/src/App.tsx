import { Component, ReactNode } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useCurrentUserProfile';
import Layout from './components/Layout';
import ProfileSetupDialog from './components/ProfileSetupDialog';
import NotesFeed from './components/NotesFeed';
import Toasts from './components/Toasts';
import CornerWatermark from './components/CornerWatermark';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Star, Shield } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle>Something went wrong</CardTitle>
                <CardDescription>An unexpected error occurred</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {this.state.error?.message || 'Unknown error'}
                </p>
                <Button
                  onClick={() => {
                    this.setState({ hasError: false, error: null });
                    window.location.reload();
                  }}
                  className="w-full"
                >
                  Reload Page
                </Button>
              </CardContent>
            </Card>
          </div>
          <CornerWatermark />
        </>
      );
    }

    return this.props.children;
  }
}

function LoginScreen() {
  const { login, loginStatus } = useInternetIdentity();

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-4xl w-full space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <BookOpen className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">StudyNotes</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Collaborate with students from your college. Share study notes, mark important questions, and learn together.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Collaborate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Share notes with all students in real-time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Star className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Organize</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Star and pin important notes for quick access
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Secure</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Only you can edit or delete your own notes
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={login}
              disabled={loginStatus === 'logging-in'}
              className="gap-2 text-lg px-8"
            >
              {loginStatus === 'logging-in' ? 'Logging in...' : 'Get Started'}
            </Button>
          </div>
        </div>
      </div>
      <CornerWatermark />
    </>
  );
}

function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  // Show loading while initializing auth
  if (isInitializing) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <BookOpen className="h-12 w-12 text-primary mx-auto animate-pulse" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
        <CornerWatermark />
      </>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Show profile setup if authenticated but no profile
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <ErrorBoundary>
      <Layout>
        {showProfileSetup ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle>Welcome!</CardTitle>
                <CardDescription>Set up your profile to continue</CardDescription>
              </CardHeader>
            </Card>
          </div>
        ) : (
          <NotesFeed />
        )}
      </Layout>

      <ProfileSetupDialog
        open={showProfileSetup}
        onOpenChange={() => {}}
        initialProfile={null}
        isEditing={false}
      />

      <Toasts />
      <CornerWatermark />
    </ErrorBoundary>
  );
}

export default App;
