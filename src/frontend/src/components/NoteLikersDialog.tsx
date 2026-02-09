import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Users } from 'lucide-react';
import UserAvatar from './UserAvatar';
import { useGetNoteLikers } from '../hooks/useNoteLikers';
import { usePublicUserProfile } from '../hooks/usePublicUserProfile';
import { LoadingState, EmptyState, ErrorState } from './Feedback';
import { normalizeError } from '../lib/errors';
import { useState } from 'react';

interface NoteLikersDialogProps {
  noteId: bigint;
  likeCount: bigint;
}

function LikerRow({ principal, name, college }: { principal: string; name: string; college: string }) {
  const { data: profile } = usePublicUserProfile(principal);
  
  return (
    <div className="flex items-center gap-3">
      <UserAvatar 
        photo={profile?.photo}
        name={name}
        size="sm"
      />
      <div className="flex flex-col gap-1">
        <p className="font-medium">{name}</p>
        <p className="text-sm text-muted-foreground">{college}</p>
      </div>
    </div>
  );
}

export default function NoteLikersDialog({ noteId, likeCount }: NoteLikersDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: likers, isLoading, error, refetch } = useGetNoteLikers(open ? noteId : null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
          <Users className="h-4 w-4" />
          <span className="text-sm">{Number(likeCount)} {Number(likeCount) === 1 ? 'like' : 'likes'}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Liked by</DialogTitle>
        </DialogHeader>

        {isLoading && <LoadingState message="Loading likers..." />}

        {error && (
          <ErrorState
            message={normalizeError(error)}
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !error && likers && likers.length === 0 && (
          <EmptyState
            title="No likes yet"
            description="Be the first to like this note!"
          />
        )}

        {!isLoading && !error && likers && likers.length > 0 && (
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-3">
              {likers.map((liker, index) => (
                <div key={liker.principal.toString()}>
                  {index > 0 && <Separator className="mb-3" />}
                  <LikerRow 
                    principal={liker.principal.toString()}
                    name={liker.name}
                    college={liker.college}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
