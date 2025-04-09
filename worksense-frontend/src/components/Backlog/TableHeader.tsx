import React from "react";

interface TableHeaderProps {
  gridColumnsStyle: React.CSSProperties;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  gridColumnsStyle,
}) => {
  return (
    <div
      className="grid items-center border-b-2 border-border dark:border-border bg-muted/50 dark:bg-muted/50 sticky top-0 z-10 pr-2"
      style={gridColumnsStyle}
    >
      {/* Empty Cell for indentation */}
      <div className="py-2.5 px-3 pl-2"></div>

      {/* "Item" Header */}
      <div className="py-2.5 px-3 font-semibold text-sm text-muted-foreground">
        Item
      </div>

      {/* Status Header */}
      <div className="py-2.5 px-3 text-center font-semibold text-sm text-muted-foreground">
        Status
      </div>
      {/* Priority Header */}
      <div className="py-2.5 px-3 text-center font-semibold text-sm text-muted-foreground">
        Priority
      </div>
      {/* Size Header */}
      <div className="py-2.5 px-3 text-center font-semibold text-sm text-muted-foreground">
        Size
      </div>
      {/* "Created" Header */}
      <div className="py-2.5 px-3 text-right font-semibold text-sm text-muted-foreground">
        Created
      </div>
    </div>
  );
};
