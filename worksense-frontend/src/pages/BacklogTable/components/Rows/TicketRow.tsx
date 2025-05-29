import ActionMenu from "@/components/BacklogTable/ActionMenu";
import { Ticket } from "@/types/TicketType";
import { FaTicketAlt } from "react-icons/fa"
import { FC } from "react";

interface TicketRowProps {
    ticket: Ticket;
    handleView: (type: "epic" | "story" | "ticket", itemId: string) => void;
    handleDelete: (type: "epic" | "story" | "ticket", itemId: string) => void;
}

const TicketRow: FC<TicketRowProps> = ({
    ticket,
    handleView,
    handleDelete
}) => {

    return (
        <tr className="bg-white border-b hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <div className="flex items-center gap-2">
                    <span className="hover:underline hover:cursor-pointer flex gap-2" onClick={() => handleView("ticket", ticket.id)}>
                        <FaTicketAlt color="blue" />
                        {ticket.name}
                    </span>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {ticket.description || "No description provided"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                Assigned User
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {ticket.status}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                -
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <ActionMenu
                    onEdit={() => console.log("Edit story")}
                    onDelete={() => handleDelete("ticket", ticket.id)}
                    onViewDetails={() => console.log("View story details")}
                    onGenerateStories={() => console.log("Generate stories for story")}
                />
            </td>
        </tr>
    );
}

export default TicketRow;