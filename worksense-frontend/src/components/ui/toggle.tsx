import * as React from "react";

interface ToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
}

const Toggle: React.FC<ToggleProps> = ({ checked, onCheckedChange, disabled, id, className }) => {
  return (
    <button
      type="button"
      id={id}
      className={
        `relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ` +
        (checked ? "bg-[#ac1754]" : "bg-[#101526]") +
        (disabled ? " opacity-60 cursor-not-allowed" : " cursor-pointer") +
        (className ? ` ${className}` : "")
      }
      aria-pressed={checked}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange(!checked)}
    >
      <span
        className={
          `inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform duration-200` +
          (checked ? " translate-x-7" : " translate-x-1")
        }
      />
    </button>
  );
};

export { Toggle }; 