// src/components/BacklogTable/BacklogTableSection.tsx
import React, { FC, ReactNode } from "react";
import styles from "./BacklogTableSection.module.css";

interface BacklogTableSectionProps {
  title: string;
  children: ReactNode;
  emptyMessage?: string;
}

const BacklogTableSection: FC<BacklogTableSectionProps> = ({
  title,
  children,
  emptyMessage,
}) => (
  <>
    <tr>
      <td colSpan={5} className={styles.sectionHeader}>{title}</td>
    </tr>
    {React.Children.count(children) === 0 ? (
      <tr><td colSpan={5}>{emptyMessage || `No ${title.toLowerCase()} found`}</td></tr>
    ) : children}
  </>
);

export default BacklogTableSection;