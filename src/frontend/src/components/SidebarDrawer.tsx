import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Menu, Moon, Users } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import UserDirectoryDialog from './UserDirectoryDialog';

export default function SidebarDrawer() {
  const { isDark, toggleTheme } = useTheme();
  const [userDirectoryOpen, setUserDirectoryOpen] = useState(false);

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] sm:w-[320px]">
          <SheetHeader>
            <SheetTitle>Settings</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="night-mode" className="cursor-pointer">
                  Night mode
                </Label>
              </div>
              <Switch
                id="night-mode"
                checked={isDark}
                onCheckedChange={toggleTheme}
              />
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => setUserDirectoryOpen(true)}
              >
                <Users className="h-4 w-4" />
                User Directory
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <UserDirectoryDialog
        open={userDirectoryOpen}
        onOpenChange={setUserDirectoryOpen}
      />
    </>
  );
}
