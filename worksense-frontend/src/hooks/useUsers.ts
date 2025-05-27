import { useQuery, useQueryClient } from '@tanstack/react-query';
import { User } from '@/types/UserType';
import { endpoints } from '@/lib/constants/endpoints';

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch(endpoints.getUsers());
      const res = await response.json();
      return res as User[];
    }
  });
}

export const useUser = (userId: string) => {
  const queryClient = useQueryClient();

  const query = useQuery<User, Error>({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await fetch(endpoints.getUser(userId));
      return response.json()
    }
  });

  const updateLocalData = (updater: (oldData: User | undefined) => User) => {
    queryClient.setQueryData(["user", userId], updater);
  };

  const updateUser = async (updates: Partial<User>) => {
    try {
      const response = await fetch(endpoints.updateUser(userId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const updatedUser = await response.json();
      
      // Actualizar la caché con los nuevos datos
      queryClient.setQueryData(["user", userId], updatedUser);
      
      // Invalidar todas las consultas relacionadas con el usuario
      await queryClient.invalidateQueries({
        queryKey: ["user", userId]
      });
      
      // Invalidar también la lista de usuarios si existe
      await queryClient.invalidateQueries({
        queryKey: ["users"]
      });

      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  return {
    ...query,
    updateLocalData,
    updateUser
  };
}