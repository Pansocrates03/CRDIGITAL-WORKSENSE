import React from "react";
import {
  Bookmark,
  BookOpenText,
  SquareCheckBig,
  Bug,
  CircleHelp,
} from "lucide-react";

export const typeIcons: { [key: string]: React.ElementType } = {
  epic: Bookmark,
  story: BookOpenText,
  task: SquareCheckBig,
  bug: Bug,
  default: CircleHelp,
};
