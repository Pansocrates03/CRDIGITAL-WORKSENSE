import { Story } from "@/types/StoryType";
import ActionMenu from "@/components/BacklogTable/ActionMenu";

const StoryRow: React.FC<{ story: Story }> = ({ story }) => {
    console.log("StoryRow: story:", story);
    return (
        <tr className="bg-white border-b hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {story.name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {story.description || "No description provided"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                Assigned User
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                Status
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                Size
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <ActionMenu
                    onEdit={() => console.log("Edit story")}
                    onDelete={() => console.log("Delete story")}
                    onViewDetails={() => console.log("View story details")}
                    onGenerateStories={() => console.log("Generate stories for story")}
                />
            </td>
        </tr>
    );
}

export default StoryRow;