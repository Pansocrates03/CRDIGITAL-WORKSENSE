// src/components/BacklogTable/BacklogTable.tsx

import React, { useState } from "react";
import { EpicRow } from "@/components/BacklogTable/EpicRow";
import { StoryRow } from "@/components/BacklogTable/StoryRow";
import { SectionHeader } from "@/components/BacklogTable/SectionHeader";
import styles from "./BacklogTable.module.css";

export interface Story {
  id: string;
  title: string;
  status: string;
  assignee: string;
  points?: number;
  epic?: string;
  labels?: string[];
}

export interface Epic {
  id: string;
  title: string;
  stories: Story[];
}

export interface Item extends Story {}

export interface BacklogData {
  epics: Epic[];
  userStories: Story[];
  bugs: Item[];
  techTasks: Item[];
  knowledge: Item[];
}

interface BacklogTableProps {
  backlogData: BacklogData;
  searchTerm: string;
}

export const BacklogTable: React.FC<BacklogTableProps> = ({ backlogData, searchTerm }) => {
  const [expandedEpics, setExpandedEpics] = useState<string[]>([]);

  const toggleEpic = (epicId: string) => {
    setExpandedEpics((prev) =>
      prev.includes(epicId)
        ? prev.filter((id) => id !== epicId)
        : [...prev, epicId]
    );
  };

  const filterBySearch = (item: { title: string }) => {
    if (!searchTerm) return true;
    return item.title.toLowerCase().includes(searchTerm.toLowerCase());
  };

  const matchesEpicOrStories = (epic: Epic) => {
    if (filterBySearch(epic)) return true;
    return epic.stories.some(filterBySearch);
  };

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Assignee</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {/* Epics */}
          <SectionHeader title="Epics" colSpan={4} />
          {backlogData.epics.filter(matchesEpicOrStories).length === 0 ? (
            <tr><td colSpan={4}>No epics found</td></tr>
          ) : (
            backlogData.epics.filter(matchesEpicOrStories).map((epic) => (
              <React.Fragment key={epic.id}>
                <EpicRow
                  epic={epic}
                  isExpanded={expandedEpics.includes(epic.id)}
                  onToggle={toggleEpic}
                  colSpan={4}
                />
                {expandedEpics.includes(epic.id) &&
                  epic.stories.filter(filterBySearch).map((story, index) => (
                    <StoryRow key={story.id} story={story} indent />
                  ))}
              </React.Fragment>
            ))
          )}

          {/* User Stories */}
          <SectionHeader title="User Stories" colSpan={4} />
          {backlogData.userStories.filter(filterBySearch).length === 0 ? (
            <tr><td colSpan={4}>No user stories found</td></tr>
          ) : (
            backlogData.userStories.filter(filterBySearch).map((story) => (
              <StoryRow key={story.id} story={story} />
            ))
          )}

          {/* Bugs */}
          <SectionHeader title="Bugs" colSpan={4} />
          {backlogData.bugs.filter(filterBySearch).length === 0 ? (
            <tr><td colSpan={4}>No bugs found</td></tr>
          ) : (
            backlogData.bugs.filter(filterBySearch).map((bug) => (
              <StoryRow key={bug.id} story={bug} />
            ))
          )}

          {/* Tech Tasks */}
          <SectionHeader title="Tech Tasks" colSpan={4} />
          {backlogData.techTasks.filter(filterBySearch).length === 0 ? (
            <tr><td colSpan={4}>No tech tasks found</td></tr>
          ) : (
            backlogData.techTasks.filter(filterBySearch).map((task) => (
              <StoryRow key={task.id} story={task} />
            ))
          )}

          {/* Knowledge */}
          <SectionHeader title="Knowledge Items" colSpan={4} />
          {backlogData.knowledge.filter(filterBySearch).length === 0 ? (
            <tr><td colSpan={4}>No knowledge items found</td></tr>
          ) : (
            backlogData.knowledge.filter(filterBySearch).map((item) => (
              <StoryRow key={item.id} story={item} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

