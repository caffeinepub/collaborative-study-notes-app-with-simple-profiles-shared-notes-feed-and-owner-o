import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Pin } from 'lucide-react';
import LikeButton from './LikeButton';
import UserAvatar from './UserAvatar';
import { usePublicUserProfile } from '../hooks/usePublicUserProfile';
import type { Note } from '../backend';

interface NoteCardProps {
  note: Note;
  onClick: () => void;
}

export default function NoteCard({ note, onClick }: NoteCardProps) {
  const { data: authorProfile } = usePublicUserProfile(note.owner);

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="font-semibold">
              Q{note.questionNo}
            </Badge>
            {note.year && (
              <Badge variant="outline" className="text-xs">
                {note.year}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {note.isStarred && <Star className="h-4 w-4 fill-primary text-primary" />}
            {note.isPinned && <Pin className="h-4 w-4 fill-primary text-primary" />}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {note.questionText && (
          <p className="text-sm font-medium text-foreground/90">
            {truncateText(note.questionText, 100)}
          </p>
        )}
        <p className="text-sm text-muted-foreground line-clamp-3">
          {truncateText(note.answer, 150)}
        </p>
        <div className="flex items-center justify-between gap-2 pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <UserAvatar 
              photo={authorProfile?.photo}
              name={note.author}
              size="sm"
            />
            <span className="font-medium">{note.author}</span>
            <span>•</span>
            <span>{note.college}</span>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <LikeButton noteId={note.id} likeCount={note.likeCount} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
