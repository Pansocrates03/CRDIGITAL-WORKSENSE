import ActionMenu from "@/components/BacklogTable/ActionMenu";
import { Epic } from "@/types/EpicType";
import { FaCrown } from "react-icons/fa"
import { Story } from "@/types/StoryType";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import StoryRow from "./StoryRow";
import { Ticket } from "@/types/TicketType";

interface EpicRowProps {
    epic: Epic,
    epicStories: Story[],
    handleView: (type:"epic"|"story"|"ticket", itemId:string) => void;
    getStoryTickets: (storyId:string) => Ticket[];
    handleViewTicketDetails: () => void;
    handleDelete: (type:"epic"|"story"|"ticket", itemId:string) => void;
}

const EpicRow: React.FC<EpicRowProps> = ({ epic, epicStories, handleView, getStoryTickets, handleViewTicketDetails, handleDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const renderStories = (stories:Story[]) => stories.map(story => {
        return (
            <StoryRow
                story={story}
                storyTickets={getStoryTickets(story.id)}
                handleViewDetails={handleViewTicketDetails}
                handleDelete={handleDelete}/>
        )
    })
    return (
        <>
        <tr className="bg-white border-b hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">

                <div className="flex items-center gap-2">

                    <span onClick={() => handleView("epic", epic.id)} className="hover:underline hover:cursor-pointer flex gap-2">
                        <FaCrown color="red" />
                        {epic.name}
                    </span>

                    {epicStories && epicStories.length > 0 && (
                        <span
                            className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold bg-[var(--accent-pink)] text-white rounded-full"
                            title={`${epicStories.length} ${epicStories.length === 1 ? "story" : "stories"}`} // Add a title for accessibility/hover info
                        >
                        {epicStories.length}
                    </span>
                    )}

                    {epicStories && epicStories.length > 0 && (
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
                {epic.description || "No description provided"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                Assigned User
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {epic.status}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                -
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <ActionMenu
                    onEdit={() => console.log("Edit story")}
                    onDelete={() => handleDelete("epic",epic.id)}
                    onViewDetails={() => handleView("epic", epic.id)}
                    onGenerateStories={() => console.log("Generate stories for story")}
                />
            </td>
        </tr>
        {isExpanded && renderStories(epicStories)}
        </>
    );
}

export default EpicRow;