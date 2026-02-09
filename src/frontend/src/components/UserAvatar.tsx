import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { profilePhotoToUrl, revokeProfilePhotoUrl } from '../lib/profilePhoto';
import type { ProfilePhoto } from '../backend';

interface UserAvatarProps {
  photo?: ProfilePhoto;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function UserAvatar({ photo, name, size = 'md', className = '' }: UserAvatarProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (photo) {
      const url = profilePhotoToUrl(photo);
      setImageUrl(url);
      
      return () => {
        revokeProfilePhotoUrl(url);
      };
    } else {
      setImageUrl(null);
    }
  }, [photo]);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '';

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {imageUrl && <AvatarImage src={imageUrl} alt={name || 'User avatar'} />}
      <AvatarFallback className="bg-primary/10 text-primary">
        {initials || <User className={iconSizes[size]} />}
      </AvatarFallback>
    </Avatar>
  );
}
