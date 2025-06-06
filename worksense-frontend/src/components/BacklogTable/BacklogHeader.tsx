// src/components/BacklogTable/BacklogHeader.tsx
import {FC} from "react";
import {PlusIcon} from "lucide-react";
import {Button} from "@/components/ui/button";

interface BacklogHeaderProps {
    onAddItem: () => void;
    hasPermissions: boolean;
}

const BacklogHeader: FC<BacklogHeaderProps> = ({onAddItem, hasPermissions}) => (
    <div className="flex items-baseline justify-between w-full">
        <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4 ">
                Product Backlog
            </h2>
            <p className="text-muted-foreground mt-1">
                Track and manage epics, stories, bugs, tech tasks, and knowledge.
            </p>
        </div>
        {hasPermissions && <Button
            variant="default"
            size="default"
            onClick={onAddItem}
        >
            <PlusIcon className="mr-1 h-4 w-4"/>
            Add Item
        </Button>}
    </div>
);

export default BacklogHeader;