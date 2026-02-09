import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useLikedNotes } from '../hooks/useLikedNotes';
import { useLikeNote } from '../hooks/useNotesMutations';
import { normalizeError } from '../lib/errors';
import { toast } from 'sonner';

interface LikeButtonProps {
  noteId: bigint;
  likeCount: bigint;
}

export default function LikeButton({ noteId, likeCount }: LikeButtonProps) {
  const { hasLiked, markAsLiked } = useLikedNotes();
  const likeMutation = useLikeNote();

  const isLiked = hasLiked(noteId);
  const isLoading = likeMutation.isPending;

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isLiked) {
      toast.error('You have already liked this note');
      return;
    }

    try {
      await likeMutation.mutateAsync(noteId);
      markAsLiked(noteId);
      toast.success('Note liked!');
    } catch (error) {
      toast.error(normalizeError(error));
    }
  };

  return (
    <Button
      variant={isLiked ? 'default' : 'outline'}
      size="sm"
      onClick={handleLike}
      disabled={isLoading || isLiked}
      className="gap-2"
    >
      <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
      <span>{Number(likeCount)}</span>
    </Button>
  );
}
