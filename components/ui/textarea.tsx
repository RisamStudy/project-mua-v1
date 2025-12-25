import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-lg border-2 border-[#d4b896] bg-white px-4 py-3 text-black focus:ring-2 focus:ring-[#d4b896]/50 focus:outline-none focus:border-[#c4a886] placeholder:text-gray-500 transition-colors resize-none",
      className
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";