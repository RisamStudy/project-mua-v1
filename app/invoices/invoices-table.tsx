"use client";

import { useState } from 'react';
import Link from 'next/link';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: string) => {
    return `RP. ${parseFloat(amount).toLocaleString('id-ID', { minimumFractionDigits: 2 })}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-500/10 text-green-500';
      case 'Pending':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'Overdue':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="bg-[#0f0f0f] rounded-xl border border-[#2a2a2a] overflow-hidden">
      {/* Search and Filters */}
      <div className="p-4 sm:p-6 border-b border-[#2a2a2a]">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              search
            </span>
            <input
              type="text"
              placeholder="Search by client name, invoice #"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#d4b896]"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-[#d4b896]"
            >
              <option value="All">Status: All</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-[#2a2a2a]">
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                Invoice ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                Client
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                Tanggal Diterbitkan
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                Total
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a2a]">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  {searchQuery || statusFilter !== 'All'
                    ? 'No invoices found matching your criteria.'
                    : 'No invoices yet.'}
                </td>
              </tr>
            ) : (
              filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-[#1a1a1a] transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-gray-400">DP{invoice.paymentNumber}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white">{invoice.clientName}</p>
                      <p className="text-xs text-gray-400">{invoice.orderNumber}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{invoice.issueDate}</td>
                  <td className="px-6 py-4 text-white font-semibold">
                    {formatCurrency(invoice.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                        title="View invoice"
                      >
                        <span className="material-symbols-outlined text-xl">visibility</span>
                      </Link>
                      <button
                        onClick={() => window.open(`/invoices/${invoice.id}/download`, '_blank')}
                        className="p-2 text-gray-400 hover:text-[#d4b896] transition-colors"
                        title="Download PDF"
                      >
                        <span className="material-symbols-outlined text-xl">download</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Info */}
      {filteredInvoices.length > 0 && (
        <div className="px-6 py-4 border-t border-[#2a2a2a] text-sm text-gray-400">
          Showing 1 to {filteredInvoices.length} of {filteredInvoices.length} invoices
        </div>
      )}
    </div>
  );
}