"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const menuItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: 'dashboard',
  },
  {
    name: 'Clients',
    path: '/clients',
    icon: 'groups',
  },
  {
    name: 'Orders',
    path: '/orders',
    icon: 'shopping_bag',
  },
  {
    name: 'Invoice',
    path: '/invoices',
    icon: 'receipt_long',
  },
  {
    name: 'Calendar',
    path: '/calendar',
    icon: 'calendar_month',
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-72 bg-white border-r border-[#d4b896] flex-col shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-[#d4b896]">
          <h1 className="text-black text-xl font-bold">MUA Admin</h1>
          <p className="text-gray-600 text-sm mt-1">Dashboard</p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#d4b896] text-black shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                }`}
              >
                <span className="material-symbols-outlined text-xl">
                  {item.icon}
                </span>
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-[#d4b896]">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-black transition-colors w-full"
          >
            <span className="material-symbols-outlined text-xl">
              logout
            </span>
            <span className="font-medium">
              {isLoggingOut ? 'Logging out...' : 'Log Out'}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}