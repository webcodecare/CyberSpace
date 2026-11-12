import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[#e6eefc] text-[#1457d9]",
        secondary: "bg-[#f0f5fb] text-[#5b6b82]",
        destructive: "bg-[#fef2f2] text-[#c62828]",
        success: "bg-[#dcfce7] text-[#16a34a]",
        warning: "bg-[#fef3c7] text-[#d97706]",
        outline: "border border-[#dbe3ef] text-[#5b6b82]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
