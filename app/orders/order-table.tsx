"use client";

import { useState } from 'react';
import Link from 'next/link';
import DeleteModal from '@/components/ui/delete-modal';
import Toast from '@/components/ui/toast';

interface Order {
  id: string;
  orderNumber: string;
  brideName: string;
  groomName: string;
  totalAmount: string;
  paidAmount: string;
  remainingAmount: string;
  paymentStatus: string;
  dp1: string;
  dp2: string;
}

export default function OrdersTable({ orders }: { orders: Order[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    orderId: string | null;
    orderNumber: string | null;
  }>({
    isOpen: false,
    orderId: null,
    orderNumber: null,
  });
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  const filteredOrders = orders.filter(
    (order) =>
      order.brideName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.groomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: string) => {
    return `Rp ${parseFloat(amount).toLocaleString('id-ID')}`;
  };

  const handleDelete = async () => {
    if (!deleteModal.orderId) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/orders/${deleteModal.orderId}/delete`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDeleteModal({ isOpen: false, orderId: null, orderNumber: null });
        setToast({
          isOpen: true,
          message: 'Order deleted successfully',
          type: 'success',
        });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const data = await response.json();
        setToast({
          isOpen: true,
          message: data.message || 'Failed to delete order',
          type: 'error',
        });
      }
    } catch (error) {
      setToast({
        isOpen: true,
        message: 'Failed to delete order',
        type: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-[#0f0f0f] rounded-xl border border-[#2a2a2a] overflow-hidden">
        {/* Search */}
        <div className="p-4 sm:p-6 border-b border-[#2a2a2a]">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                search
              </span>
              <input
                type="text"
                placeholder="Cari pesanan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#d4b896]"
              />
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-3 text-gray-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined">filter_list</span>
                <span className="hidden sm:inline">Filter</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-3 text-gray-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined">swap_vert</span>
                <span className="hidden sm:inline">Urutkan</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                  Mempelai Wanita
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                  Mempelai Pria
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                  DP1
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                  DP2
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                  Sisa Pembayaran
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                  Status Pembayaran
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    {searchQuery ? 'Tidak ada pesanan yang ditemukan.' : 'Belum ada pesanan. Buat pesanan pertama!'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#1a1a1a] transition-colors">
                    <td className="px-6 py-4 text-white">{order.brideName}</td>
                    <td className="px-6 py-4 text-gray-300">{order.groomName}</td>
                    <td className="px-6 py-4 text-gray-300">{formatCurrency(order.dp1)}</td>
                    <td className="px-6 py-4 text-gray-300">{formatCurrency(order.dp2)}</td>
                    <td className="px-6 py-4 text-gray-300">{formatCurrency(order.remainingAmount)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.paymentStatus === 'Lunas'
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-yellow-500/10 text-yellow-500'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/orders/${order.id}`}
                          className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                          title="View details"
                        >
                          <span className="material-symbols-outlined text-xl">visibility</span>
                        </Link>
                        <Link
                          href={`/orders/${order.id}/edit`}
                          className="p-2 text-gray-400 hover:text-[#d4b896] transition-colors"
                          title="Edit order"
                        >
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </Link>
                        <button
                          onClick={() => setDeleteModal({
                            isOpen: true,
                            orderId: order.id,
                            orderNumber: order.orderNumber,
                          })}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete order"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, orderId: null, orderNumber: null })}
        onConfirm={handleDelete}
        title="Delete Order"
        description={`Apakah Anda yakin ingin menghapus pesanan ${deleteModal.orderNumber}? Tindakan ini tidak dapat dibatalkan.`}
        loading={deleting}
      />

      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />
    </>
  );
}