// src/components/PageHeader.tsx (or .jsx)
import React from "react"; // Removed useState, useEffect, useRef
import TeamAvatars from "../TeamAvatars/TeamAvatars";
import Tabs from "../Tabs/Tabs";
// Import Radix Dropdown components (adjust path based on your project structure)
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  // DropdownMenuLabel, // Optional: if you want a label inside
} from "../../../../components/ui/dropdown-menu"; // ASSUMING the components are in './ui/dropdown-menu'
import { FaChevronDown } from "react-icons/fa"; // Use a different icon if preferred
import "./PageHeader.css";
import { Sprint } from "../../../../types/SprintType"; // Adjust path

interface TeamMember {
  /* ... */
}
interface TabItem {
  /* ... */
}

interface PageHeaderProps {
  title: string; // The text to display (selected sprint name or placeholder)
  description: string;
  teamMembers?: TeamMember[];
  tabItems?: TabItem[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;

  // Sprint Props
  sprints: Sprint[];
  selectedSprintId: string | null;
  onSprintSelect: (sprintId: string | null) => void; // Handler expects ID or null
  isLoadingSprints: boolean;
  isSprintsError: boolean;
}

function PageHeader({
  title,
  description,
  teamMembers = [],
  tabItems = [],
  activeTabId,
  onTabChange,
  sprints = [],
  selectedSprintId,
  onSprintSelect,
  isLoadingSprints,
  isSprintsError,
}: PageHeaderProps) {
  // Determine if the trigger should be interactive
  const canOpenDropdown =
    !isLoadingSprints && !isSprintsError && sprints.length > 0;

  return (
    <div className="page-header">
      <div className="page-header__top">
        <div className="page-header__title-group">
          <div className="page-header__title-trigger-wrapper">
            {/* --- Radix Dropdown Implementation --- */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={!canOpenDropdown}>
                {/* Use a button for better semantics and accessibility */}
                <button
                  type="button"
                  className="page-header__sprint-trigger-radix" // Use a specific class for styling
                  aria-label="Select Sprint"
                >
                  <h1>{title}</h1>
                  {/* Show icon only if interactive */}
                  {canOpenDropdown && (
                    <FaChevronDown
                      className="page-header__sprint-icon-radix"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </DropdownMenuTrigger>

              {/* Content: Renders only when open, managed by Radix */}
              <DropdownMenuContent
                align="start"
                className="page-header__dropdown-content-radix"
              >
                {/* Optional Label */}
                {/* <DropdownMenuLabel>Select a Sprint</DropdownMenuLabel> */}
                {/* <DropdownMenuSeparator /> */}

                <DropdownMenuRadioGroup
                  value={selectedSprintId ?? ""} // Radix value prop needs a string
                  // onValueChange receives the value (sprint.id) of the selected item
                  onValueChange={(value) => {
                    // If user clicks the already selected item, value might be the same.
                    // If they click a different item, update.
                    // Handle potential empty string if a "clear" option were added.
                    onSprintSelect(value || null);
                  }}
                >
                  {sprints.map((sprint) => (
                    <DropdownMenuRadioItem
                      key={sprint.id}
                      value={sprint.id} // Set value for Radix to track selection
                      className="page-header__dropdown-item-radix" // Class for styling items
                    >
                      {sprint.name}{" "}
                      <span className="sprint-status-muted">
                        ({sprint.status})
                      </span>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* --- End Radix Dropdown --- */}

            {description && (
              <p className="page-header__description">{description}</p>
            )}
          </div>
        </div>
        <TeamAvatars members={teamMembers} />
      </div>

      {/* Bottom section: Tabs */}
      {tabItems.length > 0 && (
        <div className="page-header__tabs">
          <Tabs
            items={tabItems}
            activeTabId={activeTabId}
            onTabClick={onTabChange}
          />
        </div>
      )}
    </div>
  );
}

export default PageHeader;
