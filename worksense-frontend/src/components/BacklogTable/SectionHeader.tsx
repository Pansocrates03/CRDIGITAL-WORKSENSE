// src/components/BacklogTable/SectionHeader.tsx
import React, { FC } from "react";
import styles from "./SectionHeader.module.css";

interface SectionHeaderProps {
  title: string;
  colSpan: number;
}

export const SectionHeader: FC<SectionHeaderProps> = ({ title, colSpan }) => {
  return (
    <tr>
      <td colSpan={colSpan} className={styles.sectionHeader}>
        {title}
      </td>
    </tr>
  );
};