import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import NoteActions from './NoteActions';
import LikeButton from './LikeButton';
import NoteLikersDialog from './NoteLikersDialog';
import UserAvatar from './UserAvatar';
import { LoadingState, ErrorState } from './Feedback';
import { useGetNote } from '../hooks/useNotes';
import { usePublicUserProfile } from '../hooks/usePublicUserProfile';
import { normalizeError } from '../lib/errors';
import type { Note } from '../backend';

interface NoteReaderSheetProps {
  noteId: bigint | null;
  onClose: () => void;
  onEdit: (note: Note) => void;
}

export default function NoteReaderSheet({ noteId, onClose, onEdit }: NoteReaderSheetProps) {
  const { data: note, isLoading, error, refetch } = useGetNote(noteId);
  const { data: authorProfile } = usePublicUserProfile(note?.owner || null);

  const open = noteId !== null;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        {isLoading && <LoadingState message="Loading note..." />}
        
        {error && (
          <ErrorState
            message={normalizeError(error)}
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !error && !note && (
          <ErrorState
            title="Note Not Found"
            message="This note could not be found. It may have been deleted."
          />
        )}

        {note && (
          <>
            <SheetHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <SheetTitle className="text-2xl">Question {note.questionNo}</SheetTitle>
                  <SheetDescription className="mt-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <UserAvatar 
                        photo={authorProfile?.photo}
                        name={note.author}
                        size="sm"
                      />
                      <span className="font-medium text-foreground">{note.author}</span>
                      <span>•</span>
                      <span>{note.college}</span>
                      {note.year && (
                        <>
                          <span>•</span>
                          <Badge variant="outline">{note.year}</Badge>
                        </>
                      )}
                    </div>
                  </SheetDescription>
                </div>
                <NoteActions note={note} onEdit={() => onEdit(note)} variant="inline" />
              </div>
            </SheetHeader>

            <div className="flex items-center gap-2 mt-4">
              <LikeButton noteId={note.id} likeCount={note.likeCount} />
              <NoteLikersDialog noteId={note.id} likeCount={note.likeCount} />
            </div>

            <Separator className="my-4" />

            <ScrollArea className="h-[calc(100vh-14rem)] pr-4">
              <div className="space-y-4">
                {note.questionText && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Question</h3>
                    <p className="text-base whitespace-pre-wrap">{note.questionText}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Answer / Notes</h3>
                  <p className="text-base whitespace-pre-wrap leading-relaxed">{note.answer}</p>
                </div>
              </div>
            </ScrollArea>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
