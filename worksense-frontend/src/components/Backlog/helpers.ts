import { BacklogItemType } from "@/types";
import { TreeNodeType } from "./TreeNode";

export const buildTree = (items: BacklogItemType[]): TreeNodeType[] => {
  const itemMap: { [id: string]: TreeNodeType } = {};
  const rootItems: TreeNodeType[] = [];

  items.forEach((item) => {
    itemMap[item.id] = { ...item, children: [], level: 0 };
  });

  items.forEach((item) => {
    const node = itemMap[item.id];
    if (item.parentId && itemMap[item.parentId]) {
      const parentNode = itemMap[item.parentId];
      parentNode.children.push(node);
    } else {
      rootItems.push(node);
    }
  });

  const calculateLevels = (nodes: TreeNodeType[], level: number) => {
    nodes.forEach((node) => {
      node.level = level;
      calculateLevels(node.children, level + 1);
    });
  };
  calculateLevels(rootItems, 0);

  return rootItems;
};
