"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const menu = [
  { label: "Clients", icon: "group", href: "/clients" },
  { label: "Orders", icon: "shopping_bag", href: "/orders" },
  { label: "Invoice", icon: "receipt_long", href: "/invoice" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed h-screen w-64 border-r border-[#d4b896] bg-white shadow-lg">
      <div className="flex h-full flex-col justify-between p-4">
        
        <div className="flex flex-col gap-4">
          <h1 className="text-lg font-bold text-black">
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
                    ? "bg-[#d4b896] text-black shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-black"
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
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-black transition-colors"
        >
          <span className="material-symbols-outlined">logout</span>
          Log Out
        </Link>
      </div>
    </aside>
  );
}
