import { Story } from "@/types/StoryType";
import ActionMenu from "@/components/BacklogTable/ActionMenu";
import { Ticket } from "@/types/TicketType";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import TicketRow from "./TicketRow";
import { FaBookOpen } from "react-icons/fa"

interface StoryRowProps {
    story: Story,
    storyTickets: Ticket[],
    handleView: (type: "epic" | "story" | "ticket", itemId: string) => void;
    handleDelete: (type: "epic" | "story" | "ticket", itemId: string) => void;
}

const StoryRow: React.FC<StoryRowProps> = ({ story, storyTickets, handleView, handleDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const renderTickets = (tickets:Ticket[]) => tickets.map(ticket => {
        return (
            <TicketRow
                ticket={ticket}
                handleView={handleView}
                handleDelete={handleDelete}/>
        )
    })
    return (
        <>
        <tr className="bg-white border-b hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <div className="flex items-center gap-2">
                    <span className="hover:underline hover:cursor-pointer flex gap-2" onClick={() => handleView("story", story.id)}>
                        <FaBookOpen color="green" />
                        {story.name}
                    </span>

                    {storyTickets && storyTickets.length > 0 && (
                        <span
                            className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold bg-[var(--accent-pink)] text-white rounded-full"
                            title={`${storyTickets.length} ${storyTickets.length === 1 ? "ticket" : "tickets"}`} // Add a title for accessibility/hover info
                        >{storyTickets.length}
                        </span>
                    )}

                    {storyTickets && storyTickets.length > 0 && (
                        <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="ml-1 p-1 hover:bg-gray-200 rounded flex items-center justify-center"
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                    >
                        {isExpanded ? (
                            <ChevronDown size={16} className="text-gray-700"/>
                        ) : (
                            <ChevronRight size={16} className="text-gray-700"/>
                        )}
                    </button>
                    )}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {story.description || "No description provided"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                Assigned User
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {story.status}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {story.storyPoints}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <ActionMenu
                    onEdit={() => console.log("Edit story")}
                    onDelete={() => handleDelete("story", story.id)}
                    onViewDetails={() => console.log("View story details")}
                    onGenerateStories={() => console.log("Generate stories for story")}
                />
            </td>
        </tr>
        {isExpanded && renderTickets(storyTickets)}
        </>
    );
}

export default StoryRow;