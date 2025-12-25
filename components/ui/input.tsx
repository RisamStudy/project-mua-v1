// import * as React from "react";
// import { cn } from "@/lib/utils";

// export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
//   ({ className, ...props }, ref) => (
//     <input
//       ref={ref}
//       className={cn(
//         "w-full rounded-lg border border-gray-300 dark:border-[#653448] bg-white dark:bg-[#321a24] px-4 py-3 text-black dark:text-white focus:ring-2 focus:ring-primary/50 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-[#c893a9]",
//         className
//       )}
//       {...props}
//     />
//   )
// );

// Input.displayName = "Input";

import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg border-2 border-[#d4b896] bg-white px-4 py-3 text-black focus:ring-2 focus:ring-[#d4b896]/50 focus:outline-none placeholder:text-gray-500",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
