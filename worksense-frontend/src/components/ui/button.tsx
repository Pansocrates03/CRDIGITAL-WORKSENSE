import * as React from "react";
import {Slot} from "@radix-ui/react-slot";
import {cva, type VariantProps} from "class-variance-authority";
import "@/styles/index.css";

import {cn} from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    {
        variants: {
            variant: {
                default:
                    "bg-[var(--accent-pink)] text-[var(--accent-pink-text)] shadow-xs relative hover:bg-[var(--accent-pink-hover)] active:bg-[var(--accent-pink-hover)]",
                destructive:
                    "bg-[var(--error)] text-white shadow-xs hover:bg-[var(--error)]/90 focus-visible:ring-[var(--error)]/20 dark:focus-visible:ring-[var(--error)]/40 dark:bg-[var(--error)]/80",
                outline:
                    "border border-[var(--neutral-300)] bg-[var(--neutral-100)] text-[var(--text-primary)] shadow-xs hover:bg-[var(--surface-light)] hover:border-[var(--accent-pink)] hover:text-[var(--accent-pink)] dark:bg-[var(--surface-dark)] dark:border-[var(--neutral-600)] dark:hover:bg-[var(--surface-dark-hover)]",
                secondary:
                    "bg-[var(--neutral-100)] border border-[var(--neutral-300)] text-[var(--text-primary)] shadow-xs hover:bg-[var(--surface-light-hover)] hover:border-[var(--neutral-400)] dark:bg-[var(--surface-dark)] dark:border-[var(--neutral-600)] dark:hover:bg-[var(--surface-dark-hover)]",
                ghost:
                    "text-[var(--text-primary)] hover:bg-[var(--surface-light)] hover:text-[var(--accent-pink)] dark:hover:bg-[var(--surface-dark)] dark:hover:text-[var(--accent-pink)]",
                link: "text-[var(--accent-pink)] underline-offset-4 hover:underline hover:text-[var(--accent-pink-hover)]",
            },
            size: {
                default: "h-9 px-4 py-2 has-[>svg]:px-3",
                sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
                lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
                icon: "size-9",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

function Button({
                    className,
                    variant,
                    size,
                    asChild = false,
                    ...props
                }: React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
}) {
    const Comp = asChild ? Slot : "button";

    return (
        <Comp
            data-slot="button"
            className={cn(buttonVariants({variant, size, className}))}
            {...props}
        />
    );
}

export {Button, buttonVariants};
