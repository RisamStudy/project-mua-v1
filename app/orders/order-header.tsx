"use client";

import Link from 'next/link';

export default function OrdersHeader() {
  return (
    <div className="mb-6 md:mb-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Daftar Pesanan & Manajemen
          </h1>
          <p className="text-sm md:text-base text-gray-400">
            Kelola semua pesanan klien, lacak pembayaran, dan lihat detail.
          </p>
        </div>
        <Link
          href="/orders/new"
          className="flex items-center justify-center gap-2 bg-[#d4b896] hover:bg-[#c4a886] text-black px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors w-full sm:w-auto"
        >
          <span className="material-symbols-outlined">add</span>
          <span className="hidden sm:inline">Buat Pesanan Baru</span>
          <span className="sm:hidden">Buat Pesanan</span>
        </Link>
      </div>
    </div>
  );
}