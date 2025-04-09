// src/components/backlog/TreeNode.tsx
import React from "react";
import { parseTimestamp } from "@/types";
import { ChevronRight, ChevronDown } from "lucide-react";
import { statusClasses, priorityClasses } from "./styles";
import { BacklogItemType } from "@/types";
import { typeIcons } from "./icons";
export interface TreeNodeType extends BacklogItemType {
  children: TreeNodeType[];
  level: number;
}

interface TreeNodeProps {
  node: TreeNodeType;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
  gridColumnsStyle: React.CSSProperties;
}

export const TreeNodeItem: React.FC<TreeNodeProps> = ({
  node,
  expandedIds,
  toggleExpand,
  gridColumnsStyle,
}) => {
  const {
    id,
    name,
    status = "backlog",
    priority = "medium",
    type = "task",
    size,
    createdAt,
    children,
  } = node;

  const statusClass =
    statusClasses[status.toLowerCase()] || statusClasses.default;
  const priorityClass =
    priorityClasses[priority.toLowerCase()] || priorityClasses.default;
  const creationDate = parseTimestamp(createdAt);
  const formattedDate = creationDate
    ? creationDate.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "-";
  const IconComponent = typeIcons[type.toLowerCase()] || typeIcons.default;

  return (
    <React.Fragment>
      <div
        className="grid items-center transition-colors duration-150 hover:bg-muted/50 dark:hover:bg-muted/50 pr-2"
        style={gridColumnsStyle}
      >
        {/* Indentation + Expand Button */}
        <div
          style={{ paddingLeft: `${node.level * 24}px` }}
          className="flex items-center h-full py-3"
        >
          {children.length > 0 ? (
            <div className="flex items-center justify-center">
              <button
                onClick={() => toggleExpand(id)}
                className="p-1 rounded-full hover:bg-muted dark:hover:bg-neutral-600 mr-2"
                aria-label={expandedIds.has(id) ? "Collapse" : "Expand"}
              >
                {expandedIds.has(id) ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
            </div>
          ) : (
            <div className="w-[28px] mr-2"></div>
          )}
        </div>

        {/* Icon + Title + ID */}
        <div className="flex items-center gap-2 py-3 px-3 min-w-0">
          <IconComponent
            size={16}
            className="text-muted-foreground flex-shrink-0 mt-px"
          />
          <span
            className="text-sm font-medium text-foreground truncate"
            title={name}
          >
            {name}{" "}
            <span className="text-xs text-muted-foreground font-normal ml-1">
              (#{id})
            </span>
          </span>
        </div>

        {/* Status Badge */}
        <div className="py-3 px-3 flex justify-center items-center">
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap ${statusClass}`}
          >
            {status}
          </span>
        </div>

        {/* Priority Badge */}
        <div className="py-3 px-3 flex justify-center items-center">
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium capitalize whitespace-nowrap ${priorityClass}`}
          >
            {priority}
          </span>
        </div>

        {/* Size */}
        <div className="py-3 px-3 flex justify-center items-center">
          <span className="text-sm text-muted-foreground">
            {size !== undefined ? size : "-"}
          </span>
        </div>

        {/* Date */}
        <div className="py-3 px-3 flex justify-end items-center">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {formattedDate}
          </span>
        </div>
      </div>

      {/* Render children */}
      {children.length > 0 &&
        expandedIds.has(id) &&
        children.map((childNode) => (
          <TreeNodeItem
            key={childNode.id}
            node={childNode}
            expandedIds={expandedIds}
            toggleExpand={toggleExpand}
            gridColumnsStyle={gridColumnsStyle}
          />
        ))}
    </React.Fragment>
  );
};
