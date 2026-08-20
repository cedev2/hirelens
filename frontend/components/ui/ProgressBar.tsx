"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "danger";
  showLabel?: boolean;
  className?: string;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ value, max = 100, size = "md", variant = "default", showLabel = false, className, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const sizes = {
      sm: "h-2",
      md: "h-3",
      lg: "h-4",
    };

    const variants = {
      default: "bg-gradient-to-r from-green-500 to-green-600",
      success: "bg-gradient-to-r from-green-500 to-green-600",
      warning: "bg-gradient-to-r from-yellow-500 to-yellow-600",
      danger: "bg-gradient-to-r from-red-500 to-red-600",
    };

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {showLabel && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-gray-700">{Math.round(percentage)}%</span>
          </div>
        )}
        <div className={cn("w-full bg-gray-200 rounded-full overflow-hidden", sizes[size])}>
          <div
            className={cn(
              "h-full transition-all duration-500 ease-out rounded-full",
              variants[variant]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = "ProgressBar";

export { ProgressBar };
