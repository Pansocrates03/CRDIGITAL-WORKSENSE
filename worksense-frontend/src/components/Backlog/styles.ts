// src/components/backlog/styles.ts
export const statusClasses: { [key: string]: string } = {
  Backlog:
    "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 font-medium",
  "To do":
    "bg-[#ac175415] text-[#ac1754] dark:bg-[#ac175430] dark:text-[#ff8bb4] font-medium",
  "In Progress":
    "bg-[#ac175430] text-[#ac1754] dark:bg-[#ac175450] dark:text-[#ff8bb4] font-medium",
  Done: "bg-[#ac175450] text-[#ac1754] dark:bg-[#ac175470] dark:text-[#ff8bb4] font-medium",
  Blocked:
    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 font-medium",
  default:
    "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 font-medium",
};

export const priorityClasses: { [key: string]: string } = {
  highest:
    "bg-[#ac1754] text-white dark:bg-[#ac1754] dark:text-white font-semibold border-2 border-[#ac1754]",
  high: "bg-[#ac175415] text-[#ac1754] dark:text-[#ff8bb4] font-semibold border-2 border-[#ac1754]",
  medium:
    "bg-[#ac175415] text-[#ac1754] dark:text-[#ff8bb4] font-medium border border-[#ac1754]",
  low: "bg-[#ac175415] text-[#ac1754] dark:text-[#ff8bb4] font-medium border border-[#ac1754]/50",
  lowest:
    "bg-[#ac175415] text-[#ac1754] dark:text-[#ff8bb4] font-medium border border-dashed border-[#ac1754]/30",
  default:
    "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 font-medium",
};

export const gridColumnsStyle = {
  gridTemplateColumns:
    "auto minmax(0, 2.5fr) minmax(120px, auto) minmax(120px, auto) 100px 120px",
  gap: "0 1.25rem",
};

export const typeClasses: { [key: string]: string } = {
  epic: "text-[#ac1754] dark:text-[#ff8bb4]",
  story: "text-[#ac1754] dark:text-[#ff8bb4]",
  task: "text-[#ac1754] dark:text-[#ff8bb4]",
  bug: "text-[#ac1754] dark:text-[#ff8bb4]",
  default: "text-neutral-600 dark:text-neutral-400",
};

export const levelBackgroundClasses: { [key: number]: string } = {
  0: "bg-white dark:bg-neutral-900",
  1: "bg-[#ac175408] dark:bg-[#ac175410]",
  2: "bg-[#ac175410] dark:bg-[#ac175420]",
  3: "bg-[#ac175415] dark:bg-[#ac175430]",
};

export const hoverRowClass =
  "transition-colors duration-150 hover:bg-[#ac175408] dark:hover:bg-[#ac175415] relative";

export const levelBorderClasses: { [key: number]: string } = {
  0: "border-l-4 border-transparent",
  1: "border-l-4 border-[#ac1754]/20",
  2: "border-l-4 border-[#ac1754]/40",
  3: "border-l-4 border-[#ac1754]/60",
};
