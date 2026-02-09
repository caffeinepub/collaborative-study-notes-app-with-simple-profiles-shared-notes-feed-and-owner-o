import UserAvatar from './UserAvatar';
import { usePublicUserProfile } from '../hooks/usePublicUserProfile';
import type { Principal } from '@dfinity/principal';

interface CommentWithAvatarProps {
  commenterPrincipal: Principal;
  commenterName: string;
  commenterCollege: string;
  content: string;
}

export default function CommentWithAvatar({
  commenterPrincipal,
  commenterName,
  commenterCollege,
  content,
}: CommentWithAvatarProps) {
  const { data: commenterProfile } = usePublicUserProfile(commenterPrincipal);

  return (
    <div className="flex gap-3">
      <UserAvatar 
        photo={commenterProfile?.photo}
        name={commenterName}
        size="sm"
      />
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{commenterName}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">{commenterCollege}</span>
        </div>
        <p className="text-sm">{content}</p>
      </div>
    </div>
  );
}
