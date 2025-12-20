import Sidebar from '@/components/layout/sidebar';
import MobileHeader from '@/components/layout/mobile-header'
import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex min-h-screen bg-[#1a1a1a]">
      {/* Sidebar - Hidden on mobile, visible on tablet and desktop */}
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header - Only visible on mobile */}
        <MobileHeader />
        
        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}