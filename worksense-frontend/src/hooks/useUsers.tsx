import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/apiClient';
import { User } from '@/types/UserType';

export function useUsers() {
  return useQuery<User[], Error>({
    queryKey: ['users'],
    queryFn: async (): Promise<User[]> => {
      const response = await apiClient.get("/users");
      return response.data;
    },
  });
} 