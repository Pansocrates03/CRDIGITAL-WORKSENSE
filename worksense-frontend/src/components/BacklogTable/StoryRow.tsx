// src/components/BacklogTable/StoryRow.tsx
import { FC } from "react";
import { Story, Item, ColumnDefinition } from "./types";
import styles from "./StoryRow.module.css";

interface StoryRowProps {
  item: Story | Item;
  columns: ColumnDefinition[];
  index?: number;
  isEpicStory?: boolean;
}

export const StoryRow: FC<StoryRowProps> = ({ 
  item, 
  columns, 
  index, 
  isEpicStory = false 
}) => {
  return (
    <tr className={styles.storyRow}>
      {columns.map((column) => (
        <td
          key={`${item.id}-${column.id}`}
          className={styles[`${column.id}Column`]}
          style={{ width: column.width }}
        >
          {column.id === "title" && isEpicStory && index !== undefined ? (
            <div className={styles.titleWithEpic}>
              <span>{`${index + 1}. ${column.render(item)}`}</span>
            </div>
          ) : (
            column.render(item)
          )}
        </td>
      ))}
    </tr>
  );
};