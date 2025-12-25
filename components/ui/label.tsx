// export function Label({ children }: { children: React.ReactNode }) {
//   return (
//     <label className="text-black dark:text-white text-base font-medium">
//       {children}
//     </label>
//   );
// }

export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <label className={`text-black text-base font-medium ${className || ''}`}>
      {children}
    </label>
  );
}