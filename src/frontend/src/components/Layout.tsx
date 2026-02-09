import { ReactNode, useState } from 'react';
import LoginButton from './LoginButton';
import ProfileSetupDialog from './ProfileSetupDialog';
import SidebarDrawer from './SidebarDrawer';
import { useGetCallerUserProfile } from '../hooks/useCurrentUserProfile';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { BookOpen, User } from 'lucide-react';
import { SiCoffeescript } from 'react-icons/si';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  
  const isAuthenticated = !!identity;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <SidebarDrawer />
            <BookOpen className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">StudyNotes</h1>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && userProfile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProfileEdit(true)}
                className="gap-2"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{userProfile.name}</span>
              </Button>
            )}
            <LoginButton />
          </div>
        </div>
      </header>
      
      <main className="flex-1 container py-4 md:py-6">
        {children}
      </main>
      
      <footer className="border-t py-4 mt-auto">
        <div className="container text-center text-sm text-muted-foreground">
          © 2026. Built with <SiCoffeescript className="inline h-4 w-4 text-primary" /> using{' '}
          <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
            caffeine.ai
          </a>
        </div>
      </footer>

      {isAuthenticated && userProfile && (
        <ProfileSetupDialog
          open={showProfileEdit}
          onOpenChange={setShowProfileEdit}
          initialProfile={userProfile}
          isEditing
        />
      )}
    </div>
  );
}
