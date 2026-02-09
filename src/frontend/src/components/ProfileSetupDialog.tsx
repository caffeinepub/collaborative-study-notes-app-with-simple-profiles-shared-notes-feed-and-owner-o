import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSaveCallerUserProfile } from '../hooks/useCurrentUserProfile';
import { useUploadProfilePhoto, useRemoveProfilePhoto } from '../hooks/useProfilePhotoMutations';
import { normalizeError } from '../lib/errors';
import { fileToProfilePhoto, validateImageFile, profilePhotoToUrl, revokeProfilePhotoUrl } from '../lib/profilePhoto';
import { Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import UserAvatar from './UserAvatar';
import type { UserProfile } from '../backend';

interface ProfileSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialProfile?: UserProfile | null;
  isEditing?: boolean;
}

export default function ProfileSetupDialog({ open, onOpenChange, initialProfile, isEditing = false }: ProfileSetupDialogProps) {
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; college?: string; photo?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const saveProfile = useSaveCallerUserProfile();
  const uploadPhoto = useUploadProfilePhoto();
  const removePhoto = useRemoveProfilePhoto();

  useEffect(() => {
    if (initialProfile) {
      setName(initialProfile.name);
      setCollege(initialProfile.college);
      
      // Set preview for existing photo
      if (initialProfile.photo) {
        const url = profilePhotoToUrl(initialProfile.photo);
        setPhotoPreviewUrl(url);
        return () => revokeProfilePhotoUrl(url);
      }
    }
  }, [initialProfile]);

  useEffect(() => {
    // Cleanup preview URL when component unmounts or file changes
    return () => {
      if (photoPreviewUrl && photoPreviewUrl.startsWith('blob:')) {
        revokeProfilePhotoUrl(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  const validate = () => {
    const newErrors: { name?: string; college?: string; photo?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!college.trim()) {
      newErrors.college = 'College name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrors({ ...errors, photo: validation.error });
      toast.error(validation.error || 'Invalid image file');
      return;
    }

    setErrors({ ...errors, photo: undefined });
    setPhotoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      if (photoPreviewUrl && photoPreviewUrl.startsWith('blob:')) {
        revokeProfilePhotoUrl(photoPreviewUrl);
      }
      setPhotoPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    if (initialProfile?.photo && !photoFile) {
      // Remove existing photo from backend
      try {
        await removePhoto.mutateAsync();
        toast.success('Profile photo removed');
      } catch (error) {
        toast.error(normalizeError(error));
        return;
      }
    }
    
    // Clear local state
    setPhotoFile(null);
    if (photoPreviewUrl && photoPreviewUrl.startsWith('blob:')) {
      revokeProfilePhotoUrl(photoPreviewUrl);
    }
    setPhotoPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    try {
      // First save the profile (name + college)
      const profileData: UserProfile = {
        name: name.trim(),
        college: college.trim(),
        photo: initialProfile?.photo, // Keep existing photo if any
      };
      
      await saveProfile.mutateAsync(profileData);

      // Then upload new photo if selected
      if (photoFile) {
        const photoData = await fileToProfilePhoto(photoFile);
        await uploadPhoto.mutateAsync(photoData);
        toast.success('Profile updated with photo');
      } else {
        toast.success('Profile updated');
      }

      onOpenChange(false);
      setErrors({});
      setPhotoFile(null);
    } catch (error) {
      const errorMsg = normalizeError(error);
      setErrors({ name: errorMsg });
      toast.error(errorMsg);
    }
  };

  const isPending = saveProfile.isPending || uploadPhoto.isPending || removePhoto.isPending;
  const hasPhoto = photoPreviewUrl || initialProfile?.photo;

  return (
    <Dialog open={open} onOpenChange={isEditing ? onOpenChange : undefined}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => !isEditing && e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Profile' : 'Welcome! Set up your profile'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update your profile information and photo.' : 'Enter your details to get started.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Profile Photo Section */}
            <div className="grid gap-2">
              <Label>Profile Photo</Label>
              <div className="flex items-center gap-4">
                <UserAvatar 
                  photo={initialProfile?.photo}
                  name={name}
                  size="lg"
                />
                <div className="flex-1 space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handlePhotoSelect}
                    className="hidden"
                    id="photo-upload"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isPending}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {hasPhoto ? 'Change' : 'Upload'}
                    </Button>
                    {hasPhoto && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemovePhoto}
                        disabled={isPending}
                        className="gap-2"
                      >
                        <X className="h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, GIF or WebP. Max 5MB.
                  </p>
                </div>
              </div>
              {errors.photo && <p className="text-sm text-destructive">{errors.photo}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="college">College</Label>
              <Input
                id="college"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="Your college name"
                className={errors.college ? 'border-destructive' : ''}
              />
              {errors.college && <p className="text-sm text-destructive">{errors.college}</p>}
            </div>
          </div>
          <DialogFooter>
            {isEditing && (
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Continue'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
