// Assuming this is in a file like src/hooks/useUserData.ts or similar

import { useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { User } from '@/types/UserType'; // Make sure this path is correct
import { endpoints } from '@/lib/constants/endpoints'; // Make sure this path is correct
import apiClient from "@/api/apiClient"; // Make sure this path is correct

// Hook to fetch all users
export const useUsers = (): UseQueryResult<User[], Error> => {
  return useQuery<User[], Error, User[], ["users"]>({ // Explicitly typing queryKey
    queryKey: ["users"],
    queryFn: async () => {
      // Use apiClient.get and expect an array of Users
      const response = await apiClient.get<User[]>(endpoints.getUsers());
      return response.data; // Axios response.data is already parsed JSON
    },
  });
};

// Interface for the return type of useUser for better clarity
type UseUserReturn = UseQueryResult<User, Error> & {
  updateLocalData: (updater: (oldData: User | undefined) => User) => void;
  updateUser: (updates: Partial<User>) => Promise<User>;
};

// Hook to fetch and manage a single user
export const useUser = (userId: string): UseUserReturn => {
  const queryClient = useQueryClient();

  const query = useQuery<User, Error, User, ["user", string]>({ // Explicitly typing queryKey
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await apiClient.get<User>(endpoints.getUser(userId));
      console.log("useUser fetched data:", response.data);
      return response.data; // Axios response.data is already parsed JSON
    },
  });

  const updateLocalData = (updater: (oldData: User | undefined) => User) => {
    queryClient.setQueryData(["user", userId], updater);
  };

  const updateUser = async (updates: Partial<User>): Promise<User> => {
    try {
      const response = await apiClient.put<User>(endpoints.updateUser(userId), updates);

      const updatedUser = response.data; // Axios response.data is already parsed JSON

      queryClient.setQueryData(["user", userId], updatedUser);

      await queryClient.invalidateQueries({ queryKey: ["user", userId] });
      await queryClient.invalidateQueries({ queryKey: ["users"] }); // Invalidate the list of users as well

      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error; // Re-throw to allow the caller to handle it
    }
  };

  return {
    ...query,
    updateLocalData,
    updateUser,
  };
};