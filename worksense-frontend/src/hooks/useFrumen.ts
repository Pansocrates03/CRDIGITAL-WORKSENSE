import { useQuery } from '@tanstack/react-query';
import { getFrumen } from '../services/frumenServices';

export const useFrumen = (projectId: string, sprintId: string) => {
  return useQuery({
    queryKey: ['frumen', projectId, sprintId],
    queryFn: () => getFrumen(projectId, sprintId),
  });
};
