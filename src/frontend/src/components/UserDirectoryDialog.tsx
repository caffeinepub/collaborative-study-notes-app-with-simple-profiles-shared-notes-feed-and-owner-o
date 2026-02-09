import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Users } from 'lucide-react';
import { useUserDirectory } from '../hooks/useUserDirectory';
import { LoadingState, EmptyState, ErrorState } from './Feedback';
import UserAvatar from './UserAvatar';
import { normalizeError } from '../lib/errors';

interface UserDirectoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserDirectoryDialog({ open, onOpenChange }: UserDirectoryDialogProps) {
  const { data: users, isLoading, error, refetch, isFetched } = useUserDirectory();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users?.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.college.toLowerCase().includes(query)
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Directory
          </DialogTitle>
          <DialogDescription>
            Browse all registered users in the community
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or college..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <ScrollArea className="flex-1 -mx-6 px-6">
          {isLoading && <LoadingState message="Loading users..." />}

          {error && (
            <ErrorState
              title="Failed to load users"
              message={normalizeError(error)}
              onRetry={() => refetch()}
            />
          )}

          {!isLoading && !error && isFetched && filteredUsers && filteredUsers.length === 0 && (
            <EmptyState
              title={searchQuery ? 'No users found' : 'No users yet'}
              description={
                searchQuery
                  ? 'Try adjusting your search terms'
                  : 'Be the first to join the community'
              }
            />
          )}

          {!isLoading && !error && filteredUsers && filteredUsers.length > 0 && (
            <div className="space-y-3 py-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.principal.toString()}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <UserAvatar photo={user.photo} name={user.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.college}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {!isLoading && !error && filteredUsers && filteredUsers.length > 0 && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
