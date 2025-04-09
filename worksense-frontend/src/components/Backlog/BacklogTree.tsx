import React from "react";
import { TreeNodeType, TreeNodeItem } from "./TreeNode";
import { TableHeader } from "./TableHeader";
import { EmptyState } from "./EmptyState";
import { gridColumnsStyle } from "./styles";

interface BacklogTreeProps {
  tree: TreeNodeType[];
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
}

export const BacklogTree: React.FC<BacklogTreeProps> = ({
  tree,
  expandedIds,
  toggleExpand,
}) => {
  return (
    <div className="bg-card dark:bg-card border border-border dark:border-border rounded-lg shadow-md overflow-hidden">
      <TableHeader gridColumnsStyle={gridColumnsStyle} />

      {tree.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="divide-y divide-border dark:divide-border">
          {tree.map((node) => (
            <TreeNodeItem
              key={node.id}
              node={node}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
              gridColumnsStyle={gridColumnsStyle}
            />
          ))}
        </div>
      )}
    </div>
  );
};
