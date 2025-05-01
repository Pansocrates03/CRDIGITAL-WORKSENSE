import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth';

export function useAuth() {
  return useQuery({
    queryKey: ['auth'],
    queryFn: () => {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }
      return user;
    },
  });
} 