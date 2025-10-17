import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  message?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, message, ...props }, ref) => {
    return (
      <div className="flex flex-col">
        <input
          type={type}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-white file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 focus:border-blue-500",
            message ? "border-red-500 focus:border-red-500" : "",
            className
          )}
          ref={ref}
          {...props}
        />
        {message && (
          <p className="text-sm text-red-600 dark:text-red-500 py-2">
            {message}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };

