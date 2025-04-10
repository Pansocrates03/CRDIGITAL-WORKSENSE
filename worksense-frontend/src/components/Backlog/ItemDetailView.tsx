import React, { useState, useEffect } from "react";
import { BacklogItemType } from "@/types";
import { Button } from "@/components/ui/button";
import {
  XIcon,
  FileText,
  Layers,
  CheckSquare,
  Bug,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import apiClient from "@/api/apiClient";
import { projectService } from "@/services/projectService";

interface ItemDetailViewProps {
  item: BacklogItemType;
  onClose: () => void;
  projectID: string;
}

const typeIcons: { [key: string]: React.ReactNode } = {
  epic: <Layers className="h-5 w-5" />,
  story: <FileText className="h-5 w-5" />,
  task: <CheckSquare className="h-5 w-5" />,
  bug: <Bug className="h-5 w-5" />,
};

const priorityIcons: { [key: string]: React.ReactNode } = {
  highest: <AlertTriangle className="h-4 w-4" />,
  high: <ArrowUp className="h-4 w-4" />,
  medium: <Minus className="h-4 w-4" />,
  low: <ArrowDown className="h-4 w-4" />,
  lowest: <ArrowDown className="h-4 w-4 opacity-50" />,
};

const typeTranslations: { [key: string]: string } = {
  epic: "Epic",
  story: "Story",
  task: "Task",
  bug: "Bug",
  default: "Item",
};

const priorityTranslations: { [key: string]: string } = {
  lowest: "Lowest",
  low: "Low",
  medium: "Medium",
  high: "High",
  highest: "Highest",
};

const ItemDetailView: React.FC<ItemDetailViewProps> = ({
  item,
  onClose,
  projectID,
}) => {
  const [subItems, setSubItems] = useState<BacklogItemType[]>([]);
  const [isLoadingSubItems, setIsLoadingSubItems] = useState(false);
  const [members, setMembers] = useState<
    Array<{ userId: number; name?: string; fullName?: string }>
  >([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!projectID) return;

      setIsLoadingMembers(true);
      try {
        const projectMembers = await projectService.getProjectMembers(
          projectID
        );
        setMembers(projectMembers);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setIsLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [projectID]);

  useEffect(() => {
    const fetchSubItems = async () => {
      if (!projectID || !item.id) return;

      setIsLoadingSubItems(true);
      try {
        const response = await apiClient.get(
          `/items/subitems?projectID=${encodeURIComponent(
            projectID
          )}&parentItemID=${encodeURIComponent(item.id)}`
        );
        const fetchedSubItems = response.data;
        const actualSubItems = fetchedSubItems.filter(
          (sub: any) => sub.id !== "emptyDoc" && !sub.placeholder
        );
        setSubItems(actualSubItems);
      } catch (err) {
        console.error("Error fetching subitems:", err);
      } finally {
        setIsLoadingSubItems(false);
      }
    };

    fetchSubItems();
  }, [projectID, item.id]);

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return "-";

    try {
      const date = timestamp._seconds
        ? new Date(timestamp._seconds * 1000)
        : new Date(timestamp);

      return formatDistanceToNow(date, { addSuffix: true, locale: enUS });
    } catch (e) {
      return "-";
    }
  };

  // Helper function to get member name by ID
  const getMemberName = (memberId: string) => {
    const member = members.find((m) => m.userId.toString() === memberId);
    return member?.fullName || member?.name || memberId;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start border-b pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                {typeIcons[item.tag || "task"]}
              </div>
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  {item.name}
                  <span className="text-sm text-muted-foreground font-normal">
                    #{item.id}
                  </span>
                </h2>
                <p className="text-muted-foreground">
                  {typeTranslations[item.tag || "default"]}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Main Content Area - Two Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (Wider) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Description
                </p>
                <div className="bg-muted/50 rounded-lg p-4 min-h-[100px]">
                  <p className="whitespace-pre-wrap text-sm">
                    {item.description || "No description provided."}
                  </p>
                </div>
              </div>

              {/* Acceptance Criteria */}
              {item.acceptanceCriteria &&
                item.acceptanceCriteria.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Acceptance Criteria
                    </p>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {item.acceptanceCriteria.map((criterion, index) => (
                          <li key={index}>{criterion}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

              {/* Subitems */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Subitems
                </p>
                {isLoadingSubItems ? (
                  <div className="text-center py-4 bg-muted/50 rounded-lg">
                    <span className="animate-spin inline-block mr-2">⏳</span>
                    <span className="text-sm text-muted-foreground">
                      Loading subitems...
                    </span>
                  </div>
                ) : subItems.length > 0 ? (
                  <div className="bg-muted/50 rounded-lg divide-y divide-border">
                    {subItems.map((subItem) => (
                      <div
                        key={subItem.id}
                        className="p-3 flex items-start gap-3"
                      >
                        <div className="mt-1 text-muted-foreground">
                          {typeIcons[subItem.tag || "task"]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="font-medium text-sm truncate"
                              title={subItem.name}
                            >
                              {subItem.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              #{subItem.id}
                            </span>
                          </div>
                          {subItem.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {subItem.description}
                            </p>
                          )}
                          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2 text-xs">
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                subItem.status === "done"
                                  ? "bg-[#ac175450] text-[#ac1754] dark:bg-[#ac175470] dark:text-[#ff8bb4]"
                                  : subItem.status === "inprogress"
                                  ? "bg-[#ac175430] text-[#ac1754] dark:bg-[#ac175450] dark:text-[#ff8bb4]"
                                  : subItem.status === "blocked"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  : "bg-[#ac175415] text-[#ac1754] dark:bg-[#ac175430] dark:text-[#ff8bb4]"
                              }`}
                            >
                              {subItem.status || ""}
                            </span>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <div
                                className={`p-0.5 rounded ${
                                  subItem.priority === "highest"
                                    ? "bg-[#ac1754] text-white"
                                    : subItem.priority === "high"
                                    ? "bg-[#ac175415] text-[#ac1754] border-2 border-[#ac1754]"
                                    : subItem.priority === "medium"
                                    ? "bg-[#ac175415] text-[#ac1754] border border-[#ac1754]"
                                    : subItem.priority === "low"
                                    ? "bg-[#ac175415] text-[#ac1754] border border-[#ac1754]/50"
                                    : "bg-[#ac175415] text-[#ac1754] border border-dashed border-[#ac1754]/30"
                                }`}
                              >
                                {priorityIcons[subItem.priority || "medium"]}
                              </div>
                              <span>
                                {
                                  priorityTranslations[
                                    subItem.priority || "medium"
                                  ]
                                }
                              </span>
                            </div>
                            {subItem.size !== undefined && (
                              <span className="text-muted-foreground">
                                Size: {subItem.size}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      This item has no subitems.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (Narrower) */}
            <div className="lg:col-span-1 space-y-4">
              {/* Status */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Status
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      item.status === "done"
                        ? "bg-[#ac1754]"
                        : item.status === "inprogress"
                        ? "bg-[#ac1754]/70"
                        : item.status === "blocked"
                        ? "bg-red-500"
                        : "bg-[#ac1754]/30"
                    }`}
                  />
                  <span className="font-medium text-sm">{item.status}</span>
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Priority
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1 rounded ${
                      item.priority === "highest"
                        ? "bg-[#ac1754] text-white"
                        : item.priority === "high"
                        ? "bg-[#ac175415] text-[#ac1754] border-2 border-[#ac1754]"
                        : item.priority === "medium"
                        ? "bg-[#ac175415] text-[#ac1754] border border-[#ac1754]"
                        : item.priority === "low"
                        ? "bg-[#ac175415] text-[#ac1754] border border-[#ac1754]/50"
                        : "bg-[#ac175415] text-[#ac1754] border border-dashed border-[#ac1754]/30"
                    }`}
                  >
                    {priorityIcons[item.priority || "medium"]}
                  </div>
                  <span className="font-medium text-sm">
                    {priorityTranslations[item.priority || "medium"]}
                  </span>
                </div>
              </div>

              {/* Size */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Size
                </p>
                <p className="font-medium text-sm">
                  {item.size !== undefined ? item.size : "-"}
                </p>
              </div>

              {/* Author */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Author
                </p>
                <p className="font-medium text-sm truncate" title={item.author}>
                  {item.author || "-"}
                </p>
              </div>

              {/* Assignees */}
              {item.asignee && item.asignee.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Assignees
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {isLoadingMembers ? (
                      <span className="text-sm text-muted-foreground">
                        Loading assignees...
                      </span>
                    ) : (
                      item.asignee.map((assignee, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-primary/10 rounded-md text-xs"
                          title={getMemberName(assignee)}
                        >
                          {getMemberName(assignee)}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="pt-4 border-t space-y-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-xs">{formatDate(item.createdAt)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Last updated</p>
                  <p className="text-xs">{formatDate(item.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailView;
