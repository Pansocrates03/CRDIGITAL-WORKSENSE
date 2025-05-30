// src/components/BacklogTable/BacklogHeader.tsx
import {FC} from "react";
import {PlusIcon, BookOpen, FileText, Ticket} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface BacklogHeaderProps {
    onAddItem: (type: 'epic' | 'story' | 'ticket') => void;
}

const BacklogHeader: FC<BacklogHeaderProps> = ({onAddItem}) => (
    <div className="flex items-baseline justify-between w-full">
        <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4 ">
                Product Backlog
            </h2>
            <p className="text-muted-foreground mt-1">
                Track and manage epics, stories, bugs, tech tasks, and knowledge.
            </p>
        </div>
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="default" size="default">
                    <PlusIcon className="mr-1 h-4 w-4"/>
                    Add Item
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
                <div className="flex flex-col gap-1">
                    <Button 
                        variant="ghost" 
                        className="justify-start"
                        onClick={() => onAddItem('epic')}
                    >
                        <BookOpen className="mr-2 h-4 w-4" />
                        Create Epic
                    </Button>
                    <Button 
                        variant="ghost" 
                        className="justify-start"
                        onClick={() => onAddItem('story')}
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        Create Story
                    </Button>
                    <Button 
                        variant="ghost" 
                        className="justify-start"
                        onClick={() => onAddItem('ticket')}
                    >
                        <Ticket className="mr-2 h-4 w-4" />
                        Create Ticket
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    </div>
);

export default BacklogHeader;