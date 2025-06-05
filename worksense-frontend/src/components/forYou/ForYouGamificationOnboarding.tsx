import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { AvatarPicker } from '@/components/Account/AvatarPicker';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth';


interface ForYouGamificationOnboardingProps {
  open: boolean;
  onComplete: (data: { profilePicture: string; personalPhrase: string }) => void;
  onClose: () => void;
  initialPhrase?: string;
}

const ForYouGamificationOnboarding: React.FC<ForYouGamificationOnboardingProps> = ({ open, onComplete, onClose, initialPhrase }) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [personalPhrase, setPersonalPhrase] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { save } = useUserProfile();
  const { setUser } = useAuth();

  // Reset fields when popup is opened
  React.useEffect(() => {
    if (open) {
      setPersonalPhrase(initialPhrase || '');
      setSelectedAvatar('');
    }
  }, [open, initialPhrase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAvatar) {
      toast.error('Please select an avatar.');
      return;
    }
    if (!personalPhrase.trim()) {
      toast.error('Please enter a personal phrase.');
      return;
    }
    if (personalPhrase.length > 100) {
      toast.error('Personal phrase must be 100 characters or less.');
      return;
    }
    setSubmitting(true);
    try {
      await save({ pfp: selectedAvatar });
      onComplete({ profilePicture: selectedAvatar, personalPhrase });
      setUser(user => {
        const updatedUser = user ? { ...user, avatar: selectedAvatar } : user;
        if (updatedUser) {
          authService.updateUserInStorage(updatedUser);
        }
        return updatedUser;
      });
      toast.success('Profile updated!');
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-md" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle>Welcome! Set up your profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-2">
          <div>
            <div className="mb-2 font-medium">Choose your avatar:</div>
            {selectedAvatar && (
              <div className="flex flex-col items-center mb-4">
                <Avatar className="size-20 mb-2">
                  <AvatarImage src={selectedAvatar} alt="Selected Avatar" />
                </Avatar>
                <span className="text-xs text-muted-foreground">Currently selected</span>
              </div>
            )}
            <AvatarPicker onSelect={setSelectedAvatar} />
          </div>
          <div>
            <div className="mb-2 font-medium">Personal phrase:</div>
            <Input
              value={personalPhrase}
              onChange={e => setPersonalPhrase(e.target.value)}
              maxLength={100}
              placeholder="E.g. 'Keep moving forward!'"
              disabled={submitting}
            />
            <div className="text-xs text-muted-foreground mt-1">Max 100 characters</div>
          </div>
          <Button type="submit" disabled={submitting} className="mt-2">Save and Continue</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ForYouGamificationOnboarding; 