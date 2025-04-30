// src/components/BacklogTable/SearchFilter.tsx
import React, { FC } from "react";
import { Search, X } from "lucide-react";
import styles from "./SearchFilter.module.css";

interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchFilter: FC<SearchFilterProps> = ({ 
  value, 
  onChange, 
  placeholder = "Search by title..." 
}) => {
  return (
    <div className={styles.searchContainer}>
      <Search className={styles.searchIcon} size={16} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={styles.searchInput}
      />
      {value && (
        <button
          className={styles.clearButton}
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchFilter;