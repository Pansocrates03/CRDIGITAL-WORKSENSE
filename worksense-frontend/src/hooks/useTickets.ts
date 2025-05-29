import { useQuery, useQueryClient } from "@tanstack/react-query";
import { endpoints } from "@/lib/constants/endpoints";
import { Ticket } from "@/types/TicketType";

export const useTickets = (projectId: string) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["tickets", projectId],
        queryFn: async () => {
            const response = await fetch(endpoints.getTickets(projectId));
            if (!response.ok) {
                throw new Error('Failed to fetch tickets');
            }
            const data = await response.json();
            return data as Ticket[];
        },
    });

    const addTicket = async (ticket:Omit<Ticket, "id">) => {
        const response = await fetch(endpoints.createTicket(projectId), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ticket),
        });
        if (!response.ok) {
            throw new Error('Failed to create ticket');
        }
        queryClient.invalidateQueries({ queryKey: ["tickets"] });
    };

    const updateTicket = async (ticket:Ticket) => {
        const response = await fetch(endpoints.updateTicket(projectId,ticket.id), {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ticket),
        })
        if (!response.ok) {
            throw new Error('Failed to update ticket');
        }
        queryClient.invalidateQueries({ queryKey: ["tickets"] });
    }

    const deleteTicket = async (ticketId:string) => {
        const response = await fetch(endpoints.deleteTicket(projectId, ticketId), {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete ticket');
        }
        queryClient.invalidateQueries({ queryKey: ["tickets"] });
    };

    return {
        ...query,
        addTicket,
        updateTicket,
        deleteTicket
    };
};