import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSaveCallerUserProfile } from '../hooks/useCurrentUserProfile';
import { normalizeError } from '../lib/errors';
import { Loader2 } from 'lucide-react';
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
  const [errors, setErrors] = useState<{ name?: string; college?: string }>({});
  
  const saveProfile = useSaveCallerUserProfile();

  useEffect(() => {
    if (initialProfile) {
      setName(initialProfile.name);
      setCollege(initialProfile.college);
    }
  }, [initialProfile]);

  const validate = () => {
    const newErrors: { name?: string; college?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!college.trim()) {
      newErrors.college = 'College name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    try {
      await saveProfile.mutateAsync({ name: name.trim(), college: college.trim() });
      onOpenChange(false);
      setErrors({});
    } catch (error) {
      setErrors({ name: normalizeError(error) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={isEditing ? onOpenChange : undefined}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => !isEditing && e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Profile' : 'Welcome! Set up your profile'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update your name and college information.' : 'Enter your name and college to get started.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={saveProfile.isPending}>
              {saveProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Continue'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
