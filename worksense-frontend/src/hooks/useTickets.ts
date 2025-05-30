import { useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { endpoints } from "@/lib/constants/endpoints"; // Ensure path is correct
import { Ticket } from "@/types/TicketType";       // Ensure path is correct
import apiClient from "@/api/apiClient";           // Import your apiClient

// Interface for the hook's return value for better clarity and type safety
type UseTicketsReturn = UseQueryResult<Ticket[], Error> & {
    addTicket: (ticketData: Omit<Ticket, "id" | "projectId">) => Promise<Ticket>; // Assuming API returns the created ticket
    updateTicket: (ticketData: Ticket) => Promise<Ticket>; // Assuming API returns the updated ticket
    deleteTicket: (ticketId: string) => Promise<void>;
};

export const useTickets = (projectId: string): UseTicketsReturn => {
    const queryClient = useQueryClient();

    // Define the query key consistently
    const ticketsQueryKey: ["tickets", string] = ["tickets", projectId];

    const query = useQuery<Ticket[], Error, Ticket[], ["tickets", string]>({
        queryKey: ticketsQueryKey,
        queryFn: async () => {
            if (!projectId) {
                // Or throw an error, or return an empty array, depending on desired behavior
                // This check is mostly covered by 'enabled' but good for explicitness if enabled is removed
                return [];
            }
            // apiClient.get will throw for non-2xx responses
            const response = await apiClient.get<Ticket[]>(endpoints.getTickets(projectId));
            return response.data; // Axios response.data is already parsed JSON
        },
        enabled: !!projectId, // Only run the query if projectId is a truthy value
    });

    const addTicket = async (ticketData: Omit<Ticket, "id" | "projectId">): Promise<Ticket> => {
        try {
            // apiClient.post handles JSON.stringify and Content-Type header
            const response = await apiClient.post<Ticket>(
                endpoints.createTicket(projectId),
                ticketData // Pass the ticket data directly as the body
            );

            // Invalidate the query for this project's tickets to refetch fresh data
            // This ensures the list updates with the new ticket
            queryClient.invalidateQueries({ queryKey: ticketsQueryKey });

            return response.data; // Assuming your API returns the created ticket
        } catch (error) {
            console.error("Failed to create ticket:", error);
            // Re-throw error to be handled by the calling component or React Query's error state
            throw error;
        }
    };

    const updateTicket = async (ticketData: Ticket): Promise<Ticket> => {
        try {
            // apiClient.put handles JSON.stringify and Content-Type header
            const response = await apiClient.put<Ticket>(
                endpoints.updateTicket(projectId, ticketData.id),
                ticketData // Pass the full ticket data for update
            );

            // Invalidate the query to refetch.
            // For a more advanced UX, you could optimistically update the cache here:
            // queryClient.setQueryData(ticketsQueryKey, (oldData?: Ticket[]) =>
            //   oldData?.map(t => t.id === ticketData.id ? response.data : t) ?? []
            // );
            // And then invalidate if you want to ensure consistency, or only on error.
            queryClient.invalidateQueries({ queryKey: ticketsQueryKey });

            return response.data; // Assuming your API returns the updated ticket
        } catch (error) {
            console.error("Failed to update ticket:", error);
            throw error;
        }
    };

    const deleteTicket = async (ticketId: string): Promise<void> => {
        try {
            await apiClient.delete(endpoints.deleteTicket(projectId, ticketId));

            // Invalidate the query.
            // For optimistic updates, you could remove it from cache:
            // queryClient.setQueryData(ticketsQueryKey, (oldData?: Ticket[]) =>
            //   oldData?.filter(t => t.id !== ticketId) ?? []
            // );
            queryClient.invalidateQueries({ queryKey: ticketsQueryKey });
        } catch (error) {
            console.error("Failed to delete ticket:", error);
            throw error;
        }
    };

    return {
        ...query,
        addTicket,
        updateTicket,
        deleteTicket
    };
};