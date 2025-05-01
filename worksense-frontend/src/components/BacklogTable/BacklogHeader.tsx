// src/components/BacklogTable/BacklogHeader.tsx
import { FC } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BacklogHeaderProps {
  onAddItem: () => void;
}

const BacklogHeader: FC<BacklogHeaderProps> = ({ onAddItem }) => (
  <div className="flex items-baseline justify-between w-full">
    <div>
      <h2 className="text-3xl font-bold tracking-tight text-foreground">
        Product Backlog
      </h2>
      <p className="text-muted-foreground mt-1">
        Track and manage epics, stories, bugs, tech tasks, and knowledge.
      </p>
    </div>
    <Button
      variant="default"
      size="default"
      className="bg-[#ac1754] hover:bg-[#8e0e3d] flex-shrink-0"
      onClick={onAddItem}
    >
      <PlusIcon className="mr-1 h-4 w-4" />
      Add Item
    </Button>
  </div>
);

export default BacklogHeader;