import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, Star, Rocket } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Award,
  Star,
  Rocket,
};

interface Badge {
  icon: string;
  name: string;
  points: number;
}

interface BadgesModalProps {
  badges: Badge[];
}

const BadgesModal: React.FC<BadgesModalProps> = ({ badges }) => {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Award className="w-4 h-4"/>
          View Badges
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Your Badges</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Select
              onValueChange={(value) => {
                const badge = badges.find((b) => b.name === value);
                setSelectedBadge(badge || null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a badge" />
              </SelectTrigger>
              <SelectContent>
                {badges.map((badge, index) => (
                  <SelectItem key={index} value={badge.name}>
                    <div className="flex items-center gap-2">
                      {React.createElement(iconMap[badge.icon] || Award, {
                        className: "w-4 h-4 text-[var(--accent-pink)]"
                      })}
                      {badge.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedBadge && (
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-center">
                <div className="bg-[var(--accent-pink-light)] rounded-full p-4">
                  {React.createElement(iconMap[selectedBadge.icon] || Award, {
                    className: "w-8 h-8 text-[var(--accent-pink)]"
                  })}
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg">{selectedBadge.name}</h3>
                <p className="text-sm font-medium text-[var(--accent-pink)]">
                  +{selectedBadge.points} points
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BadgesModal; 