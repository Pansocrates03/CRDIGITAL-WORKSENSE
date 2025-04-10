import { BacklogItemType } from "@/types";
import { TreeItemType } from "./types";

export const buildTree = (items: BacklogItemType[]): TreeItemType[] => {
  const itemMap: { [id: string]: TreeItemType } = {};
  const rootItems: TreeItemType[] = [];

  items.forEach((item) => {
    itemMap[item.id] = { ...item, children: [], level: 0 };
  });

  items.forEach((item) => {
    const node = itemMap[item.id];
    if (item.parentId && itemMap[item.parentId]) {
      const parentNode = itemMap[item.parentId];
      parentNode.children = parentNode.children || [];
      parentNode.children.push(node);
    } else {
      rootItems.push(node);
    }
  });

  const calculateLevels = (nodes: TreeItemType[], level: number) => {
    nodes.forEach((node) => {
      node.level = level;
      if (node.children) {
        calculateLevels(node.children, level + 1);
      }
    });
  };
  calculateLevels(rootItems, 0);

  return rootItems;
};
