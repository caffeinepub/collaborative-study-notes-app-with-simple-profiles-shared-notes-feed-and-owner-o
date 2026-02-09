import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteNote, useToggleStarPin } from '../hooks/useNotesMutations';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Star, Pin, MoreVertical, Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { normalizeError } from '../lib/errors';
import type { Note } from '../backend';

interface NoteActionsProps {
  note: Note;
  onEdit?: () => void;
  variant?: 'dropdown' | 'inline';
}

export default function NoteActions({ note, onEdit, variant = 'dropdown' }: NoteActionsProps) {
  const { identity } = useInternetIdentity();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const toggleStarPin = useToggleStarPin();
  const deleteNote = useDeleteNote();

  const isOwner = identity && note.owner.toString() === identity.getPrincipal().toString();

  const handleToggleStar = async () => {
    try {
      await toggleStarPin.mutateAsync({
        noteId: note.id,
        isStarred: !note.isStarred,
        isPinned: note.isPinned,
      });
      toast.success(note.isStarred ? 'Removed star' : 'Starred note');
    } catch (error) {
      toast.error(normalizeError(error));
    }
  };

  const handleTogglePin = async () => {
    try {
      await toggleStarPin.mutateAsync({
        noteId: note.id,
        isStarred: note.isStarred,
        isPinned: !note.isPinned,
      });
      toast.success(note.isPinned ? 'Unpinned note' : 'Pinned note');
    } catch (error) {
      toast.error(normalizeError(error));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteNote.mutateAsync(note.id);
      toast.success('Note deleted successfully');
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error(normalizeError(error));
    }
  };

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleStar}
          disabled={toggleStarPin.isPending}
          className="gap-1"
        >
          <Star className={`h-4 w-4 ${note.isStarred ? 'fill-primary text-primary' : ''}`} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleTogglePin}
          disabled={toggleStarPin.isPending}
          className="gap-1"
        >
          <Pin className={`h-4 w-4 ${note.isPinned ? 'fill-primary text-primary' : ''}`} />
        </Button>
        {isOwner && onEdit && (
          <>
            <Button variant="ghost" size="sm" onClick={onEdit} className="gap-1">
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="gap-1 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Note</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this note? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={deleteNote.isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {deleteNote.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleToggleStar} disabled={toggleStarPin.isPending}>
            <Star className={`mr-2 h-4 w-4 ${note.isStarred ? 'fill-primary text-primary' : ''}`} />
            {note.isStarred ? 'Unstar' : 'Star'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleTogglePin} disabled={toggleStarPin.isPending}>
            <Pin className={`mr-2 h-4 w-4 ${note.isPinned ? 'fill-primary text-primary' : ''}`} />
            {note.isPinned ? 'Unpin' : 'Pin'}
          </DropdownMenuItem>
          {isOwner && (
            <>
              <DropdownMenuSeparator />
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteNote.isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteNote.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
