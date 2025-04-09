// src/components/backlog/styles.ts
export const statusClasses: { [key: string]: string } = {
  backlog: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
  todo: "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200",
  inprogress: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200",
  done: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200",
  blocked: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200",
  default: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
};

export const priorityClasses: { [key: string]: string } = {
  highest: "bg-red-200 text-red-900 dark:bg-red-700 dark:text-red-100",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200",
  low: "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300",
  lowest: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  default: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
};

export const gridColumnsStyle = {
  gridTemplateColumns:
    "auto minmax(0, 2fr) minmax(100px, auto) minmax(100px, auto) 80px 100px",
  gap: "0 1rem",
};
