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
    name: 'Products',
    path: '/products',
    icon: 'inventory_2',
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
      <aside className="hidden md:flex md:w-64 lg:w-72 bg-[#0f0f0f] border-r border-[#2a2a2a] flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#2a2a2a]">
          <h1 className="text-white text-xl font-bold">MUA Admin</h1>
          <p className="text-gray-400 text-sm mt-1">Dashboard</p>
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
                    ? 'bg-[#4a3a3a] text-white'
                    : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
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
        <div className="p-4 border-t border-[#2a2a2a]">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-[#1a1a1a] hover:text-white transition-colors w-full"
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