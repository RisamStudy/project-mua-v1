"use client";

import { useState } from "react";
import Link from "next/link";

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  orderNumber: string;
  amount: string;
  paidAmount: string;
  status: string;
  issueDate: string;
  paymentNumber: number;
}

export default function InvoicesTable({ invoices }: { invoices: Invoice[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setSortMenu] = useState(false);

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort invoices by client name
  const sortedInvoices = [...filteredInvoices];
  if (sortOrder) {
    sortedInvoices.sort((a, b) => {
      const nameA = a.clientName.toLowerCase();
      const nameB = b.clientName.toLowerCase();
      
      if (sortOrder === 'asc') {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });
  }

  // Pagination
  const totalPages = Math.ceil(sortedInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInvoices = sortedInvoices.slice(startIndex, endIndex);

  const handleSort = () => {
    if (sortOrder === null) {
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else {
      setSortOrder(null);
    }
    setSortMenu(false);
  };

  const formatCurrency = (amount: string) => {
    return `RP. ${parseFloat(amount).toLocaleString("id-ID", {
      minimumFractionDigits: 2,
    })}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-500/10 text-green-500";
      case "Pending":
        return "bg-yellow-500/10 text-yellow-500";
      case "Overdue":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <div className="bg-white rounded-xl border-2 border-[#d4b896] overflow-hidden shadow-lg">
      {/* Search and Filters */}
      <div className="p-4 sm:p-6 border-b border-[#d4b896]">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              search
            </span>
            <input
              type="text"
              placeholder="Search by client name, invoice #"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-[#d4b896] rounded-lg pl-12 pr-4 py-3 text-black placeholder:text-gray-500 focus:outline-none focus:border-[#c4a886]"
            />
          </div>
          <div className="flex gap-2 relative overflow-visible">
            {/* Filter Button */}
            <div className="relative">
              <button 
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm md:text-base text-gray-600 hover:text-black transition-colors border border-[#d4b896] rounded-lg min-w-0"
              >
                <span className="material-symbols-outlined text-lg sm:text-xl">filter_list</span>
                <span className="hidden sm:inline whitespace-nowrap">Filter</span>
                <span className="sm:hidden text-xs">Filter</span>
                {statusFilter !== 'All' && (
                  <span className="w-2 h-2 bg-[#d4b896] rounded-full flex-shrink-0"></span>
                )}
              </button>

              {/* Filter Dropdown */}
              {showFilterMenu && (
                <div className="absolute left-0 sm:right-0 top-full mt-2 w-48 sm:w-52 bg-white border-2 border-[#d4b896] rounded-lg shadow-lg z-20 max-w-[calc(100vw-2rem)]">
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-600 mb-2">
                      Filter by Status
                    </div>
                    {[
                      { value: 'All', label: 'All Status' },
                      { value: 'Paid', label: 'Paid' },
                      { value: 'Pending', label: 'Pending' },
                      { value: 'Overdue', label: 'Overdue' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setStatusFilter(option.value);
                          setShowFilterMenu(false);
                          setCurrentPage(1); // Reset to first page
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 transition-colors ${
                          statusFilter === option.value ? 'text-[#d4b896] bg-[#d4b896]/10' : 'text-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sort Button */}
            <div className="relative">
              <button 
                onClick={() => setSortMenu(!showSortMenu)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm md:text-base text-gray-600 hover:text-black transition-colors border border-[#d4b896] rounded-lg min-w-0"
              >
                <span className="material-symbols-outlined text-lg sm:text-xl">swap_vert</span>
                <span className="hidden sm:inline whitespace-nowrap">Sort</span>
                <span className="sm:hidden text-xs">Sort</span>
                {sortOrder && (
                  <span className="w-2 h-2 bg-[#d4b896] rounded-full flex-shrink-0"></span>
                )}
              </button>

              {/* Sort Dropdown */}
              {showSortMenu && (
                <div className="absolute left-0 sm:right-0 top-full mt-2 w-48 sm:w-52 bg-white border-2 border-[#d4b896] rounded-lg shadow-lg z-20 max-w-[calc(100vw-2rem)]">
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-600 mb-2">
                      Sort by Client Name
                    </div>
                    <button
                      onClick={handleSort}
                      className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 transition-colors flex items-center justify-between text-gray-700"
                    >
                      <span>
                        {sortOrder === null ? 'Default Order' : 
                         sortOrder === 'asc' ? 'A to Z' : 'Z to A'}
                      </span>
                      {sortOrder && (
                        <span className="material-symbols-outlined text-sm text-[#d4b896]">
                          {sortOrder === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Items per page selector */}
            <div className="relative">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1); // Reset to first page
                }}
                className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm md:text-base text-gray-600 border border-[#d4b896] rounded-lg focus:outline-none focus:border-[#c4a886] min-w-0"
              >
                <option value={10}>10/hal</option>
                <option value={25}>25/hal</option>
                <option value={50}>50/hal</option>
                <option value={100}>100/hal</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-[#d4b896]">
              <th className="px-6 py-4 text-left text-xs font-medium text-[#d4b896] uppercase">
                Invoice ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-[#d4b896] uppercase">
                Client
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-[#d4b896] uppercase">
                Tanggal Diterbitkan
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-[#d4b896] uppercase">
                Total
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-[#d4b896] uppercase">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-[#d4b896] uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d4b896]/30">
            {currentInvoices.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  {searchQuery || statusFilter !== "All"
                    ? "No invoices found matching your criteria."
                    : "No invoices yet."}
                </td>
              </tr>
            ) : (
              currentInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-black font-medium">
                        {invoice.invoiceNumber}
                      </p>
                      <p className="text-xs text-gray-600">
                        DP{invoice.paymentNumber}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-black">{invoice.clientName}</p>
                      <p className="text-xs text-gray-600">
                        {invoice.orderNumber}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {invoice.issueDate}
                  </td>
                  <td className="px-6 py-4 text-black font-semibold">
                    {formatCurrency(invoice.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        invoice.status
                      )}`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                        title="View invoice"
                      >
                        <span className="material-symbols-outlined text-xl">
                          visibility
                        </span>
                      </Link>
                      <button
                        onClick={() => {
                          const printWindow = window.open(
                            `/invoices/${invoice.id}`,
                            "_blank"
                          );
                          if (printWindow) {
                            printWindow.onload = () => {
                              setTimeout(() => printWindow.print(), 500);
                            };
                          }
                        }}
                        className="p-2 text-gray-500 hover:text-[#d4b896] transition-colors"
                        title="Print Invoice"
                      >
                        <span className="material-symbols-outlined text-xl">
                          print
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {sortedInvoices.length > 0 && (
        <div className="px-6 py-4 border-t border-[#d4b896] flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-600">
            Menampilkan {startIndex + 1}-
            {Math.min(endIndex, sortedInvoices.length)} of{" "}
            {sortedInvoices.length} invoices
            {(searchQuery || statusFilter !== 'All' || sortOrder) && (
              <span className="ml-2 text-xs">
                (filtered/sorted)
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-2 sm:px-3 md:px-4 py-2 text-xs sm:text-sm text-gray-600 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-[#d4b896] rounded-lg min-w-0"
            >
              <span className="material-symbols-outlined text-lg sm:text-xl">chevron_left</span>
              <span className="hidden sm:inline whitespace-nowrap">Sebelumnya</span>
              <span className="sm:hidden text-xs">Prev</span>
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-2 sm:px-3 md:px-4 py-2 text-xs sm:text-sm text-gray-600 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-[#d4b896] rounded-lg min-w-0"
            >
              <span className="hidden sm:inline whitespace-nowrap">Selanjutnya</span>
              <span className="sm:hidden text-xs">Next</span>
              <span className="material-symbols-outlined text-lg sm:text-xl">chevron_right</span>
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close dropdowns */}
      {(showFilterMenu || showSortMenu) && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => {
            setShowFilterMenu(false);
            setSortMenu(false);
          }}
        />
      )}
    </div>
  );
}
