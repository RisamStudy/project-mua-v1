"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const menu = [
  { label: "Clients", icon: "group", href: "/clients" },
  { label: "Orders", icon: "shopping_bag", href: "/orders" },
  { label: "Products", icon: "inventory_2", href: "/products" },
  { label: "Invoice", icon: "receipt_long", href: "/invoice" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed h-screen w-64 border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
      <div className="flex h-full flex-col justify-between p-4">
        
        <div className="flex flex-col gap-4">
          <h1 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
            MUA Admin Panel
          </h1>

          <nav className="flex flex-col gap-2 mt-4">
            {menu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  pathname.startsWith(item.href)
                    ? "bg-primary/20 text-primary"
                    : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-primary/10 hover:text-primary"
                )}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Logout */}
        <Link
          href="/logout"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary-light dark:text-text-secondary-dark hover:bg-primary/10 hover:text-primary"
        >
          <span className="material-symbols-outlined">logout</span>
          Log Out
        </Link>
      </div>
    </aside>
  );
}
