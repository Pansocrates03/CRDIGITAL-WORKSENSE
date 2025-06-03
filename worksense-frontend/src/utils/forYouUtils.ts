// Utility functions for For You page

export function getInitials(name: string) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function getStandingMessage (rank: number) {
    if (rank === 1) return "Congratulations! You're leading the board! 🏆";
    if (rank === 2) return "Great job! You're in 2nd place—keep pushing for the top!";
    if (rank === 3) return "Nice work! You're in 3rd place—aim higher!";
    return "Keep going! Every contribution counts.";
  };
  