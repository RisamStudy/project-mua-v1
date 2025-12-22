"use client";

import { useState, useEffect } from "react";
import { OrderWithClient } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Eye, Edit, Trash2, Printer, Search } from "lucide-react";
import Link from "next/link";

interface OrdersTableProps {
  initialOrders: OrderWithClient[];
  total: number;
}

export default function OrdersTable({
  initialOrders,
  total,
}: OrdersTableProps) {
  const [orders, setOrders] = useState<OrderWithClient[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(Math.ceil(total / 10));

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await fetch(`/api/orders/list?${params}`);
      const data = await response.json();

      setOrders(data.orders);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "LUNAS":
        return "bg-green-100 text-green-800 border-green-200";
      case "DP1":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "DP2":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    try {
      const response = await fetch(`/api/orders/${orderId}/delete`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header dengan Search dan Filter */}
      <div className="p-6 border-b">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Order Management
            </h2>
            <p className="text-gray-600">
              Manage all client orders and track payments
            </p>
          </div>

          <Link
            href="/orders/new"
            className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            + New Order
          </Link>
        </div>

        {/* Search dan Filter */}
        <div className="mt-6 flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search orders by order number or client name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </form>

          <div className="flex gap-4">
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="DP1">DP1</option>
              <option value="DP2">DP2</option>
              <option value="LUNAS">LUNAS</option>
            </select>

            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Tabel Orders */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mempelai Wanita
              </th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mempelai Pria
              </th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event Date
              </th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Amount
              </th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Status
              </th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <span className="font-mono text-sm font-medium text-purple-600">
                      {order.orderNumber}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">
                      {order.client.brideName}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">
                      {order.client.groomName}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-500">
                    {formatDate(order.eventDate)}
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-bold text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        order.paymentStatus
                      )}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          window.open(
                            `/invoices/${order.id}/generate`,
                            "_blank"
                          )
                        }
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Print Invoice"
                      >
                        <Printer className="h-4 w-4" />
                      </button>

                      <Link
                        href={`/orders/${order.id}`}
                        className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>

                      <Link
                        href={`/orders/${order.id}/edit`}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                        title="Edit Order"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>

                      <button
                        onClick={() => handleDelete(order.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Order"
                      >
                        <Trash2 className="h-4 w-4" />
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
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing{" "}
            <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(currentPage * 10, total * 10)}
            </span>{" "}
            of <span className="font-medium">{total}</span> results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === pageNum
                      ? "bg-purple-600 text-white border-purple-600"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
