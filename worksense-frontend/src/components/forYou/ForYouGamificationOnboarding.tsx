import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const AVATAR_CHOICES = [
  '/avatars/avatar1.png',
  '/avatars/avatar2.png',
  '/avatars/avatar3.png',
  '/avatars/avatar4.png',
];

interface ForYouGamificationOnboardingProps {
  open: boolean;
  onComplete: (data: { profilePicture: string; personalPhrase: string }) => void;
}

const ForYouGamificationOnboarding: React.FC<ForYouGamificationOnboardingProps> = ({ open, onComplete }) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [personalPhrase, setPersonalPhrase] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      onComplete({ profilePicture: selectedAvatar, personalPhrase });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome! Set up your profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-2">
          <div>
            <div className="mb-2 font-medium">Choose your avatar:</div>
            <div className="flex gap-4">
              {AVATAR_CHOICES.map((avatar) => (
                <button
                  type="button"
                  key={avatar}
                  className={`rounded-full border-2 p-1 transition-all ${selectedAvatar === avatar ? 'border-[var(--accent-pink)] scale-110' : 'border-transparent'}`}
                  onClick={() => setSelectedAvatar(avatar)}
                  aria-label="Select avatar"
                >
                  <img src={avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
                </button>
              ))}
            </div>
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