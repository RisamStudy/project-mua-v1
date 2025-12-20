export default async function DashboardPage() {

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-4 sm:p-6 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-sm md:text-base text-gray-400">Welcome back!</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-[#0f0f0f] border border-[#2a2a2a] p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">Total Clients</h3>
            <span className="material-symbols-outlined text-primary">groups</span>
          </div>
          <p className="text-3xl font-bold text-white">34</p>
          <p className="text-sm text-gray-500 mt-2">+5 from last month</p>
        </div>
        
        <div className="bg-[#0f0f0f] border border-[#2a2a2a] p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">Active Orders</h3>
            <span className="material-symbols-outlined text-primary">shopping_bag</span>
          </div>
          <p className="text-3xl font-bold text-white">12</p>
          <p className="text-sm text-gray-500 mt-2">3 pending approval</p>
        </div>
        
        <div className="bg-[#0f0f0f] border border-[#2a2a2a] p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">Total Products</h3>
            <span className="material-symbols-outlined text-primary">inventory_2</span>
          </div>
          <p className="text-3xl font-bold text-white">48</p>
          <p className="text-sm text-gray-500 mt-2">8 categories</p>
        </div>
        
        <div className="bg-[#0f0f0f] border border-[#2a2a2a] p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">Invoices</h3>
            <span className="material-symbols-outlined text-primary">receipt_long</span>
          </div>
          <p className="text-3xl font-bold text-white">28</p>
          <p className="text-sm text-gray-500 mt-2">5 unpaid</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-[#2a2a2a]">
            <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">person_add</span>
            </div>
            <div className="flex-1">
              <p className="text-white">New client added: Olivia Chen</p>
              <p className="text-sm text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center gap-4 pb-4 border-b border-[#2a2a2a]">
            <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">shopping_cart</span>
            </div>
            <div className="flex-1">
              <p className="text-white">New order created for Isabella Rossi</p>
              <p className="text-sm text-gray-500">5 hours ago</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">receipt</span>
            </div>
            <div className="flex-1">
              <p className="text-white">Invoice #1234 generated</p>
              <p className="text-sm text-gray-500">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}