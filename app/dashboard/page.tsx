export default async function DashboardPage() {

  return (
    <div className="min-h-screen bg-gray-50 text-black p-4 sm:p-6 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-black">Dashboard</h1>
        <p className="text-sm md:text-base text-gray-600">Welcome back!</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white border-2 border-[#d4b896] p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 text-sm font-medium">Total Clients</h3>
            <span className="material-symbols-outlined text-[#d4b896]">groups</span>
          </div>
          <p className="text-3xl font-bold text-black">34</p>
          <p className="text-sm text-gray-500 mt-2">+5 from last month</p>
        </div>
        
        <div className="bg-white border-2 border-[#d4b896] p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 text-sm font-medium">Active Orders</h3>
            <span className="material-symbols-outlined text-[#d4b896]">shopping_bag</span>
          </div>
          <p className="text-3xl font-bold text-black">12</p>
          <p className="text-sm text-gray-500 mt-2">3 pending approval</p>
        </div>
        
        <div className="bg-white border-2 border-[#d4b896] p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 text-sm font-medium">Invoices</h3>
            <span className="material-symbols-outlined text-[#d4b896]">receipt_long</span>
          </div>
          <p className="text-3xl font-bold text-black">28</p>
          <p className="text-sm text-gray-500 mt-2">5 unpaid</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white border-2 border-[#d4b896] rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-black">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-[#d4b896]/30">
            <div className="w-10 h-10 rounded-full bg-[#d4b896]/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#d4b896]">person_add</span>
            </div>
            <div className="flex-1">
              <p className="text-black">New client added: Olivia Chen</p>
              <p className="text-sm text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center gap-4 pb-4 border-b border-[#d4b896]/30">
            <div className="w-10 h-10 rounded-full bg-[#d4b896]/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#d4b896]">shopping_cart</span>
            </div>
            <div className="flex-1">
              <p className="text-black">New order created for Isabella Rossi</p>
              <p className="text-sm text-gray-500">5 hours ago</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#d4b896]/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#d4b896]">receipt</span>
            </div>
            <div className="flex-1">
              <p className="text-black">Invoice #1234 generated</p>
              <p className="text-sm text-gray-500">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}