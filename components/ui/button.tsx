// import { cn } from "@/lib/utils";

// export function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
//   return (
//     <button
//       {...props}
//       className={cn(
//         "flex justify-center items-center rounded-lg px-6 py-4 bg-primary text-white font-medium hover:bg-primary/90 focus:ring-2 focus:ring-offset-2 focus:ring-primary h-14",
//         className
//       )}
//     />
//   );
// }

import { cn } from "@/lib/utils";

export function Button({ 
  className, 
  children,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "flex justify-center items-center rounded-lg px-6 py-4 bg-primary text-white font-medium hover:bg-primary/90 focus:ring-2 focus:ring-offset-2 focus:ring-primary h-14",
        className
      )}
    >
      {children}
    </button>
  );
}